import { parse, stringify } from 'lossless-json'

function parseNumberAndBigInt(value: string): number | bigint {
  if (Number.isInteger(value)) {
    if (Number.isSafeInteger(value)) {
      return parseInt(value)
    } else {
      return BigInt(value)
    }
  } else {
    return parseFloat(value)
  }
}

export default class JsonBigint {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parse(str: string): any {
    return parse(str, undefined, parseNumberAndBigInt)
  }

  static stringify = stringify
}
