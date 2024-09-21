import { useState } from 'react'

function Screenshot() {
  const [screenshots, setScreenshots] = useState<{ url: string; timestamp: string }[]>([])
  const [isRunning, setIsRunning] = useState(false)

  return (
    <div className="App">
      {!!screenshots?.length && (
        <div>
          {screenshots?.map((screen) => (
            <div>
              <p>Latest screenshot taken at: {screen.timestamp}</p>
              <img src={`data:image/png;base64,${screen.url}`} alt="Screenshot" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Screenshot
