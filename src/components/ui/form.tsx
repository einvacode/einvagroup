import * as React from "react"
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues, type UseFormReturn } from "react-hook-form"

import { cn } from "@/lib/utils"

type FormProps<TFieldValues extends FieldValues> = {
  children: React.ReactNode
} & UseFormReturn<TFieldValues>

export function Form<TFieldValues extends FieldValues>({ children, ...formMethods }: FormProps<TFieldValues>) {
  return <FormProvider {...formMethods}>{children}</FormProvider>
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) {
  return <Controller {...props} />
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />
}

export function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full", className)} {...props} />
}

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-slate-700", className)} {...props} />
}

export function FormMessage({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formState } = useFormContext()
  const message = props.children
  if (!message && typeof formState.errors === "object") {
    return null
  }
  return <p className={cn("text-sm text-red-500", className)} {...props} />
}
