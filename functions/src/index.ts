import * as functions from 'firebase-functions'
import admin from 'firebase-admin'

import req from 'request'

admin.initializeApp()

function send(url: string) {
  return new Promise<any>((resolve, reject) =>
    req(url, (err, resp) => {
      if (err) reject(err)
      else if (resp.statusCode !== 200) reject({code: resp.statusCode, body: resp.body})
      else resolve(JSON.parse(resp.body))
    }),
  )
}

function vkAuth(code: string, host: string) {
  const secret = functions.config().vkapp.secret

  const url =
    `https://oauth.vk.com/access_token?client_id=7102165` +
    `&client_secret=${secret}&code=${code}&redirect_uri=${host}/authvk`

  return send(url)
}

type Params = Record<string, string | number | undefined>

function encode(obj: Params) {
  let str = []
  for (let [k, v] of Object.entries(obj))
    if (v !== undefined) str.push(encodeURIComponent(k) + '=' + encodeURIComponent(v))
  return str.join('&')
}

function get(m: string, token: string, params: Params) {
  const url = `https://api.vk.com/method/${m}?v=5.101&access_token=${token}&${encode(params)}`
  return send(url).then(d => d.response)
}

export const authvk = functions.https.onRequest(async (request, response) => {
  if (!request.query.code) {
    response.send('invalid code')
    return
  }
  const hosts = request.headers['x-redirect-host']
  const host = hosts ? (Array.isArray(hosts) ? hosts[0] : hosts) : 'https://kuda.ch'
  const code = request.query.code

  try {
    const {access_token, user_id} = await vkAuth(code, host)
    const id = String(user_id)
    const [user] = await get('users.get', access_token, {user_ids: id})

    await admin
      .firestore()
      .collection('users')
      .doc(String(id))
      .set({id, name: user.first_name + ' ' + user.last_name}, {merge: true})

    const token = await admin.auth().createCustomToken(id)
    response.cookie('firetoken', token)
    response.send('<script>onload=function(){setTimeout(close, 100)}</script>')
  } catch (e) {
    response.cookie('firetoken', 'no')
    response.send('error: ' + JSON.stringify(e))
  }
})
