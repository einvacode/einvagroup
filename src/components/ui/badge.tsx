import * as React from "react"

import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses: Record<string, string> = {
    default: "border-slate-200 bg-slate-100 text-slate-700",
    secondary: "border-slate-200 bg-slate-50 text-slate-600",
    success: "border-green-200 bg-green-100 text-green-700",
    warning: "border-yellow-200 bg-yellow-100 text-yellow-700",
    danger: "border-red-200 bg-red-100 text-red-700",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
