import { ChangeEvent, Dispatch, useEffect, useState } from 'react'
import Select from './Select'
import { CalendarCategory, CalendarData } from '../utils/fetchCalendars'

interface ConfigObject {
  data: CalendarData
  default: string
  root: string
}

const ResourceSelector = (props: {
  config: ConfigObject
  updateUrl: Dispatch<string | null>
}): JSX.Element => {
  const { config, updateUrl } = props

  const search = new URLSearchParams(location.search)

  const [selectedCategory, setSelectedCategory] = useState(
    search.has('type')
      ? config.data[search.get('type')!]
      : config.data[config.default]
  )
  const [selectedResource, setSelectedResource] = useState(
    search.has('ressource')
      ? selectedCategory.items[search.get('ressource')!]
      : undefined
  )

  useEffect(() =>
    updateUrl(
      selectedResource
        ? new URL(selectedResource.calendar, config.root).toString()
        : null
    )
  )

  useEffect(() => {
    const defaultTitle: string = 'ESI Horaires'

    document.title = selectedResource
      ? `${selectedResource.name} - ${defaultTitle}`
      : defaultTitle
  }, [selectedResource])

  const categorySelectionHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCat = config.data[e.target.value]

    setSelectedCategory(newCat as CalendarCategory)
    setSelectedResource(undefined)
  }

  const calSelectionHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCal = selectedCategory?.items[e.target.value]
    setSelectedResource(newCal)
    setExpanded(false)
    history.pushState(
      {
        category: selectedCategory,
        ressource: newCal
      },
      `Horaires ${newCal?.name}`,
      `?type=${selectedCategory?.key}&ressource=${newCal?.key}`
    )
  }

  const [expanded, setExpanded] = useState(!selectedResource)

  /**
   * Si l'utilisateur retourne à la page précédente, affiche le bon calendrier
   */
  const popStateHandler = (e: PopStateEvent) => {
    setSelectedCategory(e.state.category)
    setSelectedResource(e.state.ressource)
  }

  useEffect(() => {
    window.addEventListener('popstate', popStateHandler)
    return () => window.removeEventListener('popstate', popStateHandler)
  })

  return (
    <>
      <div className="accordion mb-3" id="calSelector">
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button
              className={`accordion-button ${expanded ? '' : 'collapsed'}`}
              type="button"
              aria-expanded={expanded}
              aria-controls="collapseOne"
              onClick={() => setExpanded(!expanded)}>
              <strong>
                {selectedResource
                  ? selectedResource.name
                  : 'Parcourir les horaires..'}
              </strong>
            </button>
          </h2>
          <div
            className={`accordion-collapse collapse ${expanded ? 'show' : ''}`}
            aria-labelledby="headingOne"
            data-bs-parent="#calSelector">
            <div className="accordion-body">
              <div className="row">
                <Select
                  name="Type"
                  selected={selectedCategory}
                  selectionHandler={categorySelectionHandler}
                  items={config.data}
                />
                {selectedCategory && (
                  <Select
                    name={`Choisissez parmi les ${selectedCategory.name.toLowerCase()}`}
                    selected={selectedResource}
                    selectionHandler={calSelectionHandler}
                    items={selectedCategory.items}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResourceSelector
