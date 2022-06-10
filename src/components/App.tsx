import FullCalendar, { EventApi, EventClickArg } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import iCalendarPlugin from '@fullcalendar/icalendar'
import frLocale from '@fullcalendar/core/locales/fr'
import ResourceSelector from './ResourceSelector'
import { useEffect, useMemo, useState } from 'react'
import Footer from './Footer'
import CalLink from './CalLink'
import EventModal from './EventModal'
import { CalendarData } from '../utils/fetchCalendars'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'

interface AppProps {
  data?: CalendarData
  default?: string
  root?: string
}

const App = (props: AppProps): JSX.Element => {
  if (!props.data || !props.default || !props.root) {
    return <pre>Pas de chance, le site est cassé..</pre>
  }

  const calendarsData = props.data

  const search = new URLSearchParams(location.search)

  const [selectedCategory, setSelectedCategory] = useState(
    search.has('type')
      ? calendarsData[search.get('type')!]
      : calendarsData[props.default]
  )
  const [selectedResource, setSelectedResource] = useState(
    search.has('ressource')
      ? selectedCategory.items[search.get('ressource')!]
      : undefined
  )
  const [selectedEvent, setSelectedEvent] = useState(
    undefined as EventApi | undefined)

  const calendarUrl = selectedResource && (new URL(selectedResource.calendar, props.root)).toString()

  useEffect(() => {
    const defaultTitle : string = 'ESI Horaires'

    document.title = selectedResource ? `${selectedResource.name} - ${defaultTitle}` : defaultTitle
  }, [selectedResource])

  const selectEventHandler = (e: EventClickArg) => {
    e.jsEvent.preventDefault()
    setSelectedEvent(e.event)
  }

  /**
   * Si l'utilisateur retourne à la page précédente, affiche le bon calendrier
   */
  window.addEventListener('popstate', (e) => {
    setSelectedCategory(e.state.category)
    setSelectedResource(e.state.ressource)
  })

  // useMemo avoids re-creating the {url, format} object
  // hences avoids refreshing the calendar on every re-render of our component
  const currentEvents = useMemo(() => selectedResource
    ? {
        url: calendarUrl,
        format: 'ics'
      }
    : undefined, [selectedResource])

  return (
    <>
      <main className={'container-fluid mt-3'}>
        <ResourceSelector items={calendarsData}
                          category={selectedCategory}
                          setCategory={setSelectedCategory}
                          selected={selectedResource}
                          setSelected={setSelectedResource}/>

        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, iCalendarPlugin, momentTimezonePlugin]}
          initialView={'timeGridWeek'}
          weekends={true}
          hiddenDays={[0]}
          headerToolbar={{
            start: 'prev today next',
            center: 'title',
            end: 'dayGridMonth timeGridWeek timeGridDay'
          }}
          slotMinTime={'08:00:00'}
          slotMaxTime={'22:00:00'}
          businessHours={{
            dayOfWeek: [1, 2, 3, 4, 5],
            startTime: '08:15',
            endTime: '18:00'
          }}
          fixedWeekCount={false}
          showNonCurrentDates={false}
          locale={frLocale}
          timeZone="Europe/Brussels"
          events={currentEvents}
          contentHeight={'75vh'}
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
        />

        <CalLink link={calendarUrl}/>
      </main>

      {selectedEvent &&
      <EventModal selectedEvent={selectedEvent}
                  setSelectedEvent={setSelectedEvent}/>}

      <Footer/>
    </>
  )
}

export default App
