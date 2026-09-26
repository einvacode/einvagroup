import * as React from "react"

import { cn } from "@/lib/utils"

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type SelectContextValue = {
  value?: string
  open: boolean
  selectedLabel?: string
  setOpen: (open: boolean) => void
  onValueChange?: (value: string, label?: string) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function getNodeText(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(getNodeText).join("")
  if (React.isValidElement(children)) return getNodeText((children.props as { children?: React.ReactNode }).children)
  return ""
}

export function Select({ className, children, value, defaultValue, onValueChange, ...props }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const optionMap = React.useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {}

    const walk = (node: React.ReactNode) => {
      React.Children.forEach(node, (child) => {
        if (!React.isValidElement<{ value?: string; children?: React.ReactNode }>(child)) return

        const childProps = child.props as { value?: string; children?: React.ReactNode }

        if (child.type === SelectItem || (typeof child.type === "function" && child.type.name === "SelectItem")) {
          const itemValue = String(childProps.value ?? getNodeText(childProps.children))
          const itemLabel = getNodeText(childProps.children)
          if (itemValue) map[itemValue] = itemLabel
        }

        if (childProps.children) walk(childProps.children)
      })
    }

    walk(children)
    return map
  }, [children])

  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const selectedLabel = currentValue ? (optionMap[currentValue] ?? currentValue) : undefined

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue)
      }

      onValueChange?.(nextValue)
      setOpen(false)
    },
    [isControlled, onValueChange],
  )

  const contextValue = React.useMemo<SelectContextValue>(
    () => ({
      value: currentValue,
      open,
      selectedLabel,
      setOpen,
      onValueChange: handleValueChange,
    }),
    [currentValue, open, selectedLabel, handleValueChange],
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative", className)} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(SelectContext)

  return (
    <button
      type="button"
      aria-expanded={context?.open ?? false}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500", 
        className,
      )}
      onClick={() => context?.setOpen(!(context?.open ?? false))}
      {...props}
    >
      <span className="truncate">
        {children ?? <SelectValue />}
      </span>
      <span aria-hidden="true" className="ml-2 text-slate-400">▾</span>
    </button>
  )
}

export function SelectValue({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) {
  const context = React.useContext(SelectContext)

  if (children) return <span>{children}</span>
  return <span>{context?.selectedLabel ?? placeholder ?? "Pilih opsi"}</span>
}

export function SelectContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(SelectContext)

  if (!context?.open) return null

  return (
    <div
      className={cn("absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectItem({
  className,
  children,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: string }) {
  const context = React.useContext(SelectContext)
  const resolvedValue = value ?? (typeof children === "string" ? children : "")
  const label = getNodeText(children)

  return (
    <div
      role="option"
      aria-selected={context?.value === resolvedValue}
      tabIndex={0}
      className={cn("cursor-pointer px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900", className)}
      onClick={() => {
        context?.onValueChange?.(resolvedValue, label)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          context?.onValueChange?.(resolvedValue, label)
        }
      }}
      {...props}
    >
      {children}
    </div>
  )
}
