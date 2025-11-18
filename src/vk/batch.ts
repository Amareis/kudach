import jsonp from 'jsonp'
import type {
  VKMethod,
  VKMethodResponseMap,
  VKMethodParamsMap,
  BatchRequest,
  MethodConfig,
  VKApiResponse,
} from './types'
import {VKNetworkError} from './types'

type Params = Record<string, string | number | undefined>

const token = 'fbfc9ee3fbfc9ee3fbfc9ee379f8c05c83ffbfcfbfc9ee392efdf13fba9e67b2b7033a9'

// Batching system configuration
const BATCH_DELAY = 50 // ms to wait before sending batch
const MAX_BATCH_SIZE = 100 // VK API limit for batch requests

// Configuration for each VK API method - easily extensible
export const METHOD_CONFIGS: Record<VKMethod, MethodConfig> = {
  'wall.getById': {
    idParam: 'posts',
    batchableParams: [], // No additional params affect batching
  },
  'groups.getById': {
    idParam: 'group_ids',
    batchableParams: ['fields'], // Different 'fields' values = different batches
  },
  'users.get': {
    idParam: 'user_ids',
    batchableParams: ['fields'], // Different 'fields' values = different batches
  },
}

const batchQueues: Map<string, BatchRequest[]> = new Map()
const batchTimers: Map<string, NodeJS.Timeout> = new Map()

function encode(obj: Params) {
  const str = []
  for (const [k, v] of Object.entries(obj))
    if (v !== undefined) str.push(encodeURIComponent(k) + '=' + encodeURIComponent(v))
  return str.join('&')
}

function getBatchKey<M extends VKMethod>(method: M, params: Params): string {
  const config = METHOD_CONFIGS[method]

  // Build key from method and batchable params only
  const keyParts: any[] = [method]

  for (const paramName of config.batchableParams) {
    if (params[paramName] !== undefined) {
      keyParts.push([paramName, params[paramName]])
    }
  }

  return JSON.stringify(keyParts)
}

function getMethodConfig<M extends VKMethod>(method: M): MethodConfig {
  return METHOD_CONFIGS[method]
}

function processBatch<M extends VKMethod>(batchKey: string) {
  const queue = batchQueues.get(batchKey) as BatchRequest<M>[] | undefined
  if (!queue || queue.length === 0) return

  const batch = queue.splice(0, MAX_BATCH_SIZE) as BatchRequest<M>[]
  const allIds = batch.flatMap((req) => req.ids)
  const {method, params} = batch[0]

  const config = getMethodConfig(method)
  const batchParams = {
    ...params,
    [config.idParam]: allIds.join(','),
  }

  const url = `https://api.vk.com/method/${method}?v=5.199&access_token=${token}&${encode(batchParams)}`

  jsonp(url, (err, data: VKApiResponse<VKMethodResponseMap[M]>) => {
    if (err) {
      console.error('[VK API Batch] Request error:', err)
      const networkError = new VKNetworkError(err.message || 'Network request failed')
      batch.forEach((req) => req.reject(networkError))
    } else if (data.error) {
      console.error('[VK API Batch] API error:', data.error)
      batch.forEach((req) => req.reject(data.error))
    } else {
      // Each request gets the full response - filtering happens in api.ts
      // This is intentional: api.ts functions handle ID matching and ordering
      batch.forEach((req) => req.resolve(data.response))
    }
  })

  // Process remaining items if any
  if (queue.length > 0) {
    setTimeout(() => processBatch(batchKey), 350) // Rate limit delay
  }
}

export function get<M extends VKMethod>(
  m: M,
  params: VKMethodParamsMap[M],
): Promise<VKMethodResponseMap[M]> {
  return new Promise<VKMethodResponseMap[M]>((resolve, reject) => {
    const config = getMethodConfig(m)
    const batchKey = getBatchKey(m, params)

    // Extract IDs from params using method config
    const idsParam = params[config.idParam]
    const ids: string[] = idsParam ? String(idsParam).split(',') : []

    // If no IDs to batch, make direct request
    if (ids.length === 0) {
      const url = `https://api.vk.com/method/${m}?v=5.199&access_token=${token}&${encode(params)}`
      jsonp(url, (err, data: VKApiResponse<VKMethodResponseMap[M]>) => {
        if (err) {
          console.error('[VK API] Request error:', err)
          reject(new VKNetworkError(err.message || 'Network request failed'))
        } else if (data.error) {
          console.error('[VK API] API error:', {
            code: data.error.error_code,
            msg: data.error.error_msg,
            text: data.error.error_text,
          })
          reject(data.error)
        } else {
          resolve(data.response)
        }
      })
      return
    }

    // Add to batch queue
    if (!batchQueues.has(batchKey)) {
      batchQueues.set(batchKey, [])
    }

    const queue = batchQueues.get(batchKey)!
    queue.push({
      method: m,
      ids,
      params,
      resolve: resolve as (data: any) => void,
      reject,
    } as BatchRequest)

    // Clear existing timer and set new one
    if (batchTimers.has(batchKey)) {
      clearTimeout(batchTimers.get(batchKey)!)
    }

    const timer = setTimeout(() => {
      batchTimers.delete(batchKey)
      processBatch(batchKey)
    }, BATCH_DELAY)

    batchTimers.set(batchKey, timer)
  })
}
