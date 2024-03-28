import './index.css'
import type { App, Group } from 'leafer-ui'
import imglyRemoveBackground from '@imgly/background-removal'
import { IkonImage } from '../ikon-image'

type ContextmenuItem = { type: 'separator', dom?: HTMLDivElement } |
  { id: string, type: 'action', name: string, action: () => void, dom?: HTMLDivElement }

export class Contextmenu {
  private bg: HTMLDivElement
  private menu: HTMLDivElement
  private items: ContextmenuItem[] = []
  public enableRemoveBackground = false

  constructor(private app: App, private icon: Group) {
    this.bg = document.createElement('div')
    this.bg.className = 'ikon-contextmenu-bg'
    document.body.appendChild(this.bg)

    this.menu = document.createElement('div')
    this.menu.className = 'ikon-contextmenu'
    this.createMenus()
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

  private get editor() {
    return this.app.editor
  }

  private get selectedItems() {
    return this.editor.list
  }

  private createMenus() {
    this.items = [
      {
        id: 'move-forward',
        type: 'action', // 'action' | 'separator
        name: 'Move Forward',
        action: this.moveForward,
      },
      {
        id: 'move-backward',
        type: 'action',
        name: 'Move Backward',
        action: this.moveBackward,
      },
      {
        id: 'move-to-top',
        type: 'action',
        name: 'Move to Top',
        action: this.moveToTop,
      },
      {
        id: 'move-to-bottom',
        type: 'action',
        name: 'Move to Bottom',
        action: this.moveToBottom,
      },
      {
        id: 'remove-background',
        type: 'action',
        name: 'Remove Background',
        action: this.removeOrRestoreBackground,
      },
      {
        type: 'separator',
      },
      {
        id: 'delete',
        type: 'action',
        name: 'Delete',
        action: this.deleteSelectedItems,
      },
    ]

    for (const menu of this.items) {
      const menuItem = document.createElement('div')
      if (menu.type === 'separator') {
        menuItem.className = 'ikon-contextmenu-separator'
      }
      else {
        menuItem.className = 'ikon-contextmenu-item'
        menuItem.textContent = menu.name
        menuItem.addEventListener('click', (e) => {
          e.preventDefault()
          menu.action()
          this.hide()
        })
      }
      this.menu.appendChild(menuItem)
      menu.dom = menuItem
    }
  }

  private moveToTop = () => {
    const { children } = this.icon
    const newChildren = []
    const tailChildren = []
    for (const child of children) {
      if (this.selectedItems.some(e => e.innerId === child.innerId))
        tailChildren.push(child)
      else
        newChildren.push(child)
    }
    newChildren.push(...tailChildren)
    this.icon.children = newChildren
    this.app.tree.forceRender()
  }

  private moveToBottom = () => {
    const { children } = this.icon
    const newChildren = []
    const tailChildren = []
    for (const child of children) {
      if (this.selectedItems.some(e => e.innerId === child.innerId))
        tailChildren.push(child)
      else
        newChildren.push(child)
    }
    newChildren.unshift(...tailChildren)
    this.icon.children = newChildren
    this.app.tree.forceRender()
  }

  private moveForward = () => {
    const { children } = this.icon
    const newChildren = [...children]
    for (let i = newChildren.length - 2; i >= 0; i--) {
      if (this.selectedItems.some(e => e.innerId === newChildren[i].innerId))
        [newChildren[i], newChildren[i + 1]] = [newChildren[i + 1], newChildren[i]]
    }

    this.icon.children = newChildren
    this.app.tree.forceRender()
  }

  private moveBackward = () => {
    const { children } = this.icon
    const newChildren = [...children]
    for (let i = 1; i < newChildren.length; i++) {
      if (this.selectedItems.some(e => e.innerId === newChildren[i].innerId))
        [newChildren[i], newChildren[i - 1]] = [newChildren[i - 1], newChildren[i]]
    }

    this.icon.children = newChildren
    this.app.tree.forceRender()
  }

  private removeOrRestoreBackground = async () => {
    if (!(this.enableRemoveBackground && (this.selectedItems.length === 1 && this.selectedItems[0] instanceof IkonImage)))
      return

    const img = this.selectedItems[0]
    // restore background
    if (img.clipUrl && img.clipUrl === img.url) {
      img.url = img.sourceUrl
      return
    }

    // img has been clipped
    if (img.clipUrl) {
      img.url = img.clipUrl
      return
    }

    const blob = await imglyRemoveBackground(img.sourceUrl, {
      debug: true,
    })
    const url = URL.createObjectURL(blob)
    img.clipUrl = url
    img.url = url
  }

  private deleteSelectedItems = () => {
    const items = [...this.selectedItems]
    items.forEach((item) => {
      item.remove()
    })

    this.editor.target = []
  }

  show = (e: MouseEvent) => {
    if (this.editor.list.length === 0)
      return

    const removeBgItem = this.items.find(e => e.type === 'action' && e.id === 'remove-background')!.dom!
    if (this.enableRemoveBackground && (this.selectedItems.length === 1 && this.selectedItems[0] instanceof IkonImage)) {
      removeBgItem.style.display = 'block'
      const img = this.selectedItems[0]
      if (img.clipUrl && img.clipUrl === img.url)
        removeBgItem.textContent = 'Restore Background'
      else
        removeBgItem.textContent = 'Remove Background'
    }
    else { removeBgItem.style.display = 'none' }

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
