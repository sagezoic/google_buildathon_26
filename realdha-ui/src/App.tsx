import { PrefsProvider } from './app/prefs'
import { Routes } from './app/routes'

export default function App() {
  return (
    <PrefsProvider>
      <Routes />
    </PrefsProvider>
  )
}
