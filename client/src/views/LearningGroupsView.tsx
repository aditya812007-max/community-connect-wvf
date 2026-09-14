import { api } from '../api';
﻿import React, { useEffect, useState } from 'react';
import { LearningGroup } from '../types';
import { Layers, Plus, Users, UserCheck, Calendar, Clock, ArrowRight } from 'lucide-react';

export const LearningGroupsView: React.FC = () => {
  const [groups, setGroups] = useState<LearningGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState('');
  const [levelId, setLevelId] = useState(1);
  const [schedule, setSchedule] = useState('Mon, Wed • 4:00 PM - 5:15 PM');
  const [description, setDescription] = useState('');

  const loadGroups = () => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        setGroups(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        level_id: Number(levelId),
        schedule_info: schedule,
        description,
        volunteer_id: 1
      })
    });
    if (res.ok) {
      setShowCreate(false);
      setName('');
      setDescription('');
      loadGroups();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Learning Groups & Levels</h2>
          <p className="text-xs text-slate-500">
            Differentiate instruction by learning stage (Beginner, Intermediate, Advanced) rather than strict age
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Learning Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(grp => (
          <div key={grp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  grp.level_name === 'Beginner' ? 'bg-amber-100 text-amber-800' :
                  grp.level_name === 'Intermediate' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {grp.level_name} Level
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1" />
                  {grp.student_count} Students
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-3">{grp.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{grp.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{grp.schedule_info || 'Flexible timing'}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Lead Volunteer: <strong className="text-slate-800">{grp.volunteer_name}</strong></span>
                </div>
              </div>

              {/* Student thumbnails in group */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Assigned Students:</span>
                <div className="flex items-center -space-x-2 overflow-hidden">
                  {grp.students.map(st => (
                    <img
                      key={st.id}
                      title={`${st.name} (${st.standard_class})`}
                      src={st.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=s'}
                      alt={st.name}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100">
              <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1">
                <span>View Group Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create New Learning Group</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Star Explorers (Class 1 Phonics)"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Learning Level</label>
                <select
                  value={levelId}
                  onChange={e => setLevelId(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value={1}>Beginner</option>
                  <option value={2}>Intermediate</option>
                  <option value={3}>Advanced</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Schedule Info</label>
                <input
                  type="text"
                  value={schedule}
                  onChange={e => setSchedule(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Focus / Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Tactile counting and alphabet letter-sound connections"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
