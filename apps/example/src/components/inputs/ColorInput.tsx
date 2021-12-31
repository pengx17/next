import * as React from 'react'

interface ColorInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function ColorInput({ label, ...rest }: ColorInputProps) {
  return (
    <div className="nu-input">
      <label htmlFor={`#color-${label}`}>{label}</label>
      <input className="nu-color-input" name={`#color-${label}`} type="color" {...rest} />
    </div>
  )
}
