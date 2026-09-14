import { api } from '../api';
﻿import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../types';
import { 
  Users, UserCheck, Layers, CalendarCheck, TrendingUp, AlertTriangle, 
  ArrowUpRight, Clock, Award, BookOpen
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onNavigate: (tab: string, param?: any) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getStats()
      
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stats', err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 text-indigo-200">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-300" />
            <span>Community Learning Impact</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">White Volunteers Foundation</h1>
          <p className="mt-2 text-indigo-200 text-sm sm:text-base leading-relaxed">
            Coordinating structured learning levels, volunteer continuity, and personalized attention for underprivileged children across Classes 1–4.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-8">
          <Layers className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.kpis.total_students}</p>
          <div className="flex items-center mt-2 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold flex items-center mr-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100%
            </span>
            <span>Active in learning groups</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Volunteers</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.kpis.active_volunteers}</p>
          <div className="flex items-center mt-2 text-xs text-slate-500">
            <span>Leading regular community batches</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-violet-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sessions Completed</span>
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.kpis.sessions_conducted}</p>
          <div className="flex items-center mt-2 text-xs text-slate-500">
            <span>Documented with student evaluations</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attendance Rate</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.kpis.attendance_rate}%</p>
          <div className="flex items-center mt-2 text-xs text-slate-500">
            <span>Overall community participation</span>
          </div>
        </div>
      </div>

      {/* Main Grid: At-Risk Attention + Learning Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Attendance & Attention Alerts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Students Requiring Additional Attention</h3>
                <p className="text-xs text-slate-500">Children with low attendance or critical learning support needs</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">
              {stats.students_needing_attention.length} Flagged
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-3">
            {stats.students_needing_attention.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">All students meet current attendance targets!</p>
            ) : (
              stats.students_needing_attention.map(st => (
                <div key={st.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-sm">{st.name}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {st.standard_class}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">• {st.group_name}</span>
                    </div>
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                      {st.reason}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Attendance</span>
                      <span className="text-sm font-bold text-rose-600">{st.attendance_pct}%</span>
                    </div>
                    <button
                      onClick={() => onNavigate('students', st.id)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Learning-Level Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Learning Levels</h3>
                <p className="text-xs text-slate-500">Grouped by ability, not just grade</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {stats.level_distribution.map((lvl) => {
                const total = stats.kpis.total_students || 1;
                const pct = Math.round((lvl.count / total) * 100);
                const colorClass = lvl.name === 'Beginner' ? 'bg-amber-500' : lvl.name === 'Intermediate' ? 'bg-indigo-600' : 'bg-emerald-600';
                return (
                  <div key={lvl.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 font-semibold">{lvl.name}</span>
                      <span className="text-slate-500">{lvl.count} students ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('groups')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Manage Learning Groups & Levels</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Learning Sessions</h3>
            <p className="text-xs text-slate-500">Live logs submitted by active volunteers</p>
          </div>
          <button
            onClick={() => onNavigate('sessions')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All History →
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="pb-3">Date</th>
                <th className="pb-3">Group</th>
                <th className="pb-3">Subject & Topic</th>
                <th className="pb-3">Conducted By</th>
                <th className="pb-3 text-right">Attendance Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats.recent_sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-semibold text-slate-900 whitespace-nowrap">{s.date}</td>
                  <td className="py-3 font-medium text-indigo-700">{s.group_name}</td>
                  <td className="py-3">
                    <span className="font-semibold text-slate-800">{s.subject}</span>: {s.topic}
                  </td>
                  <td className="py-3 font-medium text-slate-600">{s.volunteer_name}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      {s.attendance_count} students
                    </span>
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
