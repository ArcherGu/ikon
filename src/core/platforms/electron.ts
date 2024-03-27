import type { IconInfo } from './types'

interface Electron_IconInfo {
  size: number
  ext: string
}

const ELECTRON_SIZES: Electron_IconInfo[] = [
  {
    size: 512,
    ext: 'png',
  },
  {
    size: 256,
    ext: 'ico',
  },
  {
    size: 512,
    ext: 'icns',
  },
]

export function getElectronIcons(): IconInfo[] {
  const def_path = ['electron']
  const icons: IconInfo[] = []

  for (const sizeInfo of ELECTRON_SIZES) {
    icons.push({
      name: `icon.${sizeInfo.ext}`,
      path: def_path,
      size: sizeInfo.size,
    })
  }

  return icons
}
