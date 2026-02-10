import { events } from "../../lib/data";
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Generate calendar days for current month
function generateCalendarDays() {
  const year = 2026;
  const month = 1;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
}
export default function Calendar() {
  const calendarDays = generateCalendarDays();
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400 mt-1">February 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors">
            Today
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {days.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, i) => {
              const event = events.find((e) => e.day === day);
              const isToday = day === 2;
              return (
                <div
                  key={i}
                  className={`min-h-24 p-2 rounded-xl border transition-all cursor-pointer ${
                    day
                      ? isToday
                        ? "bg-indigo-600/20 border-indigo-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                      : "border-transparent"
                  }`}
                >
                  {day && (
                    <>
                      <span
                        className={`text-sm font-medium ${isToday ? "text-indigo-400" : "text-gray-300"}`}
                      >
                        {day}
                      </span>
                      {event && (
                        <div
                          className={`mt-1 px-2 py-1 rounded text-xs text-white truncate ${event.color}`}
                        >
                          {event.title}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {events.slice(0, 4).map((event, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${event.color}`} />
                  <div>
                    <p className="text-white font-medium text-sm">
                      {event.title}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Feb {event.day} • {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-linear-to-br from-purple-600/50 to-pink-600/50 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Schedule a Meeting
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Quickly set up a meeting with your team.
            </p>
            <button className="w-full py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Quick Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
