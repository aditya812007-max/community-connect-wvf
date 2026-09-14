import { api } from '../api';
﻿import React, { useEffect, useState } from 'react';
import { TeachingPlan, LearningGroup } from '../types';
import { Calendar, Plus, BookOpen, Layers, CheckSquare, Sparkles, FileText } from 'lucide-react';

export const TeachingPlansView: React.FC = () => {
  const [plans, setPlans] = useState<TeachingPlan[]>([]);
  const [groups, setGroups] = useState<LearningGroup[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  // Form states
  const [groupId, setGroupId] = useState<number>(1);
  const [plannedDate, setPlannedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [objective, setObjective] = useState('');
  const [activities, setActivities] = useState('');
  const [worksheets, setWorksheets] = useState('');
  const [games, setGames] = useState('');
  const [materials, setMaterials] = useState('');

  const loadPlans = () => {
    fetch('/api/teaching-plans')
      .then(res => res.json())
      .then(data => setPlans(data));
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => setGroups(data));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/teaching-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: Number(groupId),
        planned_date: plannedDate,
        subject,
        topic,
        objective,
        activities,
        worksheets,
        games,
        materials,
        volunteer_id: 1
      })
    });
    if (res.ok) {
      setShowCreate(false);
      setTopic('');
      setObjective('');
      setActivities('');
      loadPlans();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Weekly Teaching Plans</h2>
          <p className="text-xs text-slate-500">
            Structured session agendas, worksheets, and tactile activities mapped to learning groups
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Teaching Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-indigo-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{p.subject}</span>
                <h3 className="font-extrabold text-slate-900 text-base mt-0.5">{p.topic}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Group: <strong className="text-slate-800">{p.group_name}</strong> • Scheduled: {p.planned_date}
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                Lead: {p.volunteer_name}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <strong className="text-slate-700 block mb-1">Learning Objective:</strong>
              <p className="text-slate-600 leading-relaxed">{p.objective}</p>
            </div>

            {p.activities && (
              <div className="text-xs space-y-1">
                <strong className="text-slate-700 flex items-center space-x-1">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Interactive Activities:</span>
                </strong>
                <p className="text-slate-600 whitespace-pre-line pl-4">{p.activities}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Worksheets & Games</span>
                <span className="text-slate-800 font-medium">{p.worksheets || p.games || 'Flashcards & whiteboard'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Materials</span>
                <span className="text-slate-800 font-medium">{p.materials || 'Standard kit'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Create Weekly Teaching Plan</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Learning Group</label>
                  <select
                    value={groupId}
                    onChange={e => setGroupId(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={plannedDate}
                    onChange={e => setPlannedDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Drawing / Art">Drawing / Art</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Numbers 1-50 & Group Counting"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Learning Objective</label>
                <textarea
                  required
                  rows={2}
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="e.g. Students should be able to count in 5s and group bead counters."
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Planned Activities</label>
                <textarea
                  rows={3}
                  value={activities}
                  onChange={e => setActivities(e.target.value)}
                  placeholder="1. Counting song\n2. Tactile beads game\n3. Whiteboard drawing"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Worksheets & Games</label>
                  <input
                    type="text"
                    value={worksheets}
                    onChange={e => setWorksheets(e.target.value)}
                    placeholder="e.g. Number line worksheet"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Required Materials</label>
                  <input
                    type="text"
                    value={materials}
                    onChange={e => setMaterials(e.target.value)}
                    placeholder="e.g. Beads, flashcards, sketch pens"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
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
                  Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
