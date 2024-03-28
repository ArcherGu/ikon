import { Box, Ellipse, Group, Image, ImageEvent } from 'leafer-ui'
import anime from 'animejs'

export class IkonImage extends Group {
  sourceUrl: string
  clipUrl?: string
  img: Image
  private loadingBox: Box
  private loadingIcon: Ellipse
  private loadingAnimation: anime.AnimeInstance

  constructor(url: string) {
    super()
    this.editable = true

    // image
    this.sourceUrl = url
    this.img = new Image({ url })
    this.add(this.img)

    // loading
    this.loadingBox = new Box({
      fill: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1,
      visible: false,
    })
    this.loadingIcon = new Ellipse({
      width: 30,
      height: 30,
      startAngle: 0,
      endAngle: 340,
      innerRadius: 0.75,
      fill: '#409eff',
    })
    this.loadingAnimation = anime({
      targets: this.loadingIcon,
      keyframes: [
        { startAngle: 60, endAngle: 400 },
        { startAngle: 120, endAngle: 460 },
        { startAngle: 180, endAngle: 520 },
        { startAngle: 240, endAngle: 580 },
        { startAngle: 300, endAngle: 640 },
        { startAngle: 360, endAngle: 700 },
      ],
      duration: 1000,
      autoplay: false,
      easing: 'linear',
      loop: true,
    })
    this.loadingBox.add(this.loadingIcon)
    this.add(this.loadingBox)

    // on loaded
    this.img.once(ImageEvent.LOADED, (_: ImageEvent) => {
      const width = this.app.width!
      const height = this.app.height!

      if (this.img.width > width / 2 || this.img.height > height / 2) {
        const scale = this.img.width > this.img.height ? width / this.img.width / 2 : height / this.img.height / 2
        this.img.width = this.img.width * scale
        this.img.height = this.img.height * scale
      }

      this.x = (width - this.img.width) / 2
      this.y = (height - this.img.height) / 2

      this.centerLoading()
    })
  }

  get url() {
    return this.img.url
  }

  set url(url: string) {
    this.img.url = url
  }

  get loading() {
    return this.loadingBox.visible
  }

  set loading(l: boolean) {
    if (l) {
      this.centerLoading()
      this.loadingAnimation.play()
      this.editable = false
      this.app.editor.target = []
    }
    else {
      this.loadingAnimation.pause()
      this.editable = true
    }

    this.loadingBox.visible = l
  }

  private centerLoading() {
    this.loadingBox.width = this.img.width
    this.loadingBox.height = this.img.height

    this.loadingIcon.x = (this.img.width - this.loadingIcon.width) / 2
    this.loadingIcon.y = (this.img.height - this.loadingIcon.height) / 2
  }
}
