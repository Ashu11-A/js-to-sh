import Dispatcher from 'node_modules/undici-types/dispatcher.js'
import { BodyInit, HeadersInit, ReferrerPolicy, RequestDuplex, RequestMode, RequestRedirect } from 'node_modules/undici-types/fetch.js'

interface RequestType {
    method?: string
    keepalive?: boolean
    headers?: HeadersInit
    body?: BodyInit | null
    redirect?: RequestRedirect
    integrity?: string
    signal?: AbortSignal | null
    // credentials?: RequestCredentials
    mode?: RequestMode
    referrer?: string
    referrerPolicy?: ReferrerPolicy
    window?: null
    dispatcher?: typeof Dispatcher
    duplex?: RequestDuplex
  }

const fetchNew = async (input: string | URL | globalThis.Request, init?: Omit<RequestInit, 'credentials'>): Promise<Response> => {
  return await fetch(input, init)
}

global.fetchShell = fetchNew
export { fetchNew as fetch, RequestType }
