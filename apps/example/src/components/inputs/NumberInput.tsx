import * as React from 'react'

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function NumberInput({ label, ...rest }: NumberInputProps) {
  return (
    <div className="nu-input">
      <label htmlFor={`#number-${label}`}>{label}</label>
      <input className="nu-number-input" name={`#number-${label}`} type="number" {...rest} />
    </div>
  )
}
