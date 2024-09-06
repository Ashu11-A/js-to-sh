type RequestType = Omit<RequestInit, 'credentials'>

const originalFetch = fetch

const fetchNew = async (input: string | URL | globalThis.Request, init?: Omit<RequestInit, 'credentials'>): Promise<Response> => {
  return await originalFetch(input, init)
}

global.fetch = fetchNew
export { RequestType, fetchNew }
