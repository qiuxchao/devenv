"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
})

function Dialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <button
      data-slot="dialog-trigger"
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  )
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DialogClose({
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <button
      data-slot="dialog-close"
      onClick={() => onOpenChange(false)}
      {...props}
    >
      {children}
    </button>
  )
}

function DialogOverlay({ className, ...props }: React.ComponentProps<"div">) {
  const { open, onOpenChange } = React.useContext(DialogContext)
  if (!open) return null
  return (
    <div
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-xs",
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  const { open, onOpenChange } = React.useContext(DialogContext)
  if (!open) return null
  return (
    <>
      <DialogOverlay />
      <div
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-background p-4 text-sm ring-1 ring-foreground/10 sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
    </>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
