import './index.css'
import type { App } from 'leafer-ui'

export class Contextmenu {
  private bg: HTMLDivElement
  private menu: HTMLDivElement
  constructor(private app: App) {
    this.bg = document.createElement('div')
    this.bg.className = 'ikon-contextmenu-bg'
    document.body.appendChild(this.bg)

    this.menu = document.createElement('div')
    this.menu.className = 'ikon-contextmenu'
    this.bg.appendChild(this.menu)

    this.bg.addEventListener('click', (e) => {
      e.preventDefault()
      this.hide()
    })
    this.bg.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.hide()
    })
  }

  show = (e: MouseEvent) => {
    this.bg.className = 'ikon-contextmenu-bg show'
    this.menu.style.left = `${e.clientX}px`
    this.menu.style.top = `${e.clientY}px`
  }

  hide = () => {
    this.bg.className = 'ikon-contextmenu-bg'
  }

  destroy() {
    this.bg.remove()
  }
}
