import { notificationRoute } from './notification'
import { screenshotRoute } from './screenshot'

export const router = {
  ...notificationRoute,
  ...screenshotRoute
}

export type Router = typeof router
