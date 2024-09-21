import { createClient } from '@egoist/tipc/renderer'
// @ts-ignore
import { Router } from '../../../main/tipc/index'

export const client = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke
})
