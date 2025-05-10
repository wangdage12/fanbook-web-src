import localForage from 'localforage'

typeof window !== 'undefined' &&
  localForage.config({
    driver: localForage.INDEXEDDB,
  })

export const localForageMap = new Map<string, typeof localForage>()

export function getVersion(versionString?: string) {
  return (versionString ?? '0.0.0')
    .split('.')
    .map(Number)
    .reduce((acc, curr) => {
      return acc * 1000 + curr
    }, 0)
}

export function getLocalForageInstance({ storeName, version, name = 'fanbook' }: { storeName: string; version: number; name?: string }) {
  let forage = localForageMap.get(`${storeName}_${version}`)
  if (forage) {
    return forage
  }
  forage = localForage.createInstance({
    name,
    storeName,
    version,
  })
  localForageMap.set(`${storeName}_${version}`, forage)
  return forage
}
