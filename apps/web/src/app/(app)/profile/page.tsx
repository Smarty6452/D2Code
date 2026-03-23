import { ProfileEditor } from '@/components/profile/profile-editor'
import { auth } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await auth()
  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold text-white">Your Profile</h1>
      <ProfileEditor userId={session!.user!.id!} />
    </div>
  )
}
