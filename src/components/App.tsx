import FullCalendar, { EventApi, EventClickArg } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import iCalendarPlugin from '@fullcalendar/icalendar'
import frLocale from '@fullcalendar/core/locales/fr'
import { useEffect, useMemo, useState } from 'react'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import { Nullable } from '../utils/types'
import useSearchParams from '../hooks/useSearchParams'
import { CalendarConfig } from '../utils/fetchCalendars'
import ResourceSelector from './ResourceSelector'
import Footer from './Footer'
import CalLink from './CalLink'
import EventModal from './EventModal'

const findCategoryKey = (config: CalendarConfig, resourceKey: string) => {
  for (const [catKey, cat] of Object.entries(config.data)) {
    if (Object.keys(cat.items).includes(resourceKey)) return catKey
  }
  return null
}

const App = (props: CalendarConfig): JSX.Element => {
  const [selectedEvent, setSelectedEvent] = useState(null as EventApi | null)
  const [calendarUrl, setCalendarUrl] = useState(null as string | null)

  const [categoryKey, setCategoryKey] = useState(null as Nullable<string>)
  const [resourceKey, setResourceKey] = useState(null as Nullable<string>)

  useSearchParams([
    ['type', categoryKey, setCategoryKey, props.default],
    ['ressource', resourceKey, setResourceKey]
  ])

  // useMemo avoids re-creating the {url, format} object
  // hences avoids refreshing the calendar on every re-render of our component
  const currentEvents = useMemo(
    () =>
      calendarUrl
        ? {
            url: calendarUrl,
            format: 'ics'
          }
        : undefined,
    [calendarUrl]
  )
  const selectedResource =
    resourceKey && categoryKey
      ? props.data[categoryKey].items[resourceKey]
      : undefined

  useEffect(() => {
    return setCalendarUrl(
      selectedResource
        ? new URL(selectedResource.calendar, props.root).toString()
        : null
    )
  }, [props.root, resourceKey, selectedResource])

  useEffect(() => {
    const defaultTitle: string = 'ESI Horaires'

    document.title = resourceKey
      ? `${resourceKey} - ${defaultTitle}`
      : defaultTitle
  }, [resourceKey])

  if (!props.data || !props.default || !props.root) {
    return <pre>Pas de chance, le site est cassé..</pre>
  }
  const switchToResource = (resourceKey?: string, categoryKey?: string) => {
    let wantedCategoryKey: Nullable<string> = categoryKey ?? null
    const wantedResourceKey: Nullable<string> = resourceKey ?? null

    if (wantedResourceKey && !wantedCategoryKey) {
      wantedCategoryKey = findCategoryKey(props, wantedResourceKey)
    }
    setSelectedEvent(null)
    setCategoryKey(wantedCategoryKey)
    setResourceKey(wantedResourceKey)
  }

  const selectEventHandler = (e: EventClickArg) => {
    e.jsEvent.preventDefault()
    setSelectedEvent(e.event)
  }

  return (
    <>
      <main className="container-fluid mt-3">
        <ResourceSelector
          config={props}
          updateUrl={setCalendarUrl}
          categoryKey={categoryKey}
          resourceKey={resourceKey}
          switchToResource={switchToResource}
        />

        <FullCalendar
          plugins={[
            timeGridPlugin,
            dayGridPlugin,
            iCalendarPlugin,
            momentTimezonePlugin
          ]}
          initialView="timeGridWeek"
          weekends={true}
          hiddenDays={[0]}
          headerToolbar={{
            start: 'prev today next',
            center: 'title',
            end: 'dayGridMonth timeGridWeek timeGridDay'
          }}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          businessHours={{
            dayOfWeek: [1, 2, 3, 4, 5],
            startTime: '08:15',
            endTime: '18:00'
          }}
          fixedWeekCount={false}
          showNonCurrentDates={false}
          firstDay={0}
          locale={frLocale}
          timeZone="Europe/Brussels"
          events={currentEvents}
          contentHeight="75vh"
          stickyHeaderDates={true}
          eventClick={selectEventHandler}
          eventDataTransform={event => {
            const eventProps = event.extendedProps
            const location = eventProps?.location
            if (location && !event.title?.endsWith(location)) {
              event.title = `${event.title} - ${location}`
            }

            return event
          }}
          viewClassNames={() => [calendarUrl ? 'visible' : 'invisible']}
        />

        {calendarUrl && <CalLink link={calendarUrl} />}
      </main>

      {selectedEvent && (
        <EventModal
          selectedEvent={selectedEvent}
          close={() => setSelectedEvent(null)}
          switchTo={switchToResource}
        />
      )}

      <Footer />
    </>
  )
}

export default App
