import type {
  IPost,
  IGroup,
  IUser,
  WallGetByIdParams,
  GroupsGetByIdParams,
  UsersGetParams,
} from './types'
import {get} from './batch'
import {postId} from './utils'

export async function getPosts(posts: Array<string | null> | string) {
  let ids
  if (Array.isArray(posts)) {
    ids = posts.filter((g) => !!g).join(',')
    posts = posts.join(',')
  } else ids = posts = String(posts)
  if (!ids) return []

  const params: WallGetByIdParams = {posts: ids}
  const res = await get('wall.getById', params)

  // VK API returns response with 'items' field
  const items = (res.items || []) as IPost[]

  return posts.split(',').map((id) => items.find((p) => p && postId(p) === id) || null)
}

export async function getGroups(groups: Array<string | null> | string, full = false) {
  let ids
  if (Array.isArray(groups)) {
    ids = groups.filter((g) => !!g).join(',')
    groups = groups.join(',')
  } else ids = groups = String(groups)
  if (!ids) return []

  const params: GroupsGetByIdParams = {
    group_ids: ids,
    fields: full ? 'description,crop_photo' : undefined,
  }
  const res = await get('groups.getById', params)

  // VK API returns response with 'groups' field
  const items = (res.groups || []) as IGroup[]

  return groups
    .split(',')
    .map((id) => items.find((g) => g && (g.id === +id || g.screen_name === id)) || null)
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

  const params: UsersGetParams = {user_ids: users, fields: 'photo_50'}
  const res = await get('users.get', params)

  // VK API returns array directly for users.get
  const items = (res || []) as IUser[]

  return users.split(',').map((id) => items.find((u) => u && u.id === +id) || null)
}
