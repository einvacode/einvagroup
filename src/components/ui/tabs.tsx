import * as React from "react"

import { cn } from "@/lib/utils"

export function Tabs({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full", className)} {...props}>{children}</div>
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500", className)} {...props} />
}

export function TabsTrigger({ className, value, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }) {
  return <button type="button" data-value={value} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all", className)} {...props} />
}

export function TabsContent({ className, value, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: string }) {
  return <div data-value={value} className={cn("mt-2", className)} {...props} />
}
