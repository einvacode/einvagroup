import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

const DialogContext = React.createContext<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>({});

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ children, asChild, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DialogContext)
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void }>
    return React.cloneElement(child, {
      ...props,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        child.props.onClick?.(event)
        props.onClick?.(event)
        context.onOpenChange?.(true)
      },
    })
  }
  return <button type="button" {...props} onClick={(e) => {
    props.onClick?.(e)
    context.onOpenChange?.(true)
  }}>{children}</button>
}

export function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext)
  if (!context.open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div role="dialog" aria-modal="true" className={cn("w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl relative", className)} {...props}>
        <button onClick={() => context.onOpenChange?.(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex flex-col space-y-1.5 text-left", className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-slate-900", className)} {...props} />
}
