import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Header } from './components/Header';
import { AdminDashboard } from './views/AdminDashboard';
import { StudentManagement } from './views/StudentManagement';
import { LearningGroupsView } from './views/LearningGroupsView';
import { TeachingPlansView } from './views/TeachingPlansView';
import { VolunteerSessionRunner } from './views/VolunteerSessionRunner';
import { StudentChildPortal } from './views/StudentChildPortal';
import { ResourcesView } from './views/ResourcesView';
import { SessionsHistoryView } from './views/SessionsHistoryView';

import { 
  LayoutDashboard, Users, Layers, Calendar, PlayCircle, 
  BookOpen, Clock, Heart, Sparkles, UserCheck
} from 'lucide-react';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetStudentId, setTargetStudentId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Community Connect...</p>
        </div>
      </div>
    );
  }

  // If logged in as student, render Child Portal
  if (user?.role === 'student') {
    return (
      <div className="min-h-screen bg-amber-50/40 text-slate-900 pb-16 font-sans">
        <Header activeTab="student" onTabChange={setActiveTab} />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <StudentChildPortal />
        </main>
      </div>
    );
  }

  // Navigation handlers
  const handleNavigate = (tab: string, param?: any) => {
    setActiveTab(tab);
    if (tab === 'students' && param) {
      setTargetStudentId(param);
    } else {
      setTargetStudentId(null);
    }
  };

  const isVolunteer = user?.role === 'volunteer';

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pb-20 font-sans">
      <Header activeTab={activeTab} onTabChange={handleNavigate} />

      {/* Primary Sub-Navigation Bar for Admin & Volunteer */}
      <div className="border-b border-slate-200 bg-white shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5">
            {!isVolunteer && (
              <button
                onClick={() => handleNavigate('dashboard')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </button>
            )}

            <button
              onClick={() => handleNavigate('session-runner')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeTab === 'session-runner'
                  ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <PlayCircle className="w-4 h-4 text-emerald-600" />
              <span>{isVolunteer ? "Today's Session (Start)" : "Live Session Runner"}</span>
            </button>

            <button
              onClick={() => handleNavigate('students')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeTab === 'students'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students & Progress</span>
            </button>

            <button
              onClick={() => handleNavigate('groups')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeTab === 'groups'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Learning Groups</span>
            </button>

            <button
              onClick={() => handleNavigate('plans')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeTab === 'plans'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Teaching Plans</span>
            </button>

            <button
              onClick={() => handleNavigate('sessions')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeTab === 'sessions'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Session History</span>
            </button>

            <button
              onClick={() => handleNavigate('resources')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeTab === 'resources'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Worksheets & Resources</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
        {activeTab === 'students' && <StudentManagement initialStudentId={targetStudentId} />}
        {activeTab === 'groups' && <LearningGroupsView />}
        {activeTab === 'plans' && <TeachingPlansView />}
        {activeTab === 'session-runner' && <VolunteerSessionRunner />}
        {activeTab === 'sessions' && <SessionsHistoryView />}
        {activeTab === 'resources' && <ResourcesView />}
      </main>
    </div>
  );
};

export default App;
