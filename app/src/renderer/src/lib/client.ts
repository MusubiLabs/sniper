import { createClient } from '@egoist/tipc/renderer'
// @ts-ignore
import { Router } from '../../../../main/tipc'

export const client = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke
})
