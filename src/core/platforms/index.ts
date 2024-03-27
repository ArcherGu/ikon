export { getElectronIcons } from './electron'
export { getIOSIcons } from './ios'
export { getAndroidIcons } from './android'

export const Platforms = [
  'Android',
  'IOS',
  'Electron',
] as const

export type Platform = typeof Platforms[number]

export const CustomSizes = [32, 48, 64, 96, 128, 256, 512, 1024]
