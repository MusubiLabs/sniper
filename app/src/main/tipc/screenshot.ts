import { tipc } from '@egoist/tipc/main'
import { BrowserWindow, desktopCapturer, screen } from 'electron'
import sharp from 'sharp'
import { showNotification } from './notification'

const t = tipc.create()

let screenshotInterval: NodeJS.Timeout | null = null
let isScreenshotRunning: boolean = false

interface ScreenshotData {
  image: string[]
  timestamp: string
}

// TODO: 截图应该是一个单独的子进程来完成
// 获取的用户的屏幕截图
async function takeScreenshots(): Promise<ScreenshotData> {
  try {
    const displays = screen.getAllDisplays()
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 10000, height: 10000 } // Large size to ensure full quality
    })

    const images: string[] = []

    for (const display of displays) {
      const source = sources.find((s) => s.display_id === display.id.toString())
      if (source && source.thumbnail) {
        let imageBuffer = source.thumbnail.toPNG()

        // Compress the image if it's too large
        let quality = 80
        let scale = 1

        while (imageBuffer.length > 1024 * 1024 && scale > 0.1) {
          imageBuffer = await sharp(imageBuffer)
            .resize({
              width: Math.floor(display.bounds.width * scale),
              height: Math.floor(display.bounds.height * scale)
            })
            .png({ quality })
            .toBuffer()

          if (imageBuffer.length > 1024 * 1024) {
            if (quality > 10) {
              quality -= 10
            } else {
              scale *= 0.9
            }
          }
        }

        // const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`

        const base64Image = imageBuffer.toString('base64')
        images.push(base64Image)
      }
    }

    return {
      image: images,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Screenshot error:', error)
    throw error
  }
}

// 通过屏幕截图获取用户的生产力情况
async function getUserAttention(params: { address: string; goalId: string; screens: string[] }) {
  console.log('getUserAttention')
  const result = await fetch('http://localhost:3000/api/goals/record', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...params
    })
  })
  const data = await result.json()

  const distracted = data?.data?.distracted

  console.log(distracted)

  if (!distracted) {
    showNotification('Stay Focused', data?.data?.feedback || 'You are still snipered')
  }

  return data?.data
}

export const screenshotRoute = {
  startScreenshotTask: t.procedure
    .input<{ interval?: number; goalId: string; address: string; sessionId?: string }>()
    .action(async ({ input }) => {
      const { address, goalId } = input
      if (isScreenshotRunning) {
        throw new Error('Screenshot task is already running')
      }

      isScreenshotRunning = true
      screenshotInterval = setInterval(
        async () => {
          try {
            const screenshots = await takeScreenshots()
            let aiResult = null

            if (screenshots) {
              aiResult = await getUserAttention({
                address,
                goalId,
                screens: screenshots.image
              })
            }

            // Here you can emit the screenshot info to the renderer process
            BrowserWindow.getAllWindows()[0].webContents.send(
              'screenshot-taken',
              screenshots,
              aiResult
            )
          } catch (error) {
            console.error('Error in screenshot interval:', error)
          }
        },
        input.interval ?? 1000 * 60 * 2
      )

      return { success: true }
    }),
  stopScreenshotTask: t.procedure.action(async () => {
    if (!isScreenshotRunning) {
      throw new Error('Screenshot task is not running')
    }

    if (screenshotInterval) {
      clearInterval(screenshotInterval)
    }
    isScreenshotRunning = false
    return { success: true }
  }),
  takeScreenshot: t.procedure
    .input<{
      address: string
      goalId: string
    }>()
    .action(async ({ input }) => {
      const { address, goalId } = input

      console.log(input)

      const screenshots = await takeScreenshots()
      const aiResult = await getUserAttention({
        address,
        goalId,
        screens: screenshots.image
      })

      return aiResult
    }),
  isScreenshotRunning: t.procedure.action(async () => {
    return isScreenshotRunning
  })
}
