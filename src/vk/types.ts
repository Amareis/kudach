import type {
  WallGetByIdResponse,
  WallGetByIdParams as VKWallGetByIdParams,
  GroupsGetByIdResponse,
  GroupsGetByIdParams as VKGroupsGetByIdParams,
  UsersGetResponse,
  UsersGetParams as VKUsersGetParams,
  BaseError,
} from '@vkontakte/api-schema-typescript'

export type Params = Record<string, string | number | undefined>

// Re-export parameter types with index signature for compatibility
export type WallGetByIdParams = VKWallGetByIdParams & Params
export type GroupsGetByIdParams = VKGroupsGetByIdParams & Params
export type UsersGetParams = VKUsersGetParams & Params

// Custom network error that matches BaseError interface
export class VKNetworkError implements BaseError {
  inner_type = 'base_error' as const
  error_code = -1
  error_msg: string
  error_text: string

  constructor(message: string) {
    this.error_msg = message
    this.error_text = message
  }
}

// VK API response is either success or error, never both
export type VKApiResponse<T> = {response: T; error?: never} | {response?: never; error: BaseError}

export interface BaseVk {
  id: number
}

export interface IPost extends BaseVk {
  owner_id: number
  attachments: IAttachment[]
  copy_history?: IPost[]
  text: string
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

// Type-safe method names
export type VKMethod = 'wall.getById' | 'groups.getById' | 'users.get'

// Map method names to their response types
export interface VKMethodResponseMap {
  'wall.getById': WallGetByIdResponse
  'groups.getById': GroupsGetByIdResponse
  'users.get': UsersGetResponse
}

// Map method names to their parameter types
export interface VKMethodParamsMap {
  'wall.getById': WallGetByIdParams
  'groups.getById': GroupsGetByIdParams
  'users.get': UsersGetParams
}

export interface BatchRequest<M extends VKMethod = VKMethod> {
  method: M
  ids: string[]
  params: VKMethodParamsMap[M]
  resolve: (data: VKMethodResponseMap[M]) => void
  reject: (error: any) => void
}

export interface MethodConfig {
  idParam: string // Parameter name for IDs (e.g., 'posts', 'group_ids')
  batchableParams: string[] // Params that should be included in batch key
}
