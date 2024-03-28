import { Image } from 'leafer-ui'

export class IkonImage extends Image {
  sourceUrl: string
  clipUrl?: string

  constructor(url: string) {
    super({ url })

    this.sourceUrl = url
  }
}
