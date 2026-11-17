import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import './ThemeSelector.css'

const themes = [
  { id: 'system', label: 'Sistema', Icon: Monitor },
  { id: 'light', label: 'Claro', Icon: Sun },
  { id: 'dark', label: 'Escuro', Icon: Moon },
] as const

export function ThemeSelector() {
  const [selected, setSelected] = useState<(typeof themes)[number]['id']>('system')
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const firstFocus = useRef(0)
  const menuId = useId()
  const selectedIndex = themes.findIndex(theme => theme.id === selected)
  const { Icon, label } = themes[selectedIndex]

  useEffect(() => {
    if (!open) return
    items.current[firstFocus.current]?.focus()
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  function openAt(index: number) {
    firstFocus.current = index
    setOpen(true)
  }

  function returnToTrigger() {
    trigger.current?.focus()
    setOpen(false)
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    switch (event.key) {
      case 'ArrowDown': next = (index + 1) % themes.length; break
      case 'ArrowUp': next = (index + themes.length - 1) % themes.length; break
      case 'Home': next = 0; break
      case 'End': next = themes.length - 1; break
      case 'Escape':
        event.preventDefault()
        returnToTrigger()
        return
      case 'Tab':
        // Let the browser continue tabbing from the trigger in either direction.
        returnToTrigger()
        return
      default: return
    }
    event.preventDefault()
    items.current[next]?.focus()
  }

  return <div className="theme-selector" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }}>
    <button
      type="button"
      ref={trigger}
      className="theme-selector-trigger"
      aria-label={`Tema da interface: ${label}`}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={() => open ? setOpen(false) : openAt(selectedIndex)}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          openAt(event.key === 'ArrowDown' ? 0 : themes.length - 1)
        }
      }}
    >
      <Icon size={17} aria-hidden="true" />
      {label}
      <ChevronDown className="theme-selector-chevron" size={15} aria-hidden="true" />
    </button>
    {open && <div className="theme-selector-menu" id={menuId} role="menu" aria-label="Tema da interface">
      {themes.map(({ id, label: optionLabel, Icon: OptionIcon }, index) => (
        <button
          key={id}
          ref={item => { items.current[index] = item }}
          type="button"
          role="menuitemradio"
          aria-checked={id === selected}
          tabIndex={-1}
          onKeyDown={event => navigate(event, index)}
          onClick={() => {
            document.documentElement.dataset.theme = id
            setSelected(id)
            returnToTrigger()
          }}
        >
          <OptionIcon size={17} aria-hidden="true" />
          {optionLabel}
          {id === selected && <Check size={16} aria-hidden="true" />}
        </button>
      ))}
    </div>}
  </div>
}
