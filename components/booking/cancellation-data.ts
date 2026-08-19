import { business, getDateLabel, services } from './booking-data'

export type CancellationStep = 'lookup' | 'review' | 'cancelled'

export const sampleBooking = {
  reference: 'FXT-7K4M2Q',
  customerName: 'Jordan Lee',
  email: 'jordan@example.com',
  service: services[0],
  date: '2026-08-25',
  time: '10:30 AM',
  provider: 'Morrow Studio',
  location: business.address,
  timezone: business.timezoneLabel,
  get dateLabel() { return getDateLabel(this.date) },
}

export const cancellationPolicy = 'You can cancel this appointment at no charge up to 24 hours before your scheduled time.'

export function makeCancellationReference() {
  return 'CAN-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function isMatchingBooking(reference: string, email: string) {
  return reference.trim().toUpperCase() === sampleBooking.reference && email.trim().toLowerCase() === sampleBooking.email
}
