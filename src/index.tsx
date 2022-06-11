import ReactDOM from 'react-dom'
import App from './components/App'
import fetchCalendars, { CalendarConfig } from './utils/fetchCalendars'
;(async () => {
  const data: CalendarConfig = await fetchCalendars()

  ReactDOM.render(
    <App data={data?.data} default={data?.default} root={data?.root} />,
    document.getElementById('root')
  )
})()
