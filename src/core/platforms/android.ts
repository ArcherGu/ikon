import type { IconInfo } from './types'

interface Android_IconInfo {
  size: number
  name: string
  folder?: string
}

const DEF_NAME = 'ic_launcher'

const ANDROID_SIZES: Android_IconInfo[] = [
  {
    size: 48,
    name: DEF_NAME,
    folder: 'mipmap-mdpi',
  },
  {
    size: 72,
    name: DEF_NAME,
    folder: 'mipmap-hdpi',
  },
  {
    size: 96,
    name: DEF_NAME,
    folder: 'mipmap-xhdpi',
  },
  {
    size: 144,
    name: DEF_NAME,
    folder: 'mipmap-xxhdpi',
  },
  {
    size: 192,
    name: DEF_NAME,
    folder: 'mipmap-xxxhdpi',
  },
  {
    size: 512,
    name: 'playstore-icon',
  },
]

export function getAndroidIcons(): IconInfo[] {
  const def_path = ['android']
  const icons: IconInfo[] = []

  for (const sizeInfo of ANDROID_SIZES) {
    const folder = sizeInfo.folder ? [sizeInfo.folder] : []
    icons.push({
      name: `${sizeInfo.name}.png`,
      path: [...def_path, ...folder],
      size: sizeInfo.size,
    })
  }

  return icons
}
