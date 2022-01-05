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
  data: calendarData
}

const fetchCalendars = async () => {
  return fetch(`${location.origin}/config/calendars.json`, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  }).then(value => value.json())
}

export {
  calendarCategoryItem,
  calendarCategoryItems,
  calendarCategory,
  calendarData,
  calendarConfig
}

export default fetchCalendars
