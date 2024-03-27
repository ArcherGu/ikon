import './plugins'
import { App, Bounds, Box, ChildEvent, Group, Image, ImageEvent, KeyEvent, PointerEvent, Rect } from 'leafer-ui'
import { EditorMoveEvent } from '@leafer-in/editor'
import JSZip from 'jszip'
import type { IconBackground } from './types'
import { RefLineManager } from './ref-line-manager'
import type { Platform } from './platforms'
import { getAndroidIcons, getElectronIcons } from './platforms'
import type { IOS_ContentJson } from './platforms/ios'
import { getIOSIcons } from './platforms/ios'
import type { IconInfo } from './platforms/types'
import { getCustomSizeIcons } from './platforms/custom'
import { Contextmenu } from './contextmenu'

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

  private contextmenu: Contextmenu

  constructor(private container: HTMLElement) {
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
    this.iconBg = Rect.one({ fill: '#fff', visible: false, editable: false, zIndex: 0 }, 0, 0, this.app.width, this.app.height)
    this.app.tree.add(this.iconBg)

    this.icon = new Group({ zIndex: 1 })
    this.app.tree.add(this.icon)

    // ref line manager
    this.refLineManager = new RefLineManager(this.app, this.icon, this.iconBg)

    // contextmenu
    this.contextmenu = new Contextmenu(this.app, this.icon)
    this.container.addEventListener('contextmenu', this.contextmenu.show)

    // init
    this.initEvents()
    this.drawBackground()
  }

  private get editor() {
    return this.app.editor
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
    this.editor.on(EditorMoveEvent.MOVE, this.onItemMove)
    this.app.on(PointerEvent.MOVE, (e: PointerEvent) => {
      this.targetMove.currentMousePos = { x: e.x, y: e.y }
    })
    this.app.on(PointerEvent.DOWN, (e: PointerEvent) => {
      if (this.editor.list.length > 0) {
        this.targetMove.mouseStart = { x: e.x, y: e.y }
        for (const item of this.editor.list)
          this.targetMove.startPoses.set(item.innerId, { x: item.x!, y: item.y! })

        // if multiple items selected, save out box start pos
        if (this.editor.list.length > 1) {
          const { element } = this.editor
          this.targetMove.startPoses.set(element.innerId, { x: element.x!, y: element.y! })
        }

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
    if ((e.key === 'Delete' || e.key === 'Backspace') && this.editor.list.length > 0) {
      const items = [...this.editor.list]
      items.forEach((item) => {
        item.remove()
      })

      this.editor.target = []
    }
  }

  private onItemMove = (e: EditorMoveEvent) => {
    const { moving, mouseStart, currentMousePos, startPoses } = this.targetMove
    if (!moving)
      return

    const dx = currentMousePos.x - mouseStart.x
    const dy = currentMousePos.y - mouseStart.y

    const moveList = this.editor.list.length > 1 ? [...this.editor.list, this.editor.element] : this.editor.list

    // move
    for (const item of moveList) {
      const startPos = startPoses.get(item.innerId)!
      item.x = startPos.x + dx
      item.y = startPos.y + dy
    }

    // magnetic
    const targetBounds = new Bounds(e.target.getBounds())
    const { offsetX, offsetY } = this.refLineManager.updateRefLines(targetBounds)
    for (const item of moveList) {
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
    this.container.removeEventListener('contextmenu', this.contextmenu.show)
    this.contextmenu.destroy()
    this.app.destroy()
  }

  async generateAndDownload(platform: Platform[], customSizes: number[]) {
    let iosContentJson: IOS_ContentJson | null = null
    const icons: IconInfo[] = []
    for (const p of platform) {
      if (p === 'IOS') {
        const { contentJson, icons: _icons } = getIOSIcons()
        iosContentJson = contentJson
        icons.push(..._icons)
      }
      else if (p === 'Android') {
        icons.push(...getAndroidIcons())
      }
      else if (p === 'Electron') {
        icons.push(...getElectronIcons())
      }
    }
    if (customSizes.length > 0)
      icons.push(...getCustomSizeIcons(customSizes))

    const box = new Box({
      width: this.iconBg.width!,
      height: this.iconBg.height!,
      overflow: 'hide',
      cornerRadius: this.iconBg.cornerRadius,
    })

    box.add(this.iconBg.clone())
    const images = this.getAllImages()
    for (const img of images)
      box.add(img.clone())

    box.x = -9999
    box.y = -9999
    this.app.tree.add(box)

    const { data: leaferCanvas } = await box.export('canvas')
    box.remove()
    const zip = new JSZip()
    const iconCanvas = leaferCanvas.view as HTMLCanvasElement
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    for (const { size, name, path } of icons) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      canvas.width = size
      canvas.height = size
      ctx.drawImage(iconCanvas, 0, 0, size, size)
      const base64 = canvas.toDataURL('image/png')
      zip.file(path.concat(name).join('/'), base64.split(',')[1], { base64: true })
    }

    if (iosContentJson)
      zip.file('ios/AppIcon.appiconset/Contents.json', JSON.stringify(iosContentJson))

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ikon.zip'
    a.click()
    URL.revokeObjectURL(url)
  }
}
