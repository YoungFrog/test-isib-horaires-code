const configUrl: string = require('./configUrl.json')

interface Resource {
  name: string
  calendar: string // url vers l'ics
}

interface CalendarResources {
  [key: string]: Resource
}

interface CalendarCategory {
  name: string
  items: CalendarResources
}

interface CalendarData {
  [key: string]: CalendarCategory
}

interface CalendarConfig {
  default: string
  root: string
  data: CalendarData
}

const fetchCalendars = async (): Promise<CalendarConfig> => {
  return fetch(configUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  })
    .then(value => value.json())
    .then(json => ({
      ...json,
      root: new URL(json.root, new URL(configUrl, location.href))
    }))
}

export { CalendarConfig, Resource }

export default fetchCalendars
