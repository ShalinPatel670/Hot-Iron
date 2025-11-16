import PageShell from '../components/PageShell'
import Tag from '../components/Tag'
import { useNotifications } from '../context/NotificationContext'

export default function MyAccount() {
  const { preferences, setPreferences, pushNotification } = useNotifications()

  const teamMembers = [
    { id: '1', name: 'John Doe', email: 'john@acmesteel.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@acmesteel.com', role: 'Trader' },
    { id: '3', name: 'Bob Johnson', email: 'bob@acmesteel.com', role: 'Viewer' },
  ]

  const roleVariantMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    'Admin': 'error',
    'Trader': 'warning',
    'Viewer': 'info',
  }

  return (
    <PageShell>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Profile */}
        <div className="glass p-6">
          <h2 className="text-xl font-bold text-off-white mb-6">Organization Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Organization Name</label>
              <input
                type="text"
                defaultValue="Acme Steel Corp"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Industry</label>
              <input
                type="text"
                defaultValue="Steel Manufacturing"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Default CO₂ Baseline</label>
              <input
                type="number"
                defaultValue={1.9}
                step={0.1}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
              />
              <div className="text-xs text-white/50 mt-1">kg CO₂ per ton</div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Preferred Currency</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>CNY</option>
              </select>
            </div>
            <button className="w-full bg-constructivist-red hover:bg-constructivist-red/90 text-off-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        {/* User Management */}
        <div className="glass p-6">
          <h2 className="text-xl font-bold text-off-white mb-6">Team Members</h2>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="glass-strong p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-off-white">{member.name}</div>
                  <div className="text-sm text-white/60">{member.email}</div>
                </div>
                <Tag variant={roleVariantMap[member.role] || 'default'}>
                  {member.role}
                </Tag>
              </div>
            ))}
            <button className="w-full glass p-3 rounded-lg text-off-white hover:bg-white/10 transition-colors text-center font-medium">
              + Add Team Member
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-off-white">Notification Preferences</h2>
            {preferences.lastUpdated && (
              <span className="text-xs text-white/40">
                Last updated: {new Date(preferences.lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <label className="flex items-center gap-3 cursor-pointer glass-strong p-4 rounded-lg hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={preferences.email}
                onChange={(e) => setPreferences({ email: e.target.checked })}
                className="w-5 h-5 rounded bg-white/5 border-white/10 text-constructivist-red focus:ring-constructivist-red"
              />
              <div>
                <div className="font-semibold text-off-white">Email</div>
                <div className="text-sm text-white/60">Receive email notifications</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer glass-strong p-4 rounded-lg hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={preferences.sms}
                onChange={(e) => setPreferences({ sms: e.target.checked })}
                className="w-5 h-5 rounded bg-white/5 border-white/10 text-constructivist-red focus:ring-constructivist-red"
              />
              <div>
                <div className="font-semibold text-off-white">SMS</div>
                <div className="text-sm text-white/60">Receive SMS notifications</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer glass-strong p-4 rounded-lg hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={preferences.push}
                onChange={(e) => setPreferences({ push: e.target.checked })}
                className="w-5 h-5 rounded bg-white/5 border-white/10 text-constructivist-red focus:ring-constructivist-red"
              />
              <div>
                <div className="font-semibold text-off-white">Push</div>
                <div className="text-sm text-white/60">Receive push notifications</div>
              </div>
            </label>
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.digestMode}
                onChange={(e) => setPreferences({ digestMode: e.target.checked })}
                className="w-5 h-5 rounded bg-white/5 border-white/10 text-constructivist-red focus:ring-constructivist-red"
              />
              <div>
                <div className="font-semibold text-off-white">Digest Mode</div>
                <div className="text-sm text-white/60">Receive notifications in daily digest</div>
              </div>
            </label>
            <button
              onClick={() => {
                pushNotification({
                  type: 'system',
                  title: 'Test Notification',
                  body: 'This is a test notification to verify your notification preferences are working correctly.',
                  severity: 'info',
                  channels: ['email', 'sms', 'push'].filter((ch) => {
                    if (ch === 'email') return preferences.email
                    if (ch === 'sms') return preferences.sms
                    if (ch === 'push') return preferences.push
                    return false
                  }) as ('email' | 'sms' | 'push')[],
                })
              }}
              className="ml-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-off-white rounded-lg transition-colors text-sm font-medium"
            >
              Send Test Notification
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

