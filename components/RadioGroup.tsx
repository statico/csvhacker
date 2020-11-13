import { useCallback } from "react"

interface RadioGroupItems {
  label: string
  value: string
}

export const RadioGroup = ({
  name,
  items,
  value,
  onChange,
}: {
  name: string
  items: RadioGroupItems[]
  value?: string
  onChange: (newValue: string) => void
}) => {
  const handleChange = useCallback(
    (event) => {
      onChange(event.target.value)
    },
    [onChange]
  )

  return (
    <>
      {items.map((item) => (
        <label key={item.value} className="cursor-pointer mr-1">
          <input
            type="radio"
            name={name}
            value={item.value}
            checked={item.value === value}
            onChange={handleChange}
            className="mr-1"
          />
          {item.label}
        </label>
      ))}
    </>
  )
}
