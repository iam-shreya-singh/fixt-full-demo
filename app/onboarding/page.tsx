export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getOwnerProfile } from '@/app/actions/onboarding'
import { OwnerOnboardingForm } from '@/components/onboarding/owner-onboarding-form'

export default async function OnboardingPage() {
  const profile = await getOwnerProfile()
  if (profile?.onboardingComplete) {
    redirect('/dashboard')
  }
  return <OwnerOnboardingForm initialProfile={profile} />
}

