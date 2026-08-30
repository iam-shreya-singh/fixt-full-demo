import { getBookingByCancellationToken } from '@/app/actions/cancellation'
import { TokenCancellationPage } from '@/components/booking/customer-cancellation-page'

export default async function CancelTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const booking = await getBookingByCancellationToken(token)
  if (!booking) {
    return <main className="min-h-screen bg-fixt-paper text-fixt-ink flex items-center justify-center px-6 text-center">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fixt-amber">Not found</p>
        <h1 className="mt-4 font-serif text-4xl">We couldn&apos;t find that appointment.</h1>
        <p className="mt-4 text-sm text-fixt-muted">This cancellation link may be invalid or already used.</p>
      </div>
    </main>
  }
  return <TokenCancellationPage token={token} booking={booking} />
}