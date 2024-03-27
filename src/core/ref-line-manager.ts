import type { App } from 'leafer-ui'
import { Bounds, Group, Line } from 'leafer-ui'

export class RefLineManager {
  // horizontal line map, y as key, x as value
  private hLineMap = new Map<number, Set<number>>()
  // vertical line map, x as key, y as value
  private vLineMap = new Map<number, Set<number>>()

  // vLineMap's key sorted
  private sortedXs: number[] = []
  // hLineMap's key sorted
  private sortedYs: number[] = []

  private refLines: Group

  constructor(
    private app: App,
    private icon: Group,
  ) {
    this.refLines = new Group()
    this.app.sky.add(this.refLines)
  }

  clearRefLines() {
    this.refLines.clear()
  }

  private clear() {
    this.hLineMap.clear()
    this.vLineMap.clear()
    this.sortedXs = []
    this.sortedYs = []
    this.clearRefLines()
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

      const bBox = {
        minX: bounds.x,
        midX: bounds.x + bounds.width / 2,
        maxX: bounds.x + bounds.width,
        minY: bounds.y,
        midY: bounds.y + bounds.height / 2,
        maxY: bounds.y + bounds.height,
      }

      // add vertical lines
      this.addBboxToMap(this.vLineMap, bBox.minX, [bBox.minY, bBox.maxY])
      this.addBboxToMap(this.vLineMap, bBox.midX, [bBox.minY, bBox.maxY])
      this.addBboxToMap(this.vLineMap, bBox.maxX, [bBox.minY, bBox.maxY])
      // add horizontal lines
      this.addBboxToMap(this.hLineMap, bBox.minY, [bBox.minX, bBox.maxX])
      this.addBboxToMap(this.hLineMap, bBox.midY, [bBox.minX, bBox.maxX])
      this.addBboxToMap(this.hLineMap, bBox.maxY, [bBox.minX, bBox.maxX])
    }

    // sort keys
    this.sortedXs = Array.from(this.vLineMap.keys()).sort((a, b) => a - b)
    this.sortedYs = Array.from(this.hLineMap.keys()).sort((a, b) => a - b)
  }

  private getNearestValInSortedArr(target: number, sortedArr: number[]): number {
    if (sortedArr.length === 0)
      throw new Error('sortedArr is empty')

    if (sortedArr.length === 1)
      return sortedArr[0]

    let left = 0
    let right = sortedArr.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)

      if (sortedArr[mid] === target)
        return sortedArr[mid]
      else if (sortedArr[mid] < target)
        left = mid + 1
      else
        right = mid - 1
    }

    // check if left or right is out of bound
    if (left >= sortedArr.length)
      return sortedArr[right]

    if (right < 0)
      return sortedArr[left]

    // check which one is closer
    return Math.abs(sortedArr[right] - target)
      <= Math.abs(sortedArr[left] - target)
      ? sortedArr[right]
      : sortedArr[left]
  }

  private createVerticalRefLine(x: number, ys: number[]): Line {
    const vLine = new Line({
      strokeWidth: 1,
      stroke: 'red',
      points: [
        x,
        Math.min(...ys),
        x,
        Math.max(...ys),
      ],
    })

    return vLine
  }

  private createHorizontalRefLine(y: number, xs: number[]): Line {
    const hLine = new Line({
      strokeWidth: 1,
      stroke: 'red',
      points: [
        Math.min(...xs),
        y,
        Math.max(...xs),
        y,
      ],
    })

    return hLine
  }

  updateRefLines(targetBounds: Bounds): { offsetX: number, offsetY: number } {
    // remove all ref lines
    this.clearRefLines()

    if (this.sortedXs.length === 0 && this.sortedYs.length === 0)
      return { offsetX: 0, offsetY: 0 }

    let offsetX: number | null = null
    let offsetY: number | null = null

    const targetBbox = {
      minX: targetBounds.x,
      midX: targetBounds.x + targetBounds.width / 2,
      maxX: targetBounds.x + targetBounds.width,
      minY: targetBounds.y,
      midY: targetBounds.y + targetBounds.height / 2,
      maxY: targetBounds.y + targetBounds.height,
    }

    // X
    const nearestMinX = this.getNearestValInSortedArr(targetBbox.minX, this.sortedXs)
    const nearestMidX = this.getNearestValInSortedArr(targetBbox.midX, this.sortedXs)
    const nearestMaxX = this.getNearestValInSortedArr(targetBbox.maxX, this.sortedXs)

    const distMinX = Math.abs(nearestMinX - targetBbox.minX)
    const distMidX = Math.abs(nearestMidX - targetBbox.midX)
    const distMaxX = Math.abs(nearestMaxX - targetBbox.maxX)

    const nearestXDist = Math.min(distMinX, distMidX, distMaxX)

    // Y
    const nearestMinY = this.getNearestValInSortedArr(targetBbox.minY, this.sortedYs)
    const nearestMidY = this.getNearestValInSortedArr(targetBbox.midY, this.sortedYs)
    const nearestMaxY = this.getNearestValInSortedArr(targetBbox.maxY, this.sortedYs)

    const distMinY = Math.abs(nearestMinY - targetBbox.minY)
    const distMidY = Math.abs(nearestMidY - targetBbox.midY)
    const distMaxY = Math.abs(nearestMaxY - targetBbox.maxY)

    const nearestYDist = Math.min(distMinY, distMidY, distMaxY)

    // floating point comparison
    const isEqualNum = (a: number, b: number) => Math.abs(a - b) < 0.00001
    const tol = 5

    // get offsetX
    if (nearestXDist <= tol) {
      if (isEqualNum(nearestXDist, distMinX))
        offsetX = nearestMinX - targetBbox.minX
      else if (isEqualNum(nearestXDist, distMidX))
        offsetX = nearestMidX - targetBbox.midX
      else if (isEqualNum(nearestXDist, distMaxX))
        offsetX = nearestMaxX - targetBbox.maxX
    }

    // get offsetY
    if (nearestYDist <= tol) {
      if (isEqualNum(nearestYDist, distMinY))
        offsetY = nearestMinY - targetBbox.minY
      else if (isEqualNum(nearestYDist, distMidY))
        offsetY = nearestMidY - targetBbox.midY
      else if (isEqualNum(nearestYDist, distMaxY))
        offsetY = nearestMaxY - targetBbox.maxY
    }

    // add vertical ref lines
    if (offsetX !== null) {
      const correctedTargetBoxMinY = targetBbox.minY + (offsetY ?? 0)
      const correctedTargetBoxMidY = targetBbox.midY + (offsetY ?? 0)
      const correctedTargetBoxMaxY = targetBbox.maxY + (offsetY ?? 0)
      // left vertical line
      if (isEqualNum(offsetX, nearestMinX - targetBbox.minX)) {
        const vLine = this.createVerticalRefLine(nearestMinX, [
          correctedTargetBoxMinY,
          correctedTargetBoxMaxY,
          ...Array.from(this.vLineMap.get(nearestMinX) ?? []),
        ])

        this.refLines.add(vLine)
      }

      // middle vertical line
      if (isEqualNum(offsetX, nearestMidX - targetBbox.midX)) {
        const vLine = this.createVerticalRefLine(nearestMidX, [
          correctedTargetBoxMidY,
          ...Array.from(this.vLineMap.get(nearestMidX) ?? []),
        ])

        this.refLines.add(vLine)
      }

      // right vertical line
      if (isEqualNum(offsetX, nearestMaxX - targetBbox.maxX)) {
        const vLine = this.createVerticalRefLine(nearestMaxX, [
          correctedTargetBoxMinY,
          correctedTargetBoxMaxY,
          ...Array.from(this.vLineMap.get(nearestMaxX) ?? []),
        ])

        this.refLines.add(vLine)
      }
    }

    // add horizontal ref lines
    if (offsetY !== null) {
      const correctedTargetBoxMinX = targetBbox.minX + (offsetX ?? 0)
      const correctedTargetBoxMidX = targetBbox.midX + (offsetX ?? 0)
      const correctedTargetBoxMaxX = targetBbox.maxX + (offsetX ?? 0)
      // top horizontal line
      if (isEqualNum(offsetY, nearestMinY - targetBbox.minY)) {
        const hLine = this.createHorizontalRefLine(nearestMinY, [
          correctedTargetBoxMinX,
          correctedTargetBoxMaxX,
          ...Array.from(this.hLineMap.get(nearestMinY) ?? []),
        ])

        this.refLines.add(hLine)
      }

      // middle horizontal line
      if (isEqualNum(offsetY, nearestMidY - targetBbox.midY)) {
        const hLine = this.createHorizontalRefLine(nearestMidY, [
          correctedTargetBoxMidX,
          ...Array.from(this.hLineMap.get(nearestMidY) ?? []),
        ])

        this.refLines.add(hLine)
      }

      // bottom horizontal line
      if (isEqualNum(offsetY, nearestMaxY - targetBbox.maxY)) {
        const hLine = this.createHorizontalRefLine(nearestMaxY, [
          correctedTargetBoxMinX,
          correctedTargetBoxMaxX,
          ...Array.from(this.hLineMap.get(nearestMaxY) ?? []),
        ])

        this.refLines.add(hLine)
      }
    }

    return { offsetX: offsetX ?? 0, offsetY: offsetY ?? 0 }
  }
}
