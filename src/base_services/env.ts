// export enum Env {
//   dev = "dev",
//   dev2 = "dev2",
//   test = "test",
//   sandbox = "sandbox",
//   prerelease = "prerelease",
//   production = "production",
// }
console.log(`v${import.meta.env.FANBOOK_VERSION}+${import.meta.env.FANBOOK_BUILD_NUMBER}`)
console.log(`Release: ${import.meta.env.FANBOOK_WEB_RELEASE}`)
console.log('Local environment: ', import.meta.env.MODE)

if (location.host === 'web.fanbook.cn' && localStorage.getItem('debug') !== 'true') {
  console.log =
    console.info =
    console.warn =
      () => {
        /**/
      }
}
