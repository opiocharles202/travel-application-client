import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { Stepper } from '../components/ui/Stepper'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table'
import { useToast } from '../components/ui/use-toast'
import type { Density } from '../components/ui/types'

const steps = [
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'quotation', label: 'Quotation' },
  { id: 'billing', label: 'Billing' },
  { id: 'travelers', label: 'Travelers' },
  { id: 'confirm', label: 'Confirm' },
]

/**
 * Component catalog (spec 0003, AC-9): every base component in both
 * density variants, referenced by later screens instead of reading
 * component source.
 */
function DensitySection({ density }: { density: Density }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectValue, setSelectValue] = useState<string>()
  const { show } = useToast()

  return (
    <section className="flex flex-col gap-6 rounded-md border border-border p-6">
      <h2 className="text-xl font-medium text-ink capitalize">{density}</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Button density={density} variant="primary">
          Primary
        </Button>
        <Button density={density} variant="secondary">
          Secondary
        </Button>
        <Button density={density} variant="danger">
          Danger
        </Button>
        <Button density={density} variant="primary" disabled>
          Disabled
        </Button>
      </div>

      <div className="flex max-w-sm flex-col gap-4">
        <Input density={density} label="Traveler name" placeholder="Ada Lovelace" />
        <Input
          density={density}
          label="Passport number"
          error="Passport number is required"
          defaultValue=""
        />
        <Select
          density={density}
          label="Destination"
          placeholder="Select a country"
          value={selectValue}
          onValueChange={setSelectValue}
          options={[
            { value: 'ke', label: 'Kenya' },
            { value: 'ug', label: 'Uganda' },
            { value: 'tz', label: 'Tanzania' },
          ]}
        />
        <Select
          density={density}
          label="Trip type"
          error="Choose a trip type"
          options={[{ value: 'single', label: 'Single trip' }]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button density={density} onClick={() => setModalOpen(true)}>
          Open modal
        </Button>
        <Button
          density={density}
          variant="secondary"
          onClick={() =>
            show({ title: 'Quote saved', description: 'Your quote was saved.', variant: 'success' })
          }
        >
          Show success toast
        </Button>
        <Button
          density={density}
          variant="secondary"
          onClick={() =>
            show({ title: 'Payment failed', description: 'Try again.', variant: 'danger' })
          }
        >
          Show danger toast
        </Button>
      </div>

      <Stepper
        steps={steps}
        currentStepId="quotation"
        reachedStepIds={['itinerary', 'quotation']}
        density={density}
      />

      <Table>
        <TableHead>
          <TableRow density={density}>
            <TableHeaderCell density={density}>Policy</TableHeaderCell>
            <TableHeaderCell density={density}>Traveler</TableHeaderCell>
            <TableHeaderCell density={density}>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow density={density}>
            <TableCell density={density}>ILT1-000123</TableCell>
            <TableCell density={density}>Ada Lovelace</TableCell>
            <TableCell density={density}>Paid</TableCell>
          </TableRow>
          <TableRow density={density}>
            <TableCell density={density}>ILT1-000124</TableCell>
            <TableCell density={density}>Grace Hopper</TableCell>
            <TableCell density={density}>Pending</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Confirm cancellation"
        description="This cannot be undone."
        density={density}
      >
        <div className="flex justify-end gap-2">
          <Button density={density} variant="secondary" onClick={() => setModalOpen(false)}>
            Keep quote
          </Button>
          <Button density={density} variant="danger" onClick={() => setModalOpen(false)}>
            Cancel quote
          </Button>
        </div>
      </Modal>
    </section>
  )
}

export function ComponentCatalog() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-8" data-portal="public">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Component catalog</h1>
        <p className="mt-1 text-sm text-muted">
          Every base component, both density variants (spec 0003).
        </p>
      </div>
      <DensitySection density="comfortable" />
      <DensitySection density="compact" />
    </main>
  )
}
