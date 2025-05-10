import { useEffect } from 'react'
import { contactWsHandler, WsHandlerParams } from './contact-list-ws'

export function useWsService(handlers: WsHandlerParams, deps?: React.DependencyList) {
  useEffect(() => {
    const clear = contactWsHandler(handlers)
    return () => {
      clear()
    }
  }, deps)
}
