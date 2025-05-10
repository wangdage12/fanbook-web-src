import AppRoutes from './AppRoutes'

export enum HomeContentType {
  Dm,
  Guild,
  Discovery,
  Unknown,
}

export function getHomeContentType(pathname: string): HomeContentType {
  if (pathname.startsWith(AppRoutes.DISCOVERY)) {
    return HomeContentType.Discovery
  }
  if (pathname.startsWith(`${AppRoutes.CHANNELS}/${AppRoutes.AT_ME}`)) {
    return HomeContentType.Dm
  }
  if (pathname.startsWith(AppRoutes.CHANNELS)) {
    return HomeContentType.Guild
  }
  return HomeContentType.Unknown
}
