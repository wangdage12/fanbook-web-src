import { useEffect } from 'react'
import { Location, useSearchParams } from 'react-router-dom'
import { BehaviorSubject } from '../../utils/behavior_subject/BehaviorSubject'

export type BehaviorParams = Record<string, any>

export const behaviorSubject: BehaviorSubject<BehaviorParams> = new BehaviorSubject<BehaviorParams>({})

export function useBehaviorSubject(location: Location) {
  const [URLSearchParams] = useSearchParams()
  useEffect(() => {
    behaviorSubject.setValue(Object.fromEntries(URLSearchParams.entries()))
  }, [location])
}
