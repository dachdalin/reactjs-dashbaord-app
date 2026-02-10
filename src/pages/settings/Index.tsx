export default function Settings() {
return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account preferences and configurations.</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                <input
                  placeholder="John Doe"
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  placeholder="john@gmail.com"
                  type="email"
                  defaultValue="john@gmail.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  placeholder="Write a short bio..."
                  rows={3}
                  defaultValue="Full-stack developer passionate about building great products."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-400">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white font-medium">Change Password</p>
                  <p className="text-sm text-gray-400">Last changed 3 months ago</p>
                </div>
                <button className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Notifications</h2>
            <div className="space-y-4">
              {[
                { label: "Email notifications", desc: "Receive updates via email", enabled: true },
                { label: "Push notifications", desc: "Browser push notifications", enabled: true },
                { label: "Weekly digest", desc: "Summary of weekly activity", enabled: false },
                { label: "Marketing emails", desc: "News and product updates", enabled: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.enabled ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.enabled ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-2xl bg-linear-to-br from-indigo-600/50 to-purple-600/50 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
            <p className="text-gray-300 text-sm">Your account is in good standing with all features enabled.</p>
          </div>

          {/* Plan Info */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">Pro Plan</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">$29/month • Renews on March 1, 2026</p>
            <button className="w-full py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors">
              Manage Subscription
            </button>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
            <p className="text-gray-400 text-sm mb-4">Once you delete your account, there is no going back.</p>
            <button className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
    );
}