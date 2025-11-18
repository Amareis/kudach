import type { IPost, IPhoto, IGroup, BaseVk } from './types'

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