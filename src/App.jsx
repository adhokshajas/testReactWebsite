import { useEffect, useRef } from 'react'
import CampaignBar from './components/CampaignBar'
import Storefront from './components/Storefront'
import AttributionInspector from './components/AttributionInspector'
import { initializeAFQueue, logAutoVisit } from './utils/appsflyer'
import './App.css'

function App() {
  const hasLoggedAutoVisit = useRef(false)

  useEffect(() => {
    // Initialize AppsFlyer queue (creates AF function if not already defined by snippet)
    initializeAFQueue()

    // Log the automatic SDK LOAD visit exactly once per session
    // The AppsFlyer snippet fires this automatically on page load;
    // we just log it in the Inspector for visibility
    if (!hasLoggedAutoVisit.current) {
      hasLoggedAutoVisit.current = true
      logAutoVisit()
    }
  }, [])

  return (
    <div className="app-container">
      <CampaignBar />
      <div className="main-layout">
        <div className="left-panel">
          <Storefront />
        </div>
        <div className="right-panel">
          <AttributionInspector />
        </div>
      </div>
    </div>
  )
}

export default App
