import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeAnalytics } from './lib/analytics.ts'

initializeAnalytics()

// The build writes a readable page snapshot here. Replace it with the live app;
// do not hydrate, as game saves, URL state and viewport can differ from the build.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
