import { Dispatch, SetStateAction } from 'react'
import { EventApi } from '@fullcalendar/react'
import parseDescription from '../utils/parseDescription'

const EventModal = (props: {
  selectedEvent: EventApi
  setSelectedEvent: Dispatch<SetStateAction<EventApi | null>>
}): JSX.Element => {
  const { selectedEvent, setSelectedEvent } = props

  const description = selectedEvent.extendedProps.description
  const eventAttributes = parseDescription(description)

  return (
    <div className="modal" tabIndex={-1} style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{selectedEvent.title}</h5>
            <button
              type="button"
              className="btn-close text-reset"
              aria-label="Close"
              onClick={() => {
                setSelectedEvent(null)
              }}
            />
          </div>
          <div className="modal-body">
            <table className="table">
              <tbody>
                {eventAttributes.aa && (
                  <tr>
                    <th scope="row">Matière</th>
                    <td>
                      <p>{eventAttributes.aa}</p>
                    </td>
                  </tr>
                )}

                {eventAttributes.lieux && (
                  <tr>
                    <th scope="row">Locaux</th>
                    <td>
                      {eventAttributes.lieux.map(lieu => (
                        <p key={lieu}>{lieu}</p>
                      ))}
                    </td>
                  </tr>
                )}

                {eventAttributes.profs && (
                  <tr>
                    <th scope="row">Professeurs</th>
                    <td>
                      {eventAttributes.profs.map(prof => (
                        <p key={prof}>{prof}</p>
                      ))}
                    </td>
                  </tr>
                )}

                {eventAttributes.groupes && (
                  <tr>
                    <th scope="row">Groupes</th>
                    <td>
                      {eventAttributes.groupes.map(groupe => (
                        <p key={groupe}>{groupe}</p>
                      ))}
                    </td>
                  </tr>
                )}

                {eventAttributes.type && (
                  <tr>
                    <th scope="row">Type</th>
                    <td>
                      <p>{eventAttributes.type}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventModal
