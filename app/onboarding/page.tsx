export const dynamic = 'force-dynamic'

import { getOwnerProfile } from '@/app/actions/onboarding'
import { OwnerOnboardingForm } from '@/components/onboarding/owner-onboarding-form'

export default async function OnboardingPage() {
  return <OwnerOnboardingForm initialProfile={await getOwnerProfile()} />
}
