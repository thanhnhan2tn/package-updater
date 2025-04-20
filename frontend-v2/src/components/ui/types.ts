import type { ReactNode } from 'react'

/**
 * Shared base props for UI components
 */
export interface BaseProps {
  /** Render component as a child slot */
  asChild?: boolean
  /** Additional class names */
  className?: string
  /** Content */
  children?: ReactNode
}

/**
 * Generic UI component props including intrinsic element props and BaseProps
 */
export type UIProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & BaseProps
