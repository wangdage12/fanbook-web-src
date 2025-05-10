function isJsonString(str: string) {
  const pattern = /^\s*[[{].*[\]}]\s*$/
  return pattern.test(str)
}

export function tryJSONParse<T>(content: string): [boolean, T | null] {
  if (typeof content === 'string' && isJsonString(content)) {
    try {
      const json = JSON.parse(content)
      return [true, json]
    } catch (err) {
      console.log('content parse failed, content:', content)
      return [false, null]
    }
  }
  return [false, null]
}

export function safeJSONParse<T>(content: string | T, defaultValue: T): T {
  if (typeof content !== 'string') {
    return content
  }
  const [success, parsedJSON] = tryJSONParse<T>(content)
  return success ? (parsedJSON as T) : defaultValue
}
