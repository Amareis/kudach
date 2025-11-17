import jsonp from 'jsonp'

type Params = Record<string, string | number | undefined>

interface BaseVk {
  id: number
}

export interface IPost extends BaseVk {
  owner_id: number
  attachments: IAttachment[]
  copy_history?: IPost[]
}

export interface IGroup extends BaseVk {
  screen_name: string
  name: string
  photo_50: string
  description?: string
  crop_photo?: {
    photo: IPhoto
  }
}

export interface IUser extends BaseVk {
  first_name: string
  last_name: string
  photo_50: string
}

export interface IPhotoSize {
  width: number
  height: number
  url: string
}

export interface IPhoto {
  sizes: IPhotoSize[]
}

export type IAttachment =
  | {type: 'photo'; photo: IPhoto}
  | {type: 'video'; video: IVideo}
  | {type: 'link'; link: ILink}

export interface ILink {
  photo?: IPhoto
}

export interface IVideo {
  photo_130: string
  photo_320: string
  photo_640?: string
  photo_800?: string
  photo_1280?: string
}

export function isPost(item: BaseVk): item is IPost {
  return 'owner_id' in item
}

export function biggestOf(photo: IPhoto) {
  return Array.from(photo.sizes).sort((a, b) => b.width - a.width)[0]
}

export function postId(post: IPost) {
  return post.owner_id + '_' + post.id
}

export function idOf(item: IPost | IGroup) {
  if (isPost(item)) return postId(item)
  return String(item.id)
}

function encode(obj: Params) {
  const str = []
  for (const [k, v] of Object.entries(obj))
    if (v !== undefined) str.push(encodeURIComponent(k) + '=' + encodeURIComponent(v))
  return str.join('&')
}

const token = 'fbfc9ee3fbfc9ee3fbfc9ee379f8c05c83ffbfcfbfc9ee392efdf13fba9e67b2b7033a9'

function get<T = any>(m: string, params: Params) {
  const url = `https://api.vk.com/method/${m}?v=5.199&access_token=${token}&${encode(params)}`
  return new Promise<T>((resolve, reject) =>
    jsonp(url, (err, data) => {
      if (err) reject(err)
      else if (data.error) reject(data.error)
      else resolve(data.response)
    }),
  )
}

export async function getPosts(posts: Array<string | null> | string) {
  let ids
  if (Array.isArray(posts)) {
    ids = posts.filter((g) => !!g).join(',')
    posts = posts.join(',')
  } else ids = posts = String(posts)
  if (!ids) return []
  const res = await get<Array<IPost | null>>('wall.getById', {posts: ids})
  return posts.split(',').map((id) => res.find((p) => p && postId(p) === id) || null)
}

export async function getGroups(groups: Array<string | null> | string, full = false) {
  let ids
  if (Array.isArray(groups)) {
    ids = groups.filter((g) => !!g).join(',')
    groups = groups.join(',')
  } else ids = groups = String(groups)
  if (!ids) return []
  const res = await get<Array<IGroup | null>>('groups.getById', {
    group_ids: ids,
    fields: full ? 'description,crop_photo' : undefined,
  })
  return groups
    .split(',')
    .map((id) => res.find((g) => g && (g.id === +id || g.screen_name === id)) || null)
}

export async function getItems(items: Array<string | null> | string) {
  if (!items) return []
  if (!Array.isArray(items)) items = [String(items)]
  const groups = items.map((i) => (i && !i.includes('_') ? String(Math.abs(Number(i))) : ''))
  const posts = items.map((i) => (i && i.includes('_') ? i : ''))

  const [g, p] = await Promise.all([getGroups(groups, true), getPosts(posts)])
  return items.map((_, i) => g[i] || p[i])
}

export async function getUsers(users: Array<string | null> | string) {
  if (Array.isArray(users)) users = users.join(',')
  else users = String(users)
  if (!users) return []
  const res = await get<Array<IUser | null>>('users.get', {user_ids: users, fields: 'photo_50'})
  return users.split(',').map((id) => res.find((u) => u && u.id === +id) || null)
}
