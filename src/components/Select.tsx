import { Dispatch, useId } from 'react'

interface SelectProps {
  name: string
  selectionHandler: Dispatch<string>
  items: { [key: string]: string }
  selectedKey: string | undefined
}

const Select = (props: SelectProps) => {
  const { name, items, selectedKey, selectionHandler } = props
  const id = useId()

  return (
    <div className="col-md-3 mb-md-0">
      <label className="form-label" htmlFor={id}>
        <strong>{name}</strong>
      </label>
      <select
        id={id}
        className="form-control custom-select"
        onChange={e => selectionHandler(e.target.value)}
        value={selectedKey ?? 0}>
        <option disabled value={0}>
          {name}
        </option>
        {Object.entries(items).map(([key, item]) => (
          <option key={key} value={key}>
            {item}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select
