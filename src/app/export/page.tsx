import { AppShell } from '@/components/AppShell'
import { ExportForm } from '@/components/export/ExportForm'
import { CleanupSection } from '@/components/export/CleanupSection'
import '@/styles/export.css'

export default function ExportPage() {
  return (
    <AppShell>
      <div className="export-page">
        <div className="export-header">
          <h1>Ekspor Data</h1>
          <p>Unduh data keuangan Anda ke Excel, CSV, atau PDF. Kelola pembersihan data tahunan.</p>
        </div>

        <ExportForm />
        <CleanupSection />
      </div>
    </AppShell>
  )
}
