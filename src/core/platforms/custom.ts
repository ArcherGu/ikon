import type { IconInfo } from './types'

export function getCustomSizeIcons(sizes: number[]): IconInfo[] {
  const def_path = ['custom']

  const icons: IconInfo[] = []
  for (const s of sizes) {
    icons.push({
      name: `${s}x${s}.png`,
      path: def_path,
      size: s,
    })
  }

  return icons
}
