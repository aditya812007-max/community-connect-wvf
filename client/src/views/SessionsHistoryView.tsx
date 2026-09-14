import { api } from '../api';
﻿import React, { useEffect, useState } from 'react';
import { SessionRecord } from '../types';
import { CalendarCheck, Users, Clock, BookOpen, UserCheck, Search } from 'lucide-react';

export const SessionsHistoryView: React.FC = () => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      });
  }, []);

  const filtered = sessions.filter(s => 
    s.group_name.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase()) ||
    s.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Completed Sessions & Attendance Logs</h2>
          <p className="text-xs text-slate-500">
            Chronological audit of conducted learning sessions across all WVF community batches
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter sessions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Group</th>
                <th className="p-4">Subject & Lesson Topic</th>
                <th className="p-4">Volunteer</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4">Volunteer Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                    <div>{s.session_date}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{s.start_time} - {s.end_time}</div>
                  </td>
                  <td className="p-4 font-semibold text-indigo-700">{s.group_name}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">{s.subject}</span>
                    <p className="text-slate-600 mt-0.5">{s.topic}</p>
                  </td>
                  <td className="p-4 font-medium text-slate-700 flex items-center space-x-1.5 pt-5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{s.volunteer_name}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.present_count} / {s.total_students} Present
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 italic max-w-xs truncate">
                    {s.general_notes || 'All planned activities conducted successfully.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
