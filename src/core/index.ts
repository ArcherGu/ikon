import './plugins'
import { App, ChildEvent, Group, Image, ImageEvent, KeyEvent, PointerEvent, Rect } from 'leafer-ui'
import { EditorMoveEvent } from '@leafer-in/editor'
import type { IconBackground } from './types'
import { RefLineManager } from './ref-line-manager'

export class IkonEditor {
  private app: App
  private icon: Group
  private iconBg: ReturnType<typeof Rect.one>
  private onImagesCountChangeCallbacks: ((count: number) => void)[] = []
  private refLineManager: RefLineManager

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
    this.app.on(PointerEvent.DOWN, (_: PointerEvent) => {
      if (this.app.editor.target)
        this.refLineManager.cacheXYToBbox()
    })
    this.app.on(PointerEvent.UP, (_: PointerEvent) => {
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

  private onItemMove = (e: EditorMoveEvent) => {
    const list = this.app.editor.list
    if (list.length === 0)
      return

    const { target } = e
    const { offsetX, offsetY } = this.refLineManager.updateRefLines(target as any)
    list.forEach((item) => {
      item.x! += offsetX
      item.y! += offsetY
    })
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
