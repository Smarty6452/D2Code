import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export default function OnboardingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center p-4 pt-10">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-2xl font-bold text-white">Set up your profile</h1>
        <p className="mb-8 text-slate-400">
          Tell the world what you&apos;re building and what you love.
        </p>
        <OnboardingFlow />
      </div>
    </div>
  )
}
