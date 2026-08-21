import type { Metadata } from 'next'
import { FixtLandingPage } from '@/components/marketing/fixt-landing-page'
import { landingFaqs } from '@/lib/landing-faqs'

export const metadata: Metadata = {
  title: 'Fixt | Appointment Booking Software for Service Businesses',
  description: 'Fixt is a clear online booking system for service businesses to manage services, client scheduling, availability, appointments, and cancellations.',
  keywords: ['appointment scheduling software', 'online booking system', 'booking software for service businesses', 'client scheduling', 'availability management', 'appointment booking software'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Fixt | Appointment Booking Software for Service Businesses',
    description: 'A focused online booking system for service businesses that want clearer schedules and calmer client booking.',
    type: 'website',
    url: '/',
    siteName: 'Fixt',
  },
  twitter: { card: 'summary_large_image', title: 'Fixt | Appointment Booking Software for Service Businesses', description: 'A focused online booking system for service businesses.' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'SoftwareApplication', name: 'Fixt', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: 'Appointment scheduling and online booking software for service businesses.', url: '/' },
    { '@type': 'FAQPage', mainEntity: landingFaqs.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
  ],
}

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><FixtLandingPage /></>
}
