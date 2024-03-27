import './plugins'
import { App, Bounds, ChildEvent, Group, Image, ImageEvent, KeyEvent, PointerEvent, Rect } from 'leafer-ui'
import { EditorMoveEvent } from '@leafer-in/editor'
import type { IconBackground } from './types'
import { RefLineManager } from './ref-line-manager'

export class IkonEditor {
  private app: App
  private icon: Group
  private iconBg: ReturnType<typeof Rect.one>
  private onImagesCountChangeCallbacks: ((count: number) => void)[] = []
  private refLineManager: RefLineManager
  private targetMove = {
    moving: false,
    mouseStart: { x: 0, y: 0 },
    currentMousePos: { x: 0, y: 0 },
    startPoses: new Map<number, { x: number, y: number }>(),
  }

  constructor(container: HTMLElement) {
    // app
    this.app = new App({
      view: container,
      ground: { type: 'draw' },
      tree: { type: 'draw' },
      sky: {},
      editor: {
        keyEvent: true,
        rotatePoint: {},
      },
    })

    // icon group
    this.icon = new Group()
    this.iconBg = Rect.one({ fill: '#fff', visible: false, editable: false }, 0, 0, this.app.width, this.app.height)
    this.icon.add(this.iconBg)
    this.app.tree.add(this.icon)

    // center lines
    this.refLineManager = new RefLineManager(this.app, this.icon)

    // init
    this.initEvents()
    this.drawBackground()
  }

  private triggerImagesCountChange() {
    const images = this.getAllImages()
    this.onImagesCountChangeCallbacks.forEach(callback => callback(images.length))
  }

  onImagesCountChange(callback: (count: number) => void) {
    this.onImagesCountChangeCallbacks.push(callback)
  }

  private initEvents() {
    this.app.on(KeyEvent.UP, this.onKeyUp)
    this.app.editor.on(EditorMoveEvent.MOVE, this.onItemMove)
    this.app.on(PointerEvent.MOVE, (e: PointerEvent) => {
      this.targetMove.currentMousePos = { x: e.x, y: e.y }
    })
    this.app.on(PointerEvent.DOWN, (e: PointerEvent) => {
      if (this.app.editor.list.length > 0) {
        this.targetMove.mouseStart = { x: e.x, y: e.y }
        for (const item of this.app.editor.list)
          this.targetMove.startPoses.set(item.innerId, { x: item.x!, y: item.y! })

        this.targetMove.moving = true
        this.refLineManager.cacheXYToBbox()
      }
    })
    this.app.on(PointerEvent.UP, (_: PointerEvent) => {
      this.targetMove.moving = false
      this.targetMove.mouseStart = { x: 0, y: 0 }
      this.targetMove.currentMousePos = { x: 0, y: 0 }
      this.targetMove.startPoses.clear()

      this.refLineManager.clearRefLines()
    })

    this.icon.on(ChildEvent.ADD, _ => this.triggerImagesCountChange())
    this.icon.on(ChildEvent.REMOVE, this.onImageRemove)
  }

  private onImageRemove = (e: ChildEvent) => {
    const { target } = e
    if (target instanceof Image) {
      URL.revokeObjectURL(target.url)
      this.triggerImagesCountChange()
    }
  }

  private onKeyUp = (e: KeyEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && this.app.editor.list.length > 0) {
      const items = [...this.app.editor.list]
      items.forEach((item) => {
        item.remove()
      })

      this.app.editor.target = []
    }
  }

  private getMoveBounds(list: typeof this.app.editor.list) {
    const bBox = {
      minX: Math.min(...list.map(item => item.getBounds().x)),
      minY: Math.min(...list.map(item => item.getBounds().y)),
      maxX: Math.max(...list.map((item) => {
        const bounds = item.getBounds()
        return bounds.x + bounds.width
      })),
      maxY: Math.max(...list.map((item) => {
        const bounds = item.getBounds()
        return bounds.y + bounds.height
      })),
    }

    return new Bounds(bBox.minX, bBox.minY, bBox.maxX - bBox.minX, bBox.maxY - bBox.minY)
  }

  private onItemMove = (_: EditorMoveEvent) => {
    const { moving, mouseStart, currentMousePos, startPoses } = this.targetMove
    if (!moving)
      return

    const dx = currentMousePos.x - mouseStart.x
    const dy = currentMousePos.y - mouseStart.y

    // move
    for (const item of this.app.editor.list) {
      const startPos = startPoses.get(item.innerId)!
      item.x = startPos.x + dx
      item.y = startPos.y + dy
    }

    // magnetic
    const moveBounds = this.getMoveBounds(this.app.editor.list)
    const { offsetX, offsetY } = this.refLineManager.updateRefLines(moveBounds)
    for (const item of this.app.editor.list) {
      const startPos = startPoses.get(item.innerId)!
      item.x = startPos.x + dx + offsetX
      item.y = startPos.y + dy + offsetY
    }
  }

  getAllImages() {
    return this.icon.children.filter(child => child instanceof Image) as Image[]
  }

  addImage(file: File) {
    const img = new Image({
      url: URL.createObjectURL(file),
      editable: true,
    })

    img.once(ImageEvent.LOADED, (_: ImageEvent) => {
      const { width, height } = this.app
      if (img.width > width / 2 || img.height > height / 2) {
        const scale = img.width > img.height ? width / img.width / 2 : height / img.height / 2
        img.width = img.width * scale
        img.height = img.height * scale
      }

      img.x = (width - img.width) / 2
      img.y = (height - img.height) / 2
    })

    this.icon.add(img)
    this.triggerImagesCountChange()
  }

  private drawBackground() {
    const size = 16
    const { width, height } = this.app

    const horizontalCount = Math.ceil(width / size)
    const verticalCount = Math.ceil(height / size)

    for (let i = 0; i < horizontalCount; i++) {
      for (let j = 0; j < verticalCount; j++)
        this.app.ground.add(Rect.one({ fill: (i + j) % 2 === 0 ? '#fff' : '#e3e3e3' }, i * size, j * size, size, size))
    }
  }

  updateIconBg(bg: IconBackground) {
    const { color, radius, visible } = bg

    this.iconBg.visible = visible
    this.iconBg.fill = color

    const bgWidth = this.iconBg.width!
    const cornerRadius = bgWidth * radius * 0.01
    this.iconBg.cornerRadius = cornerRadius
  }

  destroy() {
    this.getAllImages().forEach(img => URL.revokeObjectURL(img.url))
    this.app.destroy()
  }
}
