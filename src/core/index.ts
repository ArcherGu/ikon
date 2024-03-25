export class IkonEditor {
  resizeObserver: ResizeObserver
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  private imgUrl: string | null = null

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas')

    this.canvas.width = container.clientWidth
    this.canvas.height = container.clientHeight

    this.resizeObserver = new ResizeObserver(() => {
      this.canvas.width = container.clientWidth
      this.canvas.height = container.clientHeight
    })
    this.resizeObserver.observe(container)

    container.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')!

    this.drawBackground()
  }

  addImage(file: File) {
    this.imgUrl && URL.revokeObjectURL(this.imgUrl)
    this.imgUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      this.drawBackground()

      const scale = img.width > img.height ? this.canvas.width / img.width / 2 : this.canvas.height / img.height / 2
      const width = img.width * scale
      const height = img.height * scale
      const x = (this.canvas.width - width) / 2
      const y = (this.canvas.height - height) / 2
      this.ctx.drawImage(img, x, y, width, height)
    }
    img.src = this.imgUrl
  }

  private drawBackground() {
    const size = 16
    const width = this.canvas.width
    const height = this.canvas.height

    this.ctx.fillStyle = '#f0f0f0'
    this.ctx.fillRect(0, 0, width, height)
    this.ctx.fillStyle = '#ffffff'
    for (let x = 0; x < width; x += size) {
      for (let y = 0; y < height; y += size) {
        if ((x / size + y / size) % 2 === 0)
          this.ctx.fillRect(x, y, size, size)
      }
    }
  }

  destroy() {
    this.imgUrl && URL.revokeObjectURL(this.imgUrl)
    this.imgUrl = null

    this.resizeObserver.disconnect()
    this.canvas.remove()
  }
}
