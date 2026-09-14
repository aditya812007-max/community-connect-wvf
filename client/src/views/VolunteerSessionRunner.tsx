import { api } from '../api';
﻿import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { TeachingPlan, LearningGroup, Student } from '../types';
import { 
  Play, CheckCircle2, UserCheck, Star, Sliders, MessageSquare, 
  Send, Sparkles, AlertCircle, ArrowRight, ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentAttendanceInput {
  student_id: number;
  name: string;
  avatar_url?: string;
  status: 'present' | 'absent' | 'late';
  remarks: string;
}

interface StudentEvalInput {
  student_id: number;
  name: string;
  understanding: number;
  participation: number;
  confidence: number;
  observations: string;
  areas_needing_help: string;
  recommended_follow_up: string;
}

export const VolunteerSessionRunner: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<number>(1); // 1: Setup & Attendance, 2: Ratings & Observations, 3: Completed
  const [plans, setPlans] = useState<TeachingPlan[]>([]);
  const [groups, setGroups] = useState<LearningGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<LearningGroup | null>(null);

  // Session parameters
  const [subject, setSubject] = useState<string>('Mathematics');
  const [topic, setTopic] = useState<string>('Visual Addition & Number Line Match');
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // Step 1: Attendances
  const [attendances, setAttendances] = useState<StudentAttendanceInput[]>([]);

  // Step 2: Evaluations
  const [evaluations, setEvaluations] = useState<StudentEvalInput[]>([]);

  // Feedback state
  const [submitting, setSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  useEffect(() => {
    // Load plans & groups
    fetch('/api/groups')
      .then(res => res.json())
      .then((data: LearningGroup[]) => {
        setGroups(data);
        if (data.length > 0) {
          selectGroup(data[0]);
        }
      });

    fetch('/api/teaching-plans')
      .then(res => res.json())
      .then(data => setPlans(data));
  }, []);

  const selectGroup = (grp: LearningGroup) => {
    setSelectedGroup(grp);
    // Initialize attendance and evaluations for group students
    const initialAtt: StudentAttendanceInput[] = grp.students.map(st => ({
      student_id: st.id,
      name: st.name,
      avatar_url: st.avatar_url,
      status: 'present',
      remarks: ''
    }));
    setAttendances(initialAtt);

    const initialEval: StudentEvalInput[] = grp.students.map(st => ({
      student_id: st.id,
      name: st.name,
      understanding: 4,
      participation: 4,
      confidence: 4,
      observations: '',
      areas_needing_help: 'None',
      recommended_follow_up: 'Continue practicing visual worksheets'
    }));
    setEvaluations(initialEval);
  };

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendances(prev => prev.map(a => a.student_id === studentId ? { ...a, status } : a));
  };

  const handleRatingChange = (studentId: number, field: 'understanding' | 'participation' | 'confidence', value: number) => {
    setEvaluations(prev => prev.map(e => e.student_id === studentId ? { ...e, [field]: value } : e));
  };

  const handleNotesChange = (studentId: number, field: 'observations' | 'areas_needing_help', value: string) => {
    setEvaluations(prev => prev.map(e => e.student_id === studentId ? { ...e, [field]: value } : e));
  };

  const handleSubmitSession = async () => {
    if (!selectedGroup) return;
    setSubmitting(true);

    const payload = {
      group_id: selectedGroup.id,
      volunteer_id: user?.volunteer_id || 1,
      session_date: new Date().toISOString().split('T')[0],
      start_time: '16:00',
      end_time: '17:15',
      subject,
      topic,
      general_notes: generalNotes,
      attendances: attendances.map(a => ({
        student_id: a.student_id,
        status: a.status,
        remarks: a.remarks
      })),
      evaluations: evaluations
        .filter(e => {
          const att = attendances.find(a => a.student_id === e.student_id);
          return att && att.status !== 'absent';
        })
        .map(e => ({
          student_id: e.student_id,
          understanding: e.understanding,
          participation: e.participation,
          confidence: e.confidence,
          observations: e.observations,
          areas_needing_help: e.areas_needing_help,
          recommended_follow_up: e.recommended_follow_up
        }))
    };

    try {
      await api.recordSession(payload);
      setCompletedSuccess(true);
      setActiveStep(3);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Session submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Progress Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            Volunteer Classroom Workspace
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Conduct & Document Learning Session</h2>
          <p className="text-xs text-slate-500">Record attendance, student comprehension ratings, and specific follow-up observations</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
            activeStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            <span>1</span>
            <span>Attendance</span>
          </div>
          <div className="w-4 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
            activeStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            <span>2</span>
            <span>Performance & Notes</span>
          </div>
          <div className="w-4 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
            activeStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            <span>3</span>
            <span>Complete</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Setup & Attendance */}
      {activeStep === 1 && (
        <div className="space-y-6">
          {/* Group and Topic Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Group</label>
              <select
                value={selectedGroup?.id || ''}
                onChange={e => {
                  const g = groups.find(grp => grp.id === Number(e.target.value));
                  if (g) selectGroup(g);
                }}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.level_name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Lesson Topic</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Student Attendance List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Mark Student Attendance for Today</h3>
              <span className="text-xs text-slate-500">
                Present: {attendances.filter(a => a.status === 'present').length} / {attendances.length}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {attendances.map(st => (
                <div key={st.student_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={st.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=st'}
                      alt={st.name}
                      className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 p-0.5 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{st.name}</h4>
                      <span className="text-[11px] text-slate-400">Regular learner</span>
                    </div>
                  </div>

                  {/* Attendance buttons */}
                  <div className="inline-flex bg-slate-100 p-1 rounded-xl space-x-1 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleAttendanceChange(st.student_id, 'present')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        st.status === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAttendanceChange(st.student_id, 'late')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        st.status === 'late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Late
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAttendanceChange(st.student_id, 'absent')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        st.status === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Proceed to Student Evaluations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Evaluations and Observations */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-amber-900">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              Evaluate the students who were present today. These ratings feed directly into their continuous learning history and the NGO's skill progress matrix!
            </p>
          </div>

          <div className="space-y-4">
            {evaluations.map(ev => {
              const att = attendances.find(a => a.student_id === ev.student_id);
              if (att?.status === 'absent') return null;

              return (
                <div key={ev.student_id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                      <span>{ev.name}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                        Present
                      </span>
                    </h4>
                  </div>

                  {/* 1-5 Metric Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Concept Understanding</span>
                        <span className="text-indigo-600">{ev.understanding} / 5</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={ev.understanding}
                        onChange={e => handleRatingChange(ev.student_id, 'understanding', Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Class Participation</span>
                        <span className="text-emerald-600">{ev.participation} / 5</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={ev.participation}
                        onChange={e => handleRatingChange(ev.student_id, 'participation', Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Confidence & Fluency</span>
                        <span className="text-amber-600">{ev.confidence} / 5</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={ev.confidence}
                        onChange={e => handleRatingChange(ev.student_id, 'confidence', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Notes & Areas Needing Help */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Volunteer Observations</label>
                      <input
                        type="text"
                        value={ev.observations}
                        onChange={e => handleNotesChange(ev.student_id, 'observations', e.target.value)}
                        placeholder="e.g. Grasped counting in 5s quickly with beads"
                        className="w-full p-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-rose-700 block mb-1">Areas Requiring Follow-Up / Help</label>
                      <input
                        type="text"
                        value={ev.areas_needing_help}
                        onChange={e => handleNotesChange(ev.student_id, 'areas_needing_help', e.target.value)}
                        placeholder="e.g. Struggles with subtraction regrouping"
                        className="w-full p-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Session Level General Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-2">
            <label className="font-bold text-slate-700 block">General Session Remarks & Activity Summary</label>
            <textarea
              rows={2}
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
              placeholder="e.g. Conducted group game with fruit cards. Children were enthusiastic and energetic."
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Back to Attendance
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitSession}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Complete & Save Session'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Success Confirmation */}
      {activeStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Learning Session Recorded!</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Attendance and evaluations have been permanently recorded. Students have been awarded participation stars, and the progress records are synced with the Admin dashboard.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setActiveStep(1);
                setCompletedSuccess(false);
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Start Another Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
