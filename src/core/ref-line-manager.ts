import type { App, Group } from 'leafer-ui'
import { Bounds } from 'leafer-ui'

interface IVerticalLine {
  x: number
  ys: number[]
}

interface IHorizontalLine {
  y: number
  xs: number[]
}

export class RefLineManager {
  // horizontal line map, y as key, x as value
  private hLineMap = new Map<number, Set<number>>()
  // vertical line map, x as key, y as value
  private vLineMap = new Map<number, Set<number>>()

  // vLineMap's key sorted
  private sortedXs: number[] = []
  // hLineMap's key sorted
  private sortedYs: number[] = []

  private toDrawVLines: IVerticalLine[] = [] // vertical ref lines to draw
  private toDrawHLines: IHorizontalLine[] = [] // horizontal ref lines to draw

  constructor(
    private app: App,
    private icon: Group,
  ) {

  }

  private get skyLayer() {
    return this.app.sky
  }

  private clear() {
    this.hLineMap.clear()
    this.vLineMap.clear()
    this.sortedXs = []
    this.sortedYs = []
    this.toDrawVLines = []
    this.toDrawHLines = []
    this.skyLayer.children.forEach(child => child.remove())
  }

  private addBboxToMap(
    m: Map<number, Set<number>>,
    xOrY: number,
    xsOrYs: number[],
  ) {
    const line = m.get(xOrY)
    if (line) {
      for (const xOrY of xsOrYs)
        line.add(xOrY)
    }
    else {
      m.set(xOrY, new Set(xsOrYs))
    }
  }

  cacheXYToBbox() {
    this.clear()

    const viewport = new Bounds(0, 0, this.app.width, this.app.height)

    const { list: selectedItems } = this.app.editor
    for (const child of this.icon.children) {
      // skip selected items
      if (selectedItems.some(e => e.innerId === child.innerId))
        continue

      // skip item not in viewport
      const bounds = new Bounds(child.getBounds())
      if (!viewport.hit(bounds))
        continue
    }
  }
}
