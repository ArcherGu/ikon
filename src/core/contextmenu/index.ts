import './index.css'
import type { App, Group } from 'leafer-ui'

export class Contextmenu {
  private bg: HTMLDivElement
  private menu: HTMLDivElement
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
    const menus = [
      {
        type: 'action', // 'action' | 'separator
        name: 'Move Forward',
        action: this.moveForward,
      },
      {
        type: 'action',
        name: 'Move Backward',
        action: this.moveBackward,
      },
      {
        type: 'action',
        name: 'Move to Top',
        action: this.moveToTop,
      },
      {
        type: 'action',
        name: 'Move to Bottom',
        action: this.moveToBottom,
      },
      {
        type: 'separator',
        name: '',
        action: () => { },
      },
      {
        type: 'action',
        name: 'Delete',
        action: this.deleteSelectedItems,
      },
    ]

    for (const menu of menus) {
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
