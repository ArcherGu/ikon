import { App, Group, Image, ImageEvent, KeyEvent, Rect } from 'leafer-ui'
import '@leafer-in/editor'
import type { IconBackground } from './types'

export class IkonEditor {
  private app: App
  private imgUrls: string[] = []
  private icon: Group
  private iconBg: ReturnType<typeof Rect.one>
  private onImagesCountChangeCallbacks: ((count: number) => void)[] = []

  constructor(container: HTMLElement) {
    this.app = new App({
      view: container,
      ground: { type: 'draw' },
      tree: { type: 'draw' },
      editor: {
        keyEvent: true,
        rotatePoint: {},
      },
    })

    this.icon = new Group()
    this.app.tree.add(this.icon)

    this.iconBg = Rect.one({ fill: '#fff', visible: false, editable: false }, 0, 0, this.app.width, this.app.height)
    this.icon.add(this.iconBg)

    this.initEvents()
    this.drawBackground()
  }

  private triggerImagesCountChange() {
    const images = this.icon.children.filter(child => child instanceof Image)
    this.onImagesCountChangeCallbacks.forEach(callback => callback(images.length))
  }

  onImagesCountChange(callback: (count: number) => void) {
    this.onImagesCountChangeCallbacks.push(callback)
  }

  private initEvents() {
    this.app.on(KeyEvent.UP, (e: KeyEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.app.editor.list.length > 0) {
        const items = [...this.app.editor.list]
        items.forEach((item) => {
          item.remove()
        })

        this.app.editor.target = []
        this.triggerImagesCountChange()
      }
    })
  }

  addImage(file: File) {
    const imgUrl = URL.createObjectURL(file)
    this.imgUrls.push(imgUrl)

    const img = new Image({
      url: imgUrl,
      editable: true,
    })

    img.once(ImageEvent.LOADED, (_: ImageEvent) => {
      const { width, height } = this.app
      const scale = img.width > img.height ? width / img.width / 2 : height / img.height / 2
      img.width = img.width * scale
      img.height = img.height * scale
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
    this.imgUrls.forEach(url => URL.revokeObjectURL(url))
    this.app.destroy()
  }
}
