import { Dispatch, useEffect, useState } from 'react'
import { CalendarConfig } from '../utils/fetchCalendars'
import Select from './Select'

interface ResourceSelectorProps {
  config: CalendarConfig
  updateUrl: Dispatch<string | null>
}

const ResourceSelector = (props: ResourceSelectorProps): JSX.Element => {
  const { config, updateUrl } = props

  const search = new URLSearchParams(location.search)
  const [initialCategoryKey] = useState(search.get('type') ?? config.default)
  const [initialResourceKey] = useState(search.get('ressource'))

  const [selectedCategoryKey, setSelectedCategoryKey] =
    useState(initialCategoryKey)
  const [selectedResourceKey, setSelectedResourceKey] =
    useState(initialResourceKey)

  const [expanded, setExpanded] = useState(!selectedResourceKey)

  const selectedCategory = config.data[selectedCategoryKey]
  const selectedResource = selectedResourceKey
    ? selectedCategory?.items[selectedResourceKey]
    : undefined

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

  const categorySelectionHandler = (newCategory: string) => {
    setSelectedCategoryKey(newCategory)
    setSelectedResourceKey(null)
  }

  const calSelectionHandler = (newResourceKey: string) => {
    setSelectedResourceKey(newResourceKey)
    setExpanded(false)
    history.pushState(
      {
        category: selectedCategoryKey,
        resource: newResourceKey
      },
      '',
      `?type=${selectedCategoryKey}&ressource=${newResourceKey}`
    )
  }

  /**
   * Si l'utilisateur retourne à la page précédente, affiche le bon calendrier
   */
  const popStateHandler = (e: PopStateEvent) => {
    setSelectedCategoryKey(e.state?.category || initialCategoryKey)
    setSelectedResourceKey(e.state?.resource || initialResourceKey)
  }

  useEffect(() => {
    window.addEventListener('popstate', popStateHandler)
    return () => window.removeEventListener('popstate', popStateHandler)
  })

  type KeyType = string | number

  function mapObject<T, S>(
    obj: { [k: KeyType]: T },
    func: (k: KeyType, v: T) => S
  ) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, func(k, v)])
    )
  }
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
                {selectedResource?.name ?? 'Parcourir les horaires..'}
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
                  selectedKey={selectedCategoryKey}
                  selectionHandler={categorySelectionHandler}
                  items={mapObject(config.data, (k, v) => v.name)}
                />
                {selectedCategory && (
                  <Select
                    name={`Choisissez parmi les ${selectedCategory.name.toLowerCase()}`}
                    selectedKey={selectedCategoryKey}
                    selectionHandler={calSelectionHandler}
                    items={mapObject(selectedCategory.items, (k, v) => v.name)}
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
