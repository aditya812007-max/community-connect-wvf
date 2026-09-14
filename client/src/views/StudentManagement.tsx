import { api } from '../api';
﻿import React, { useEffect, useState } from 'react';
import { Student, StudentDetail } from '../types';
import { 
  Search, Plus, Filter, UserCheck, Star, Calendar, 
  ArrowLeft, CheckCircle2, XCircle, Clock, Award, Sparkles, BookOpen
} from 'lucide-react';

export const StudentManagement: React.FC<{ initialStudentId?: number | null }> = ({ initialStudentId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(initialStudentId || null);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [aiRec, setAiRec] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form states for new student
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(7);
  const [newClass, setNewClass] = useState('Class 2');
  const [newStrengths, setNewStrengths] = useState('');
  const [newAreas, setNewAreas] = useState('');

  const loadStudents = () => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      setLoading(true);
      fetch(`/api/students/${selectedStudentId}`)
        .then(res => res.json())
        .then(data => {
          setDetail(data);
          setLoading(false);
        });

      // Also fetch future-ready AI evaluation
      fetch(`/api/ai/recommend-level/${selectedStudentId}`)
        .then(res => res.json())
        .then(data => setAiRec(data))
        .catch(() => setAiRec(null));
    } else {
      setDetail(null);
      setAiRec(null);
    }
  }, [selectedStudentId]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        age: Number(newAge),
        standard_class: newClass,
        learning_level_id: 1, // Default beginner
        group_id: 1,
        strengths: newStrengths,
        areas_for_improvement: newAreas
      })
    });
    if (res.ok) {
      setIsCreating(false);
      setNewName('');
      setNewStrengths('');
      setNewAreas('');
      loadStudents();
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.standard_class.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === 'All' || s.learning_level_name === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* If viewing a single student detail */}
      {selectedStudentId && detail ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedStudentId(null)}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Students</span>
          </button>

          {/* Profile Card Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <img
                src={detail.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=st'}
                alt={detail.name}
                className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-slate-200 p-1 object-cover shadow-sm"
              />
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-slate-900">{detail.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    {detail.learning_level_name} Level
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {detail.standard_class} • Age {detail.age} • Joined WVF Community Batch
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" />
                    {detail.stars_count} Stars Earned
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Group: <strong className="text-slate-700">{detail.group_name}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Stat Widget */}
            <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase">Attendance</span>
                <span className={`text-2xl font-extrabold ${detail.attendance.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {detail.attendance.percentage}%
                </span>
                <span className="text-xs text-slate-500 block">
                  {detail.attendance.attended}/{detail.attendance.total} Sessions
                </span>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase">Badges</span>
                <span className="text-2xl font-extrabold text-indigo-600">{detail.badges.length}</span>
                <span className="text-xs text-slate-500 block">Milestones</span>
              </div>
            </div>
          </div>

          {/* AI-Powered Level Recommendation Insight */}
          {aiRec && (
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">AI Learning-Level Recommendation</h4>
                    <p className="text-xs text-slate-500">Continuous assessment based on session ratings & skill mastery</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-white text-indigo-700 px-3 py-1 rounded-full shadow-xs border border-indigo-200">
                  Recommended: {aiRec.recommended_level}
                </span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-indigo-100/60">
                {aiRec.rationale}
              </p>
            </div>
          )}

          {/* 3-Column Profile Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Skills Progress */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Subject & Skill Progress</span>
                </h3>
              </div>

              <div className="space-y-3">
                {detail.skills.map((sk) => {
                  const badgeColor = 
                    sk.mastery_level === 'Mastered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    sk.mastery_level === 'Good' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    sk.mastery_level === 'Developing' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-rose-100 text-rose-800 border-rose-200';
                  return (
                    <div key={sk.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 block">{sk.subject}</span>
                        <span className="text-xs font-bold text-slate-800">{sk.skill_name}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {sk.mastery_level}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-xs">
                  <strong className="text-slate-700 block">Identified Strengths:</strong>
                  <p className="text-slate-600 mt-0.5">{detail.strengths || 'Not yet recorded'}</p>
                </div>
                <div className="text-xs">
                  <strong className="text-rose-700 block">Areas Requiring Support:</strong>
                  <p className="text-slate-600 mt-0.5">{detail.areas_for_improvement || 'None recorded'}</p>
                </div>
              </div>
            </div>

            {/* Column 2: Chronological Volunteer Observations */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Volunteer Session Notes</span>
                </h3>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {detail.learning_history.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No session notes recorded yet.</p>
                ) : (
                  detail.learning_history.map((h, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-slate-700">{h.date}</span>
                        <span>{h.volunteer_name}</span>
                      </div>
                      <p className="font-bold text-slate-800">{h.subject}: {h.topic}</p>
                      
                      <div className="grid grid-cols-3 gap-1 bg-white p-2 rounded-lg border border-slate-100 text-center font-semibold">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Understanding</span>
                          <span className="text-indigo-600">{h.understanding}/5</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Participation</span>
                          <span className="text-emerald-600">{h.participation}/5</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Confidence</span>
                          <span className="text-amber-600">{h.confidence}/5</span>
                        </div>
                      </div>

                      {h.observations && (
                        <p className="text-slate-600 italic">"{h.observations}"</p>
                      )}
                      {h.areas_needing_help && h.areas_needing_help !== 'None' && (
                        <p className="text-rose-600"><strong>Needs Help:</strong> {h.areas_needing_help}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Attendance History & Badges */}
            <div className="space-y-6">
              {/* Badges Earned */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Badges & Milestones</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {detail.badges.map((b) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center space-x-2.5">
                      <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{b.badge_name}</p>
                        <span className="text-[10px] text-slate-500 block">{b.awarded_at}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Log */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Recent Attendance Log</span>
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {detail.attendance.history.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{att.date}</span>
                        <span className="text-slate-400 block">{att.subject}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        att.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                        att.status === 'late' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Student List View */
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Profiles & Tracking</h2>
              <p className="text-xs text-slate-500">Monitor learning levels, attendance continuity, and skill acquisition</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          </div>

          {/* Search & Level Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search student or class..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-medium text-slate-500">Learning Level:</span>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterLevel === lvl
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map(st => (
              <div
                key={st.id}
                onClick={() => setSelectedStudentId(st.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={st.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=st'}
                        alt={st.name}
                        className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-0.5 object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{st.name}</h4>
                        <span className="text-xs text-slate-400">{st.standard_class} • Age {st.age}</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      st.learning_level_name === 'Beginner' ? 'bg-amber-100 text-amber-800' :
                      st.learning_level_name === 'Intermediate' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {st.learning_level_name}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p><strong className="text-slate-700">Group:</strong> {st.group_name}</p>
                    <p className="line-clamp-1"><strong className="text-slate-700">Strengths:</strong> {st.strengths || 'N/A'}</p>
                    <p className="line-clamp-1 text-rose-600"><strong className="text-rose-700">Needs Support:</strong> {st.areas_for_improvement || 'None'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{st.stars_count}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Attendance:</span>
                    <span className={`font-bold ${st.attendance_pct >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {st.attendance_pct}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Enroll New Student */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Enroll New Community Student</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Pooja Nair"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Class / Standard</label>
                  <select
                    value={newClass}
                    onChange={e => setNewClass(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={e => setNewAge(Number(e.target.value))}
                    min={5}
                    max={12}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Initial Strengths</label>
                <input
                  type="text"
                  value={newStrengths}
                  onChange={e => setNewStrengths(e.target.value)}
                  placeholder="e.g. Loves drawing shapes, enthusiastic"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Areas Requiring Help</label>
                <input
                  type="text"
                  value={newAreas}
                  onChange={e => setNewAreas(e.target.value)}
                  placeholder="e.g. Single-digit addition"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
