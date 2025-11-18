// Re-export types
export type {
  // Data types
  IPost,
  IGroup,
  IUser,
  IPhoto,
  IPhotoSize,
  IAttachment,
  ILink,
  IVideo,
  BaseVk,
  // API types
  VKApiResponse,
  VKMethodResponseMap,
  VKMethodParamsMap,
  VKMethod,
  BatchRequest,
  MethodConfig,
  // Parameter types from VK API schema
  WallGetByIdParams,
  GroupsGetByIdParams,
  UsersGetParams,
} from './types'

export { VKNetworkError } from './types'

// Re-export utilities
export { isPost, biggestOf, postId, idOf } from './utils'

// Re-export API functions
export { getPosts, getGroups, getItems, getUsers } from './api'