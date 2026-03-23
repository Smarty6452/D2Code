import { SettingsPanel } from '@/components/settings/settings-panel'

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Control your discovery preferences</p>
      </div>
      <SettingsPanel />
    </div>
  )
}
