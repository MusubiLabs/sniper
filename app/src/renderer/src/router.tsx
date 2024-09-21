import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Header from './components/layout/header'
import LoginLayer from './components/layout/login-layer'
import SideBar from './components/layout/sidebar'
import { Toaster } from './components/ui/toaster'
import HomePage from './pages/home'
import Profile from './pages/profile'

export default function PageRouter() {
  return (
    <Router>
      <LoginLayer>
        <main className="w-screen min-h-screen flex">
          <SideBar />
          <section className="w-full h-screen overflow-auto">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </section>
        </main>
        <Toaster />
      </LoginLayer>
    </Router>
  )
}
