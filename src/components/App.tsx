import FullCalendar, { EventApi, EventClickArg } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import iCalendarPlugin from '@fullcalendar/icalendar'
import frLocale from '@fullcalendar/core/locales/fr'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import { Nullable } from '../utils/types'
import useSearchParams from '../hooks/useSearchParams'
import useTitle from '../hooks/useTitle'
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

  const [categoryKey, setCategoryKey] = useState<Nullable<string>>(null)
  const [resourceKey, setResourceKey] = useState<Nullable<string>>(null)
  const calendarRef = useRef<FullCalendar>(null)
  const calendar = calendarRef.current
  // ;(window as any).fc = calendar // for testing/debugging purposes

  useSearchParams([
    ['type', categoryKey, setCategoryKey, props.default],
    ['ressource', resourceKey, setResourceKey],
    ['startdate', null /* remove from URL */],
    ['view', null]
  ])

  const currentViewUrl = () => {
    const url = new URL(location.href)
    const startDate = calendar?.getApi().getDate()
    if (startDate) {
      startDate?.setHours(12) // since the timezone is fixed to Europe/Brussels, "today at noon" is always the same as "today in GMT"
      url.searchParams.set('startdate', startDate.toISOString().slice(0, 10))
    }
    const view = calendar?.getApi().view.type
    if (view) {
      url.searchParams.set('view', view)
    }
    return url.toString()
  }

  const selectedResource =
    resourceKey && categoryKey
      ? props.data[categoryKey].items[resourceKey]
      : undefined

  const icsUrl = selectedResource
    ? new URL(selectedResource.calendar, props.root).toString()
    : null

  // useMemo avoids re-creating the {url, format} object
  // hences avoids refreshing the calendar on every re-render of our component
  const currentEvents = useMemo(
    () =>
      icsUrl
        ? {
            url: icsUrl,
            format: 'ics'
          }
        : undefined,
    [icsUrl]
  )

  useTitle(selectedResource)

  /**
   * Generic way to allow children component to request a switch to a new resource
   * based on resourceKey and (optionaly) categoryKey
   */
  const switchToResource = useCallback(
    (resourceKey?: string, categoryKey?: string) => {
      setSelectedEvent(null)
      setCategoryKey(
        categoryKey ??
          (resourceKey ? findCategoryKey(props, resourceKey) : null)
      )
      setResourceKey(resourceKey ?? null)
    },
    [props]
  )

  const listenKeys = (e: KeyboardEvent) => {
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      let found = true
      switch (e.key) {
        case 'ArrowLeft':
          calendar?.getApi().prev()
          break
        case 'ArrowRight':
          calendar?.getApi().next()
          break
        case 'm':
          calendar?.getApi().changeView('dayGridMonth')
          break
        case 'd':
          calendar?.getApi().changeView('timeGridDay')
          break
        case 'w':
          calendar?.getApi().changeView('timeGridWeek')
          break
        case 'g':
          // eslint-disable-next-line no-case-declarations
          const target = prompt(
            'What do you want to display ?',
            'B111'
          )?.toUpperCase()
          if (target) switchToResource(target)
          break
        default:
          found = false
      }
      if (found) e.preventDefault()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', listenKeys)
    return () => window.removeEventListener('keydown', listenKeys)
  })

  if (!props.data || !props.default || !props.root) {
    return <pre>Pas de chance, le site est cassé..</pre>
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
          categoryKey={categoryKey}
          resourceKey={resourceKey}
          switchToResource={switchToResource}
        />

        <FullCalendar
          ref={calendarRef}
          plugins={[
            timeGridPlugin,
            dayGridPlugin,
            iCalendarPlugin,
            momentTimezonePlugin
          ]}
          initialView={
            new URL(location.href).searchParams.get('view') || 'timeGridWeek'
          }
          weekends={true}
          hiddenDays={[0]}
          headerToolbar={{
            start: 'prev today next viewlink',
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
          initialDate={
            new URL(location.href).searchParams.get('startdate') || undefined
          }
          viewClassNames={() => [icsUrl ? 'visible' : 'invisible']}
          customButtons={{
            viewlink: {
              text: 'Copier l\'URL de la vue actuelle',
              click: async () => {
                await navigator.clipboard.writeText(currentViewUrl())
              }
            }
          }}
          eventSourceFailure={errorObj => {
            console.log(errorObj)
            alert(
              'could not fetch events. please check connection and refresh.'
            )
          }}
        />

        {icsUrl && <CalLink link={icsUrl} />}
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
