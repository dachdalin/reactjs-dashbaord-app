import { teams } from "../../lib/data";
import { Link } from "react-router-dom";
export default function Teams() {
    return (
<div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Teams</h1>
          <p className="text-gray-400 mt-1">Manage your organization's teams and members.</p>
        </div>
        <Link to="/teams/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Team
        </Link>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team, i) => (
          <div key={i} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all">
            {/* Team Header */}
            <div className={`h-2 bg-linear-to-r ${team.color}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                  <p className="text-gray-400 text-sm">{team.description}</p>
                </div>
                <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm">
                  {team.members.length} members
                </span>
              </div>
              
              {/* Team Members */}
              <div className="space-y-3">
                {team.members.map((member, j) => (
                  <div key={j} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className={`h-10 w-10 rounded-full bg-linear-to-br ${team.color} flex items-center justify-center`}>
                      <span className="text-white text-sm font-semibold">{member.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-gray-400 text-sm">{member.role}</p>
                    </div>
                    <button  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" type="button" title="button">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Member Button */}
              <button className="w-full mt-4 py-3 border border-dashed border-white/20 text-gray-400 rounded-xl hover:border-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Member
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    );
}