// We want to make event listeners non-passive, and to do so have to check
// that browsers support EventListenerOptions in the first place.
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
let passiveSupported = false
try {
  const options = {
    get passive() {
      passiveSupported = true
      return true
    },
  } as EventListenerOptions

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const test = () => {}

  window.addEventListener('click', test, options)
  window.removeEventListener('click', test, options)
} catch {
  passiveSupported = false
}

function makePassiveEventOption(passive: boolean) {
  return passiveSupported ? ({ passive } as EventListenerOptions) : passive
}

export default makePassiveEventOption
