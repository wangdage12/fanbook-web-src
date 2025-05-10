import { useEffect, useState } from 'react'
import { checkIsLocalURL } from '../../utils/common'
import { getLocalForageInstance } from '../../utils/localStore'

const rejectVideoBox = getLocalForageInstance({
  storeName: 'rejectVideoBox',
  version: 1,
})

export enum VideoCheckResult {
  unPassed = 0,
  passed = 1,
}

type CheckResult = 0 | 1

const errorUrls: Set<string> = new Set<string>()

async function isError(url: string): Promise<boolean> {
  const localResult = await rejectVideoBox.getItem<VideoCheckResult>(url)
  return errorUrls.has(url) || localResult === VideoCheckResult.unPassed
}

async function addError(url: string): Promise<void> {
  await rejectVideoBox.setItem(url, VideoCheckResult.unPassed)
  errorUrls.add(url)
}
async function removeError(url: string): Promise<void> {
  await rejectVideoBox.setItem(url, VideoCheckResult.passed)
  errorUrls.delete(url)
}

export async function checkVideoURL(url: string, useCachedCheckResult: CheckResult = VideoCheckResult.unPassed): Promise<boolean> {
  if (useCachedCheckResult === VideoCheckResult.passed && (await isError(url))) return false
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (response.status === 200) {
      await removeError(url)
      return true
    }
    if (response.status === 403) {
      await addError(url)
      return false
    }
    return false
  } catch (err) {
    return false
  }
}

export function useCheckVideoStatus(url?: string) {
  const [isChecking, setIsChecking] = useState(true)
  const [isPass, setIsPass] = useState(false)
  const isLocalUrl = checkIsLocalURL(url)
  useEffect(() => {
    if (!isLocalUrl && url) {
      checkVideoURL(url, VideoCheckResult.passed)
        .then(pass => {
          setIsPass(pass)
        })
        .finally(() => {
          setIsChecking(false)
        })
    } else {
      setIsPass(true)
      setIsChecking(false)
    }
  }, [url])
  return { isChecking, isPass }
}
