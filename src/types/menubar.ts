export type MenuBarStatus = 'idle' | 'recording'

export interface MenuBarAction {
  id: string
  label: string
  onClick: () => void
}

export interface MenuBarState {
  status: MenuBarStatus
  visible: boolean
}
