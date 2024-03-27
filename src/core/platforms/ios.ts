import type { IconInfo } from './types'

interface IOS_IconInfo {
  size: number
  scale: number
  idiom: 'iphone' | 'ipad' | 'ios-marketing'
}

export interface IOS_ContentJson {
  images: {
    size: string
    idiom: string
    filename: string
    scale: string
  }[]
  info: {
    version: 1
    author: string
  }
}

const IOS_SIZES: IOS_IconInfo[] = [
  {
    size: 20,
    scale: 2,
    idiom: 'iphone',
  },
  {
    size: 20,
    scale: 3,
    idiom: 'iphone',
  },
  {
    size: 29,
    scale: 1,
    idiom: 'iphone',
  },
  {
    size: 29,
    scale: 2,
    idiom: 'iphone',
  },
  {
    size: 29,
    scale: 3,
    idiom: 'iphone',
  },
  {
    size: 40,
    scale: 2,
    idiom: 'iphone',
  },
  {
    size: 40,
    scale: 3,
    idiom: 'iphone',
  },
  {
    size: 60,
    scale: 2,
    idiom: 'iphone',
  },
  {
    size: 60,
    scale: 3,
    idiom: 'iphone',
  },
  {
    size: 20,
    scale: 1,
    idiom: 'ipad',
  },
  {
    size: 20,
    scale: 2,
    idiom: 'ipad',
  },
  {
    size: 29,
    scale: 1,
    idiom: 'ipad',
  },
  {
    size: 29,
    scale: 2,
    idiom: 'ipad',
  },
  {
    size: 40,
    scale: 1,
    idiom: 'ipad',
  },
  {
    size: 40,
    scale: 2,
    idiom: 'ipad',
  },
  {
    size: 76,
    scale: 1,
    idiom: 'ipad',
  },
  {
    size: 76,
    scale: 2,
    idiom: 'ipad',
  },
  {
    size: 83.5,
    scale: 2,
    idiom: 'ipad',
  },
  {
    size: 1024,
    scale: 1,
    idiom: 'ios-marketing',
  },
]

export function getIOSIcons(): {
  contentJson: IOS_ContentJson
  icons: IconInfo[]
} {
  const def_path = ['ios', 'AppIcon.appiconset']
  const icons: IconInfo[] = []
  const contentJson: IOS_ContentJson = {
    images: [],
    info: {
      version: 1,
      author: 'ikon',
    },
  }

  for (const sizeInfo of IOS_SIZES) {
    const scale = sizeInfo.scale === 1 ? '' : `@${sizeInfo.scale}x`
    const idiom = sizeInfo.idiom === 'ipad' ? '-ipad' : ''
    icons.push({
      name: `icon-${sizeInfo.size}${scale}${idiom}.png`,
      path: def_path,
      size: sizeInfo.size * sizeInfo.scale,
    })

    contentJson.images.push({
      size: `${sizeInfo.size}x${sizeInfo.size}`,
      idiom: sizeInfo.idiom,
      filename: `icon-${sizeInfo.size}${scale}${idiom}.png`,
      scale: `${sizeInfo.scale}x`,
    })
  }

  return {
    contentJson,
    icons,
  }
}
