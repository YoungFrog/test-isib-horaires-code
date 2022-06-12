import { Dispatch, useCallback, useEffect, useState } from 'react'
import { CalendarConfig } from '../utils/fetchCalendars'
import Select from './Select'

interface ResourceSelectorProps {
  config: CalendarConfig
  updateUrl: Dispatch<string | null>
}
interface AppState {
  categoryKey?: string
  resourceKey?: string
}

const ResourceSelector = (props: ResourceSelectorProps): JSX.Element => {
  const { config, updateUrl } = props

  const getAppStateFromUrl = useCallback((): AppState => {
    const search = new URLSearchParams(location.search)
    const categoryKey = search.get('type') ?? config.default
    const resourceKey = search.get('ressource') ?? undefined
    return { categoryKey, resourceKey }
  }, [config])

  const [appState, setAppState] = useState(getAppStateFromUrl())

  const [expanded, setExpanded] = useState(!appState.resourceKey)

  const selectedCategory = appState.categoryKey
    ? config.data[appState.categoryKey]
    : undefined
  const selectedResource = appState.resourceKey
    ? selectedCategory?.items[appState.resourceKey]
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

  const categorySelectionHandler = (newCategoryKey: string) => {
    setAppState({ categoryKey: newCategoryKey })
  }

  const updateWindowURL = (
    url: URL,
    urlKey: string,
    value: string | undefined
  ) => {
    if (value) {
      url.searchParams.set(urlKey, value)
    } else {
      url.searchParams.delete(urlKey)
    }
  }

  const calSelectionHandler = useCallback(
    (newResourceKey: string) => {
      setAppState(state => ({ ...state, resourceKey: newResourceKey }))
      setExpanded(false)

      const url = new URL(window.location.href)
      updateWindowURL(url, 'type', appState.categoryKey)
      updateWindowURL(url, 'ressource', newResourceKey)

      history.pushState({}, '', url)
    },
    [appState]
  )

  /**
   * Si l'utilisateur retourne à la page précédente, affiche le bon calendrier
   */
  const popStateHandler = useCallback((e: PopStateEvent) => {
    setAppState(getAppStateFromUrl())
  }, [])

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
      <div className="accordion mb-3">
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
            aria-labelledby="headingOne">
            <div className="accordion-body">
              <div className="row">
                <Select
                  label="Type"
                  initialKey={appState.categoryKey ?? null}
                  selectionHandler={categorySelectionHandler}
                  items={mapObject(config.data, (k, v) => v.name)}
                />
                {selectedCategory && (
                  <Select
                    label={`Choisissez parmi les ${selectedCategory.name.toLowerCase()}`}
                    initialKey={appState.resourceKey ?? null}
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
