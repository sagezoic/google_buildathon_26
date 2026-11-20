import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Native control look shared by the F16/F19/F20 screens. */
/** Copy that differs between the 1440 frame and the 834 / 390 frames. */
export function Resp({ d, m }: { d: ReactNode; m: ReactNode }) {
  return (<><span className="xl:hidden">{m}</span><span className="max-xl:hidden">{d}</span></>)
}

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null
  return <p id={id} className="mt-1.5 flex items-center gap-1.5 text-label text-danger-ink"><AlertCircle className="size-3.5 flex-none" aria-hidden />{children}</p>
}

export function Page({ children, className, narrow }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cn('mx-auto flex w-full flex-col gap-4 px-4 py-5 xl:py-8', narrow ? 'max-w-[600px]' : 'max-w-[900px]', className)}>{children}</div>
}

