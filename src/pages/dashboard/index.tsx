
import StatsCard from "../../components/StatsCard";
import ActivityCard from "../../components/ActivityCard";
import ProgressCard from "../../components/ProgressCard";

import { activities, projectsData } from "../../lib/data";
export default function Dashboard() {
  return (
<div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's an overview of your workspace.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value="$45,231"
          change="+20.1%"
          color="bg-indigo-500"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Active Users"
          value="2,350"
          change="+15.3%"
          color="bg-emerald-500"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Projects"
          value="124"
          change="+8.2%"
          color="bg-purple-500"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Pending Tasks"
          value="42"
          change="-5.4%"
          color="bg-orange-500"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityCard activities={activities} />
        </div>
        <div>
          <ProgressCard projects={projectsData} />
        </div>
      </div>

      {/* Additional Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <p className="text-gray-400 mt-2 text-sm">See what's been happening in your projects and teams.</p>
          <button className="mt-4 px-4 py-2 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
            View Activity
          </button>
        </div>
        <div className="rounded-2xl bg-linear-to-br from-indigo-600/50 to-purple-600/50 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <p className="text-gray-300 mt-2 text-sm">Create new projects, invite team members, or generate reports.</p>
          <button className="mt-4 px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </div>
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white">Need Help?</h3>
          <p className="text-gray-400 mt-2 text-sm">Check out our documentation or contact support for assistance.</p>
          <button className="mt-4 px-4 py-2 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
            View Docs
          </button>
        </div>
      </div>
    </div>
  );
}