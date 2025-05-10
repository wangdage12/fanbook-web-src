const _dictionary: { [key: string]: string } = {
  A: 'w',
  B: 'x',
  C: 'y',
  D: 'z',
  E: 'U',
  F: '1',
  G: '2',
  H: 'X',
  I: 'Y',
  J: '5',
  K: 'a',
  L: 'b',
  M: '8',
  N: 'd',
  O: '+',
  P: 'f',
  g: 'Q',
  h: 'R',
  i: 'S',
  j: 'T',
  k: '0',
  l: 'V',
  m: 'W',
  n: '3',
  o: '4',
  p: 'Z',
  q: '6',
  r: '7',
  s: 'c',
  t: '9',
  u: 'e',
  v: '/',
  w: 'A',
  x: 'B',
  y: 'C',
  z: 'D',
  U: 'E',
  '1': 'F',
  '2': 'G',
  X: 'H',
  Y: 'I',
  '5': 'J',
  a: 'K',
  b: 'L',
  '8': 'M',
  d: 'N',
  '+': 'O',
  f: 'P',
  Q: 'g',
  R: 'h',
  S: 'i',
  T: 'j',
  '0': 'k',
  V: 'l',
  W: 'm',
  '3': 'n',
  '4': 'o',
  Z: 'p',
  '6': 'q',
  '7': 'r',
  c: 's',
  '9': 't',
  e: 'u',
  '/': 'v',
}

function utf8Encode(origin: string) {
  const encodedString = unescape(encodeURIComponent(origin))
  const utf8Array = new Uint8Array(encodedString.length)
  for (let i = 0; i < encodedString.length; i++) {
    utf8Array[i] = encodedString.charCodeAt(i)
  }
  return utf8Array
}

function uint8ArrayToBase64(utf8Array: Uint8Array) {
  let binaryString = ''
  utf8Array.forEach(byte => {
    binaryString += String.fromCharCode(byte)
  })

  return btoa(binaryString)
}

function fbEncrypt(origin: string): string {
  const b64 = uint8ArrayToBase64(utf8Encode(origin))
  let encrypted = ''
  for (let i = 0; i < b64.length; i++) {
    const c = b64.charAt(i)
    // eslint-disable-next-line no-prototype-builtins
    if (_dictionary.hasOwnProperty(c)) {
      encrypted += _dictionary[c]
    } else {
      encrypted += c
    }
  }
  return encrypted
}

export { fbEncrypt }
