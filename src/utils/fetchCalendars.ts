const configUrl : string = require('./configUrl.json')

interface calendarCategoryItem {
  key: string
  name: string,
  calendar: string
}

interface calendarCategoryItems {
  [key: string]: calendarCategoryItem
}

interface calendarCategory {
  key: string,
  name: string,
  items: calendarCategoryItems
}

interface calendarData {
  [key: string]: calendarCategory
}

interface calendarConfig {
  default?: string,
  root?: string,
  data: calendarData
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
  calendarCategoryItem,
  calendarCategoryItems,
  calendarCategory,
  calendarData,
  calendarConfig
}

export default fetchCalendars
