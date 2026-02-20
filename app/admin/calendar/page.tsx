'use client';

import { useState } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'exam' | 'holiday' | 'deadline' | 'event';
}

const TYPE_COLORS = {
  exam:     'bg-red-100 text-red-700 border-red-200',
  holiday:  'bg-green-100 text-green-700 border-green-200',
  deadline: 'bg-orange-100 text-orange-700 border-orange-200',
  event:    'bg-blue-100 text-blue-700 border-blue-200',
};

const TYPE_DOTS = {
  exam:     'bg-red-500',
  holiday:  'bg-green-500',
  deadline: 'bg-orange-500',
  event:    'bg-blue-500',
};

export default function AdminCalendarPage() {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: 'First Semester Exams', date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-15`, type: 'exam' },
    { id: '2', title: 'Course Registration Deadline', date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-05`, type: 'deadline' },
    { id: '3', title: 'Independence Day', date: `${today.getFullYear()}-10-01`, type: 'holiday' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [form, setForm] = useState({ title: '', type: 'event' as Event['type'] });

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function eventsForDay(day: number) {
    return events.filter(e => e.date === dateStr(day));
  }

  function isToday(day: number) {
    return dateStr(day) === today.toISOString().split('T')[0];
  }

  function handleDayClick(day: number) {
    setSelectedDate(dateStr(day));
    setForm({ title: '', type: 'event' });
    setShowForm(true);
  }

  function addEvent() {
    if (!form.title.trim()) return;
    setEvents(ev => [...ev, {
      id: Date.now().toString(),
      title: form.title,
      date: selectedDate,
      type: form.type,
    }]);
    setShowForm(false);
  }

  function deleteEvent(id: string) {
    setEvents(ev => ev.filter(e => e.id !== id));
  }

  const upcomingEvents = events
    .filter(e => e.date >= today.toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
        <p className="text-gray-500 text-sm mt-1">Manage university events, exams, and deadlines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <button
              onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >←</button>
            <h2 className="font-semibold text-gray-900">{MONTHS[month]} {year}</h2>
            <button
              onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >→</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => (
              <div
                key={i}
                onClick={() => day && handleDayClick(day)}
                className={`min-h-[80px] p-1.5 border-b border-r border-gray-100 
                  ${day ? 'cursor-pointer hover:bg-blue-50 transition-colors' : 'bg-gray-50'}
                  ${i % 7 === 6 ? 'border-r-0' : ''}`}
              >
                {day && (
                  <>
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1
                      ${isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {eventsForDay(day).slice(0, 2).map(ev => (
                        <div key={ev.id} className={`flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate border ${TYPE_COLORS[ev.type]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_DOTS[ev.type]}`} />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      ))}
                      {eventsForDay(day).length > 2 && (
                        <p className="text-xs text-gray-400 pl-1">+{eventsForDay(day).length - 2} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Types</h3>
            <div className="space-y-2">
              {(Object.entries(TYPE_DOTS) as [Event['type'], string][]).map(([type, dot]) => (
                <div key={type} className="flex items-center gap-2 text-sm text-gray-600 capitalize">
                  <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                  {type}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Click any day to add an event</p>
          </div>

          {/* Upcoming events */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Events</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-gray-400">No upcoming events.</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(ev => (
                  <div key={ev.id} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${TYPE_DOTS[ev.type]}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-400">{new Date(ev.date + 'T00:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="text-gray-300 hover:text-red-400 text-xs flex-shrink-0 transition-colors"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add event modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Add Event — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Event Title</label>
                <input
                  type="text" value={form.title} autoFocus
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addEvent()}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Final Exams Begin"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['exam','holiday','deadline','event'] as Event['type'][]).map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                        form.type === t ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-600 hover:border-blue-400'
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={addEvent}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}