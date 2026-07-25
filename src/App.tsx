import { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import TitleBar from './components/TitleBar'
import SettingsDialog from './components/SettingsDialog'
import './App.css'

export default function App() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <ThemeProvider>
      <div className="app">
        <TitleBar onSettings={() => setShowSettings(true)} />
        <Home />
        <div className="watermark">developed by csy &amp; gr</div>
        {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
      </div>
    </ThemeProvider>
  )
}
