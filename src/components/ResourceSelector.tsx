import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import Select, { SelectItem } from './Select'
import {
  CalendarCategory,
  CalendarCategoryItem,
  CalendarData
} from '../utils/fetchCalendars'

interface CalSelectorProps {
  items: CalendarData,
  category?: CalendarCategory,
  setCategory: Dispatch<SetStateAction<CalendarCategory>>
  selected?: CalendarCategoryItem,
  setSelected: Dispatch<SetStateAction<CalendarCategoryItem | undefined>>
}

const ResourceSelector = (props: CalSelectorProps): JSX.Element => {
  const {
    items,
    category,
    setCategory,
    selected,
    setSelected
  } = props

  const categorySelectionHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCat = items[e.target.value]

    setCategory(newCat as CalendarCategory)
    setSelected(undefined)
  }

  const calSelectionHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCal = category?.items[e.target.value]
    setSelected(newCal)
    setExpanded(false)
    history.pushState({
      category: category,
      ressource: newCal
    }, `Horaires ${newCal?.name}`,
      `?type=${category?.key}&ressource=${newCal?.key}`)
  }

  const [expanded, setExpanded] = useState(!selected)

  return (
    <>
      <div className="accordion mb-3" id="calSelector">
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button className={`accordion-button ${expanded ? '' : 'collapsed'}`} type="button"
                    aria-expanded={expanded} aria-controls="collapseOne"
                    onClick={() => setExpanded(!expanded)}>
              <strong>
                {selected ? selected.name : 'Parcourir les horaires..'}
              </strong>
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${expanded ? 'show' : ''}`}
               aria-labelledby="headingOne" data-bs-parent="#calSelector">
            <div className="accordion-body">
              <div className="row">
                <div className="col-md-3 mb-md-0">
                  <Select name={'Type'} selected={category as SelectItem}
                          selectionHandler={categorySelectionHandler}
                          items={items}/>
                </div>
                {category &&
                <div className="col-md-3 mb-md-0">
                  <Select
                    name={`Choisissez parmi les ${category.name.toLowerCase()}`}
                    selected={selected as SelectItem}
                    selectionHandler={calSelectionHandler}
                    items={category.items}/>
                </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResourceSelector
