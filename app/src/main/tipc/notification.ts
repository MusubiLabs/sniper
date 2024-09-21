import { tipc } from '@egoist/tipc/main'
import { Notification } from 'electron'

const t = tipc.create()

export function showNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({
      title: title,
      body: body
    }).show()
  } else {
    console.log('系统通知不被支持')
  }
}

export const notificationRoute = {
  showNotification: t.procedure
    .input<{ title: string; body: string }>()
    .action(async ({ input }) => {
      showNotification(input.title, input.body)
    }),
  ding: t.procedure.action(async () => {
    console.log('bong')
  })
}
