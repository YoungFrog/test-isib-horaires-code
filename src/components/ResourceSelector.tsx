import { Dispatch, useCallback, useEffect, useState } from 'react'
import { CalendarConfig, tuple } from '../utils/fetchCalendars'
import Select from './Select'

interface ResourceSelectorProps {
  config: CalendarConfig
  updateUrl: Dispatch<string | null>
}

/**
 * Create a piece of state associated with a given parameter in the query string
 *
 * This hook returns an array [state, setState, resetState]
 * - state : the current value of the state (a string or undefined)
 * - setState : changes the current value
 *
 * @param queryParameterName The query param corresponding to this piece of state
 * @returns an array of [state, setState, resetState]
 */

function useQueryParameterState(
  queryParameterName: string,
  defaultValue?: string
) {
  const grabCurrentParameterValue = useCallback(
    () =>
      new URL(location.href).searchParams.get(queryParameterName) ||
      defaultValue,
    [defaultValue, queryParameterName]
  )

  const [state, setState] = useState(grabCurrentParameterValue)
  const updateStateAndQueryString = useCallback(
    (newState?: string) => {
      const url = new URL(window.location.href)
      if (newState) {
        url.searchParams.set(queryParameterName, newState)
      } else {
        url.searchParams.delete(queryParameterName)
      }
      history.pushState({}, '', url)
      setState(newState)
    },
    [queryParameterName]
  )

  const resetStateToQueryString = useCallback(() => {
    setState(grabCurrentParameterValue())
  }, [grabCurrentParameterValue])
  return tuple(state, updateStateAndQueryString, resetStateToQueryString)
}

const ResourceSelector = (props: ResourceSelectorProps): JSX.Element => {
  const { config, updateUrl } = props

  const [categoryKey, setCategoryKey, resetCategoryKey] =
    useQueryParameterState('type', config.default)
  const [resourceKey, setResourceKey, resetResourceKey] =
    useQueryParameterState('ressource')

  const [expanded, setExpanded] = useState(!resourceKey)

  const selectedCategory = categoryKey ? config.data[categoryKey] : undefined
  const selectedResource = resourceKey
    ? selectedCategory?.items[resourceKey]
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

  /**
   * Si l'utilisateur retourne à la page précédente, affiche le calendrier correspondant à l'URL
   */
  const popStateHandler = useCallback(
    (e: PopStateEvent) => {
      resetCategoryKey()
      resetResourceKey()
    },
    [resetCategoryKey, resetResourceKey]
  )

  useEffect(() => {
    window.addEventListener('popstate', popStateHandler)
    return () => window.removeEventListener('popstate', popStateHandler)
  })

  type KeyType = string | number

  function mapObject<T, S>(
    obj: { [k: KeyType]: T },
    func: (k: KeyType, v: T) => S
  ): { [k: KeyType]: S } {
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
                  initialKey={categoryKey ?? null}
                  selectionHandler={newcat => {
                    setResourceKey()
                    setCategoryKey(newcat)
                  }}
                  items={mapObject(config.data, (k, v) => v.name)}
                />
                {selectedCategory && (
                  <Select
                    label={`Choisissez parmi les ${selectedCategory.name.toLowerCase()}`}
                    initialKey={resourceKey ?? null}
                    selectionHandler={setResourceKey}
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
