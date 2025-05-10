import CryptoJS from 'crypto-js'
import { Base64 } from 'js-base64'
import Cookies from 'js-cookie'
import browser from './browser'

const SECRET_KEY = 'your-secret-key' // 自定义的加密密钥

const LS_KEY_PREFIX = 'cookie_'

interface CookieAttributes {
  expires?: number | Date | undefined
  path?: string | undefined
  domain?: string | undefined
  secure?: boolean | undefined
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None' | undefined
}

// 加密Cookie值
const encryptCookieValue = (value: string) => {
  const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString()
  return Base64.encode(encrypted)
}

// 解密Cookie值
const decryptCookieValue = (encryptedValue: string) => {
  const decoded = Base64.decode(encryptedValue)
  const decrypted = CryptoJS.AES.decrypt(decoded, SECRET_KEY).toString(CryptoJS.enc.Utf8)
  return decrypted
}

// 设置加密Cookie
const setEncryptedCookie = (name: string, value: string, options?: CookieAttributes) => {
  const encryptedValue = encryptCookieValue(value)
  setCookie(name, encryptedValue, options)
}

// 获取解密Cookie
const getDecryptedCookie = (name: string) => {
  const encryptedValue = getCookie(name)
  if (encryptedValue) {
    const decryptedValue = decryptCookieValue(encryptedValue)
    return decryptedValue
  }
  return null
}

const setCookie = (name: string, value: string, options?: CookieAttributes) => {
  Cookies.set(name, value, { ...options, secure: true })
  browser.isDesktop() && window.localStorage.setItem(LS_KEY_PREFIX + name, value)
}

// 获取解密Cookie
const getCookie = (name: string) => {
  return Cookies.get(name) || window.localStorage.getItem(LS_KEY_PREFIX + name)
}

// 删除Cookie
const deleteCookie = (name: string, options?: CookieAttributes) => {
  Cookies.remove(name, options)
  browser.isDesktop() && window.localStorage.removeItem(LS_KEY_PREFIX + name)
}

export { deleteCookie, getCookie, getDecryptedCookie, setCookie, setEncryptedCookie }
