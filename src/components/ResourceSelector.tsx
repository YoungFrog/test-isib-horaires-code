import { Dispatch, useEffect, useState } from 'react'
import { CalendarConfig } from '../utils/fetchCalendars'
import { Nullable, mapObject } from '../utils/types'
import useSearchParams from '../hooks/useSearchParams'
import Select from './Select'

interface ResourceSelectorProps {
  config: CalendarConfig
  updateUrl: Dispatch<Nullable<string>>
}

const ResourceSelector = (props: ResourceSelectorProps): JSX.Element => {
  const { config, updateUrl } = props

  const [categoryKey, setCategoryKey] = useState(null as Nullable<string>)
  const [resourceKey, setResourceKey] = useState(null as Nullable<string>)

  const [expanded, setExpanded] = useState(!resourceKey)

  useSearchParams([
    ['type', categoryKey, setCategoryKey, config.default],
    ['ressource', resourceKey, setResourceKey]
  ])

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
                    setResourceKey(null)
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
