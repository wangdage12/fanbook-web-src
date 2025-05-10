import { Modal } from 'antd'
import { isEqual } from 'lodash-es'
import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { Location, useLocation } from 'react-router-dom'
import { behaviorSubject, useBehaviorSubject } from './routeCheck.tsx'

type LocationTrans = {
  from?: Location
  to?: Location
}

interface LocationContextProps {
  locationTrans: React.MutableRefObject<LocationTrans>
  time: number
}

export const currentLocation: { current: Location | null } = {
  current: null,
}

export const LocationContext = createContext<LocationContextProps | null>(null)

export function WithLocation({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const fromRoot = location.state?.fromRoot ?? false
  const locationState = useRef<LocationTrans>({})
  const context = useMemo(() => {
    if (!isEqual(location, locationState.current.to)) {
      locationState.current.from = locationState.current.to
      locationState.current.to = location
      !fromRoot && !behaviorSubject.isRunning() && Modal.destroyAll()
    }
    // currentLocation.current = location
    return {
      locationTrans: locationState,
      time: Date.now(),
    }
  }, [location])

  useEffect(() => {
    currentLocation.current = location
  }, [location])

  useBehaviorSubject(location)
  return <LocationContext.Provider value={context}>{children}</LocationContext.Provider>
}

export function useLocationConsumer() {
  const context = useContext(LocationContext)
  return context
}
