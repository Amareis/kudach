/**
 * Yandex Cloud Function для VK OAuth авторизации
 *
 * Переменные окружения:
 * - VK_APP_ID: ID приложения VK
 * - VK_APP_SECRET: Secret приложения VK (не используется в PKCE)
 * - FIREBASE_PROJECT_ID: ID Firebase проекта
 * - FIREBASE_PRIVATE_KEY: Private key для Firebase Admin
 * - FIREBASE_CLIENT_EMAIL: Client email для Firebase Admin
 */

const admin = require('firebase-admin')

// Инициализация Firebase Admin (один раз)
let firebaseInitialized = false

function initFirebase() {
  if (firebaseInitialized) return

  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  })

  firebaseInitialized = true
}

/**
 * Обменивает code на access_token в VK ID (новый API)
 */
async function vkAuth(code, codeVerifier, redirectUri, state, deviceId) {
  const clientId = process.env.VK_APP_ID

  console.log('VK Auth request params:')
  console.log('- client_id:', clientId)
  console.log('- code:', code)
  console.log('- code_verifier length:', codeVerifier?.length)
  console.log('- redirect_uri:', redirectUri)
  console.log('- state:', state)
  console.log('- device_id:', deviceId)

  // Формируем POST данные согласно новому VK ID API
  const postData = new URLSearchParams({
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
    code: code,
    client_id: clientId,
    device_id: deviceId || '',
    state: state,
  })

  console.log('POST data:', postData.toString().replace(codeVerifier, '***'))

  // Используем новый endpoint VK ID
  const url = 'https://id.vk.ru/oauth2/auth'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: postData.toString(),
  })

  const data = await response.json()

  console.log('VK response status:', response.status)
  console.log('VK response data:', JSON.stringify(data, null, 2))

  if (!response.ok) {
    throw {
      statusCode: response.status,
      body: JSON.stringify(data),
      message: data.error_description || data.error || 'VK API error',
    }
  }

  return data
}

/**
 * Получает информацию о пользователе VK
 */
async function getVkUser(accessToken, userId) {
  const url =
    `https://api.vk.com/method/users.get?` +
    `v=5.199&` +
    `access_token=${accessToken}&` +
    `user_ids=${userId}`

  const response = await fetch(url)
  const data = await response.json()

  console.log('VK users.get response:', JSON.stringify(data, null, 2))

  if (!response.ok || data.error) {
    throw {
      statusCode: response.status,
      body: JSON.stringify(data),
      message: data.error?.error_msg || 'VK API error',
    }
  }

  return data.response[0]
}

/**
 * Основной обработчик функции
 */
module.exports.handler = async function (event, context) {
  // Инициализируем Firebase
  initFirebase()

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // Обработка preflight запроса
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    // Получаем параметры из query string
    const params = event.queryStringParameters || {}
    const code = params.code
    const combinedState = params.state
    // Получаем device_id если есть
    const deviceId = params.device_id || ''

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Missing code parameter'}),
      }
    }

    if (!combinedState) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Missing state parameter'}),
      }
    }

    // Извлекаем state и code_verifier из combinedState
    // Формат: state---code_verifier
    const parts = combinedState.split('---')

    console.log('Received params:')
    console.log('- code:', code)
    console.log('- device_id:', deviceId)
    console.log('- combinedState:', combinedState)
    console.log('- parts length:', parts.length)

    if (parts.length !== 2) {
      console.error('Invalid state format, expected 2 parts, got:', parts.length)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Invalid state format', parts: parts.length}),
      }
    }

    const state = parts[0]
    const codeVerifier = parts[1]

    console.log('- state:', state)
    console.log('- code_verifier length:', codeVerifier?.length)

    // Определяем redirect_uri - это URL самой функции БЕЗ параметров
    // ВАЖНО: redirect_uri должен совпадать с тем, что был передан в VK
    // Используем FUNCTION_URL из переменных окружения, если есть
    let redirectUri

    if (process.env.FUNCTION_URL) {
      // Используем полный URL функции из переменной окружения
      redirectUri = process.env.FUNCTION_URL
      console.log('Using FUNCTION_URL from env:', redirectUri)
    } else {
      // Fallback: строим URL из заголовков запроса
      console.log('Event details:')
      console.log('- requestContext:', JSON.stringify(event.requestContext, null, 2))
      console.log('- headers:', JSON.stringify(event.headers, null, 2))

      const functionUrl = event.requestContext?.http?.path || '/authvk'
      const host = event.headers['host'] || 'functions.yandexcloud.net'
      const protocol = event.headers['x-forwarded-proto'] || 'https'

      redirectUri = `${protocol}://${host}${functionUrl}`

      console.log('Constructed redirect_uri from headers:')
      console.log('- protocol:', protocol)
      console.log('- host:', host)
      console.log('- functionUrl:', functionUrl)
    }

    console.log('Final redirect_uri:', redirectUri)

    // Обмениваем code на access_token используя новый VK ID API
    const vkResponse = await vkAuth(code, codeVerifier, redirectUri, state, deviceId)

    console.log('VK auth successful!')
    console.log('Response keys:', Object.keys(vkResponse))

    // В новом VK ID API user_id может быть в разных полях
    const userId = String(vkResponse.user_id || vkResponse.userId || vkResponse.id || '')
    const accessToken = vkResponse.access_token

    if (!userId) {
      console.error('No user_id in VK response:', vkResponse)
      throw new Error('No user_id in VK response')
    }

    if (!accessToken) {
      console.error('No access_token in VK response:', vkResponse)
      throw new Error('No access_token in VK response')
    }

    console.log('- user_id:', userId)
    console.log('- access_token length:', accessToken?.length)

    // Получаем информацию о пользователе
    const vkUser = await getVkUser(accessToken, userId)

    console.log('VK user info:', vkUser)

    // Сохраняем/обновляем пользователя в Firestore
    const db = admin.firestore()
    const userDoc = db.collection('users').doc(userId)
    const userSnapshot = await userDoc.get()

    await userDoc.set(
      {
        id: userId,
        name: `${vkUser.first_name} ${vkUser.last_name}`,
        ...(userSnapshot.exists ? {} : {registerAt: admin.firestore.Timestamp.now()}),
      },
      {merge: true},
    )

    console.log('User saved to Firestore')

    // Создаем custom token для Firebase Auth
    const firebaseToken = await admin.auth().createCustomToken(userId)

    console.log('Firebase token created')

    // Возвращаем HTML с токеном (для popup окна)
    // Используем postMessage для передачи токена в родительское окно
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Авторизация</title>
        </head>
        <body>
          <script>
            // Отправляем токен в родительское окно через postMessage
            if (window.opener) {
              window.opener.postMessage({
                type: 'vk_auth_success',
                token: '${firebaseToken}'
              }, '*');
            }
            setTimeout(function() {
              window.close();
            }, 100);
          </script>
          <p>Авторизация успешна! Окно закроется автоматически...</p>
        </body>
        </html>
      `,
    }
  } catch (error) {
    console.error('Auth error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))

    // Формируем детальное сообщение об ошибке
    let errorMessage = 'Unknown error'
    let errorDetails = ''

    if (error.message) {
      errorMessage = error.message
    }

    if (error.statusCode) {
      errorDetails += `HTTP Status: ${error.statusCode}\n`
    }

    if (error.body) {
      try {
        const bodyObj = JSON.parse(error.body)
        errorDetails += `Response: ${JSON.stringify(bodyObj, null, 2)}\n`
      } catch (e) {
        errorDetails += `Response: ${error.body}\n`
      }
    }

    if (error.stack) {
      errorDetails += `Stack: ${error.stack}\n`
    }

    // Экранируем кавычки и переносы строк для JavaScript
    const safeErrorMessage = String(errorMessage || 'Unknown error')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')

    const safeErrorDetails = String(errorDetails || '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Ошибка авторизации</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            pre { background: #f5f5f5; padding: 10px; overflow: auto; }
          </style>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'vk_auth_error',
                error: '${safeErrorMessage}',
                details: '${safeErrorDetails}'
              }, '*');
            }
            setTimeout(function() {
              window.close();
            }, 5000);
          </script>
          <h3>Ошибка авторизации</h3>
          <p><strong>Сообщение:</strong> ${errorMessage}</p>
          ${errorDetails ? `<pre>${errorDetails}</pre>` : ''}
          <p><em>Окно закроется через 5 секунд...</em></p>
        </body>
        </html>
      `,
    }
  }
}
