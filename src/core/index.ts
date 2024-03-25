import { App, Image, ImageEvent, Rect } from 'leafer-ui'
import '@leafer-in/editor'

export class IkonEditor {
  private app: App
  private imgUrl: string | null = null

  constructor(container: HTMLElement) {
    this.app = new App({
      view: container,
      ground: { type: 'draw' },
      tree: { type: 'draw' },
      editor: {},
    })

    this.drawBackground()
  }

  addImage(file: File) {
    this.imgUrl && URL.revokeObjectURL(this.imgUrl)
    this.imgUrl = URL.createObjectURL(file)

    const img = new Image({
      url: this.imgUrl,
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

    this.app.tree.add(img)
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

  destroy() {
    this.imgUrl && URL.revokeObjectURL(this.imgUrl)
    this.app.destroy()
  }
}