import { ProfileEditor } from '@/components/profile/profile-editor'
import { auth } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await auth()
  return (
    <div className="container mx-auto max-w-lg px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
        <p className="mt-0.5 text-sm text-zinc-500">How other developers see you</p>
      </div>
      <ProfileEditor userId={session!.user!.id!} />
    </div>
  )
}
