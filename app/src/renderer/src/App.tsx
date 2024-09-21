import '@rainbow-me/rainbowkit/styles.css'
import { ReactQueryProvider } from './providers/ReactQueryProvider'
import { Web3Provider } from './providers/Web3Provider'
import PageRouter from './router'

function App() {
  return (
    <ReactQueryProvider>
      <Web3Provider>
        <PageRouter />
      </Web3Provider>
    </ReactQueryProvider>
  )
}

export default App
