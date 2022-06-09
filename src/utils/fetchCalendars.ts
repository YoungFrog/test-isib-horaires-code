const configUrl : string = require('./configUrl.json')

interface CalendarCategoryItem {
  key: string
  name: string,
  calendar: string
}

interface CalendarCategoryItems {
  [key: string]: CalendarCategoryItem
}

interface CalendarCategory {
  key: string,
  name: string,
  items: CalendarCategoryItems
}

interface CalendarData {
  [key: string]: CalendarCategory
}

interface CalendarConfig {
  default?: string,
  root?: string,
  data: CalendarData
}

const fetchCalendars = async () => {
  return fetch(configUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  }).then(value => value.json())
    .then(json => ({ ...json, root: new URL(json.root, new URL(configUrl, location.href)) }))
}

export {
  CalendarCategoryItem,
  CalendarCategoryItems,
  CalendarCategory,
  CalendarData,
  CalendarConfig
}

export default fetchCalendars
