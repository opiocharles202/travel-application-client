import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'
import type { Density } from './types'

/**
 * Row/cell visual primitives only (spec 0003). The full generic,
 * sortable, paginated data table is scope Feature 13, which assembles
 * these rather than each building its own row/cell styling.
 */

const cellDensityClasses: Record<Density, string> = {
  comfortable: 'py-3 px-4',
  compact: 'py-1 px-3',
}

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn('w-full border-collapse text-left text-sm', className)}
      {...props}
    />
  ),
)
Table.displayName = 'Table'

export const TableHead = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('border-b border-border-strong', className)} {...props} />
))
TableHead.displayName = 'TableHead'

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <tbody ref={ref} className={className} {...props} />)
TableBody.displayName = 'TableBody'

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  density?: Density
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ density = 'comfortable', className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('border-b border-border last:border-0 hover:bg-surface', className)}
      data-density={density}
      {...props}
    />
  ),
)
TableRow.displayName = 'TableRow'

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  density?: Density
}

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ density = 'comfortable', className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn('font-medium text-muted', cellDensityClasses[density], className)}
      {...props}
    />
  ),
)
TableHeaderCell.displayName = 'TableHeaderCell'

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  density?: Density
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ density = 'comfortable', className, ...props }, ref) => (
    <td ref={ref} className={cn('text-body', cellDensityClasses[density], className)} {...props} />
  ),
)
TableCell.displayName = 'TableCell'
