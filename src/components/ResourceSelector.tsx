import { Dispatch, useCallback, useEffect, useState } from 'react'
import { CalendarConfig } from '../utils/fetchCalendars'
import { Nullable, mapObject } from '../utils/types'
import Select from './Select'

interface ResourceSelectorProps {
  config: CalendarConfig
  categoryKey: Nullable<string>
  resourceKey: Nullable<string>
  switchToResource: (res?: string, cat?: string) => void
}

const ResourceSelector = (props: ResourceSelectorProps): JSX.Element => {
  const { config, categoryKey, resourceKey, switchToResource } = props

  const [expanded, setExpanded] = useState(!resourceKey)
  const selectedCategory = categoryKey ? config.data[categoryKey] : undefined

  const nextResource = useCallback(
    (delta: number) => {
      if (!(categoryKey && resourceKey)) return
      const resourceKeys = Object.keys(config.data[categoryKey].items)
      return resourceKeys[resourceKeys.indexOf(resourceKey) + delta]
    },
    [categoryKey, config.data, resourceKey]
  )

  const listenArrowKeys = (e: KeyboardEvent) => {
    if (e.shiftKey) {
      let wantedResource

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        wantedResource = nextResource(-1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        wantedResource = nextResource(1)
      }

      if (wantedResource) {
        switchToResource(wantedResource, categoryKey || undefined)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', listenArrowKeys)
    return () => window.removeEventListener('keydown', listenArrowKeys)
  })

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
              <strong>{resourceKey ?? 'Parcourir les horaires..'}</strong>
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
                    switchToResource(undefined, newcat)
                  }}
                  items={mapObject(config.data, (k, v) => v.name)}
                />
                {selectedCategory && (
                  <Select
                    label={`Choisissez parmi les ${selectedCategory.name.toLowerCase()}`}
                    initialKey={resourceKey ?? null}
                    selectionHandler={key => {
                      setExpanded(false)
                      switchToResource(key, categoryKey || undefined)
                    }}
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
