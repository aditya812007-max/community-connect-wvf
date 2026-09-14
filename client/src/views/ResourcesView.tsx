import { api } from '../api';
﻿import React, { useEffect, useState } from 'react';
import { EducationalResource } from '../types';
import { BookOpen, Gamepad2, Palette, HelpCircle, Download, ExternalLink, Filter } from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      });
  }, []);

  const filtered = resources.filter(r => {
    const matchType = filterType === 'all' || r.type === filterType;
    const matchSubj = filterSubject === 'all' || r.subject === filterSubject;
    return matchType && matchSubj;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Educational Resources & Activities</h2>
          <p className="text-xs text-slate-500">
            Activity worksheets, interactive educational games, drawing prompts, and quizzes for Classes 1–4
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Type:</span>
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            {['all', 'worksheet', 'game', 'drawing', 'quiz'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterType === t ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Subject:</span>
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            {['all', 'Mathematics', 'English', 'Art'].map(s => (
              <button
                key={s}
                onClick={() => setFilterSubject(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterSubject === s ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(res => (
          <div key={res.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="h-36 overflow-hidden relative bg-slate-100">
                <img
                  src={res.thumbnail_url || 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=300'}
                  alt={res.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-xs text-indigo-800 shadow-xs capitalize">
                  {res.type}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-indigo-600">
                  <span>{res.subject}</span>
                  <span>•</span>
                  <span>{res.target_level}</span>
                  <span>•</span>
                  <span>{res.target_class}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-1">{res.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{res.description}</p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button className="w-full py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 border border-slate-200">
                <span>Access Activity In Classroom</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
