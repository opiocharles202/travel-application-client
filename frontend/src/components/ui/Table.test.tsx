import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table'

describe('Table primitives (spec 0003)', () => {
  it('renders a semantic table with header and body rows', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Policy</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>ILT1-000123</TableCell>
            <TableCell>Paid</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Policy' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'ILT1-000123' })).toBeInTheDocument()
  })

  it('AC-4: a row carries its density as a data attribute so cells align without hardcoding a value', () => {
    render(
      <Table>
        <TableBody>
          <TableRow density="compact" data-testid="row">
            <TableCell density="compact">A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByTestId('row')).toHaveAttribute('data-density', 'compact')
  })

  it('forwards refs and extra props (composable with other tools, e.g. a future sortable header)', () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByTestId('table')).toBeInTheDocument()
  })
})
