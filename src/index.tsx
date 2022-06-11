import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './components/App'
import fetchCalendars, { CalendarConfig } from './utils/fetchCalendars'
;(async () => {
  const data: CalendarConfig = await fetchCalendars()

  const container = document.getElementById('root')
  createRoot(container!).render(
    <StrictMode>
      <App {...data} />
    </StrictMode>
  )
})()
