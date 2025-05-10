import { useEffect, useRef, useState } from 'react'

export interface FetchConfig<T, P = undefined> {
  fetchData: (params?: P) => Promise<{ data: Partial<Record<string, T[]>>; params?: P }>
  getInitialFetchState?: () => P
}

export function useFetchState<T, P = undefined>(config: FetchConfig<T, P>) {
  const [fetchState, setFetchState] = useState<P | undefined>(config.getInitialFetchState?.())
  const [isFetching, setIsFetching] = useState(false)
  const fetchList = useRef<Map<Promise<P>, boolean>>(new Map())

  const fetchData = async (init = false) => {
    const fetchPromise = new Promise<P>((resolve, reject) => {
      async function innerFetch() {
        setIsFetching(true)
        try {
          const _params = init ? config.getInitialFetchState?.() : fetchState
          if (init) {
            setFetchState(_params)
          }
          const { data, params } = await config.fetchData(_params)
          if (!fetchList.current.get(fetchPromise)) {
            throw new Error('fetch canceled')
          }
          const newParams = { ..._params, ...params } as P
          setFetchState(newParams)
          resolve({ ...data, ...newParams })
        } catch (err) {
          console.error(err)
          reject(err)
        } finally {
          setIsFetching(false)
          fetchList.current.delete(fetchPromise)
        }
      }

      innerFetch()
    })
    fetchList.current.set(fetchPromise, true)
    return fetchPromise
  }

  useEffect(() => {
    fetchList.current.forEach((value, key) => {
      // Set new values based on the existing values
      fetchList.current.set(key, false)
    })
    setFetchState(config.getInitialFetchState?.())
  }, [config])

  return { isFetching, fetchData, fetchState }
}
