import { useSyncExternalStore } from 'react'
import environmentSpecificDraftBox from '../utils/EnvironmentSpecificDraftBox.ts'

export default function useEnvironmentSpecificDraftBox<T>(key: string): T | undefined {
  return useSyncExternalStore<T | undefined>(subscribe, getSnapshot)

  function subscribe(callback: () => void) {
    function innerCallback(k: string) {
      if (k === key) {
        callback()
      }
    }
    environmentSpecificDraftBox.on('update', innerCallback)
    return () => {
      environmentSpecificDraftBox.off('update', innerCallback)
    }
  }

  function getSnapshot() {
    return environmentSpecificDraftBox.get<T>(key)
  }
}
