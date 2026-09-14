import { api } from '../api';
﻿import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  Sparkles, Star, Award, Palette, Gamepad2, BookOpen, 
  Smile, CheckCircle2, RotateCcw, Volume2, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentChildPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'math' | 'english' | 'draw' | 'badges'>('home');
  const [portalData, setPortalData] = useState<any>(null);

  // Mini-Game 1: Math Counting
  const [mathScore, setMathScore] = useState(0);
  const [mathQuestionIdx, setMathQuestionIdx] = useState(0);
  const [mathAnswerState, setMathAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const mathQuestions = [
    { items: ['🐶', '🐶', '🐶', '🐶'], prompt: 'How many friendly puppies do you see?', options: [3, 4, 5, 6], answer: 4 },
    { items: ['⭐', '⭐', '⭐', '⭐', '⭐', '⭐'], prompt: 'Count the bright golden stars!', options: [5, 6, 7, 8], answer: 6 },
    { items: ['🍎', '🍎', '🍎'], prompt: 'How many juicy red apples are there?', options: [2, 3, 4, 5], answer: 3 },
    { items: ['🦋', '🦋', '🦋', '🦋', '🦋'], prompt: 'Count the pretty fluttering butterflies!', options: [4, 5, 6, 7], answer: 5 }
  ];

  // Mini-Game 2: English Word & Phonics Matching
  const [englishIdx, setEnglishIdx] = useState(0);
  const [englishState, setEnglishState] = useState<'idle' | 'correct'>('idle');
  const englishQuestions = [
    { word: 'Lion', icon: '🦁', sound: 'L - L - Lion', prompt: 'Which letter does Lion begin with?', options: ['L', 'M', 'B', 'P'], answer: 'L' },
    { word: 'Elephant', icon: '🐘', sound: 'E - E - Elephant', prompt: 'Which letter does Elephant start with?', options: ['A', 'E', 'O', 'T'], answer: 'E' },
    { word: 'Sun', icon: '☀️', sound: 'S - S - Sun', prompt: 'Which letter starts Sun?', options: ['S', 'C', 'N', 'D'], answer: 'S' }
  ];

  // Canvas Drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(8);

  const studentId = user?.student_id || 1;

  const loadStudentPortalData = () => {
    fetch(`/api/student-portal/${studentId}`)
      .then(res => res.json())
      .then(data => setPortalData(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadStudentPortalData();
  }, [studentId]);

  // Handle Math Answer
  const handleMathAnswer = (val: number) => {
    const currentQ = mathQuestions[mathQuestionIdx];
    if (val === currentQ.answer) {
      setMathAnswerState('correct');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      
      api.logActivity({
        student_id: studentId,
        activity_type: 'game',
        activity_title: 'Math Animal Counting',
        score: 10,
        stars_earned: 2
      }).then(() => loadStudentPortalData());

      setTimeout(() => {
        setMathAnswerState('idle');
        setMathQuestionIdx((prev) => (prev + 1) % mathQuestions.length);
        setMathScore(s => s + 1);
      }, 1500);
    } else {
      setMathAnswerState('wrong');
      setTimeout(() => setMathAnswerState('idle'), 1000);
    }
  };

  // Handle English Answer
  const handleEnglishAnswer = (letter: string) => {
    const currentQ = englishQuestions[englishIdx];
    if (letter === currentQ.answer) {
      setEnglishState('correct');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

      api.logActivity({
        student_id: studentId,
        activity_type: 'game',
        activity_title: 'English Phonics Match',
        score: 10,
        stars_earned: 2
      }).then(() => loadStudentPortalData());

      setTimeout(() => {
        setEnglishState('idle');
        setEnglishIdx(prev => (prev + 1) % englishQuestions.length);
      }, 1500);
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawingStars = () => {
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    api.logActivity({
      student_id: studentId,
      activity_type: 'drawing',
      activity_title: 'Creative Art Canvas',
      stars_earned: 3
    }).then(() => loadStudentPortalData());
  };

  return (
    <div className="space-y-6">
      {/* Playful Top Hero Banner for Kids */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5 z-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl p-2 flex items-center justify-center border-2 border-white/40 shadow-inner">
            <Smile className="w-12 h-12 text-yellow-100" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/30 px-3 py-1 rounded-full text-white">
              Student Fun Zone • Class 1–4
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900 tracking-tight">
              Hello, {portalData?.name || 'Aarav'}! 🌟
            </h1>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Ready to play games, count with friends, and earn shining stars today?
            </p>
          </div>
        </div>

        {/* Big Star Badge */}
        <div className="z-10 bg-white/95 text-slate-900 rounded-3xl px-6 py-4 shadow-xl flex items-center space-x-4 border-2 border-amber-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500">
            <Star className="w-8 h-8 fill-amber-400 text-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-amber-600 block">My Star Bank</span>
            <span className="text-3xl font-black text-slate-900">{portalData?.stars_count || 38} Stars</span>
          </div>
        </div>
      </div>

      {/* Child-Friendly Big Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('math')}
          className={`p-5 rounded-3xl font-extrabold text-base flex flex-col items-center justify-center space-y-2 transition-all shadow-md transform hover:-translate-y-1 ${
            activeTab === 'math'
              ? 'bg-blue-600 text-white ring-4 ring-blue-300'
              : 'bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-100'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <span className="text-lg">Maths Fun</span>
          <span className="text-xs font-semibold text-blue-200">Counting & Numbers</span>
        </button>

        <button
          onClick={() => setActiveTab('english')}
          className={`p-5 rounded-3xl font-extrabold text-base flex flex-col items-center justify-center space-y-2 transition-all shadow-md transform hover:-translate-y-1 ${
            activeTab === 'english'
              ? 'bg-emerald-600 text-white ring-4 ring-emerald-300'
              : 'bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-100'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-lg">English Words</span>
          <span className="text-xs font-semibold text-emerald-200">Phonics & Letters</span>
        </button>

        <button
          onClick={() => setActiveTab('draw')}
          className={`p-5 rounded-3xl font-extrabold text-base flex flex-col items-center justify-center space-y-2 transition-all shadow-md transform hover:-translate-y-1 ${
            activeTab === 'draw'
              ? 'bg-purple-600 text-white ring-4 ring-purple-300'
              : 'bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-100'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Palette className="w-7 h-7" />
          </div>
          <span className="text-lg">Drawing Pad</span>
          <span className="text-xs font-semibold text-purple-200">Colors & Shapes</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`p-5 rounded-3xl font-extrabold text-base flex flex-col items-center justify-center space-y-2 transition-all shadow-md transform hover:-translate-y-1 ${
            activeTab === 'badges'
              ? 'bg-amber-500 text-white ring-4 ring-amber-300'
              : 'bg-white hover:bg-amber-50 text-amber-700 border-2 border-amber-100'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Award className="w-7 h-7" />
          </div>
          <span className="text-lg">My Badges</span>
          <span className="text-xs font-semibold text-amber-200">Trophies & Honors</span>
        </button>
      </div>

      {/* TAB CONTENT: MATHS FUN */}
      {activeTab === 'math' && (
        <div className="bg-white rounded-3xl border-2 border-blue-100 p-6 sm:p-8 shadow-md space-y-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black">
            <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
            <span>Challenge #{mathQuestionIdx + 1} • Earn 2 Stars!</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900">
            {mathQuestions[mathQuestionIdx].prompt}
          </h3>

          {/* Emoji counters display */}
          <div className="flex flex-wrap justify-center gap-4 py-6 text-5xl sm:text-6xl bg-blue-50/50 rounded-2xl border border-blue-100/80">
            {mathQuestions[mathQuestionIdx].items.map((emoji, i) => (
              <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 120}ms` }}>
                {emoji}
              </span>
            ))}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {mathQuestions[mathQuestionIdx].options.map(opt => (
              <button
                key={opt}
                onClick={() => handleMathAnswer(opt)}
                className="py-5 px-6 rounded-2xl bg-blue-50 hover:bg-blue-600 text-blue-900 hover:text-white text-3xl font-black transition-all border-2 border-blue-200 shadow-sm transform active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>

          {mathAnswerState === 'correct' && (
            <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
              <span>Great Job! +2 Stars Awarded! ⭐⭐</span>
            </div>
          )}
          {mathAnswerState === 'wrong' && (
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl font-bold text-sm">
              Almost there! Try counting once again! 😊
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ENGLISH WORDS */}
      {activeTab === 'english' && (
        <div className="bg-white rounded-3xl border-2 border-emerald-100 p-6 sm:p-8 shadow-md space-y-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Phonics Sound Fun • Earn 2 Stars!</span>
          </div>

          <div className="py-4">
            <span className="text-7xl block mb-2">{englishQuestions[englishIdx].icon}</span>
            <h3 className="text-3xl font-black text-slate-900">{englishQuestions[englishIdx].word}</h3>
            <p className="text-emerald-700 font-bold text-sm mt-1">{englishQuestions[englishIdx].sound}</p>
          </div>

          <p className="text-lg font-bold text-slate-700">{englishQuestions[englishIdx].prompt}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {englishQuestions[englishIdx].options.map(letter => (
              <button
                key={letter}
                onClick={() => handleEnglishAnswer(letter)}
                className="py-5 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-600 text-emerald-900 hover:text-white text-3xl font-black transition-all border-2 border-emerald-200 shadow-sm transform active:scale-95"
              >
                {letter}
              </button>
            ))}
          </div>

          {englishState === 'correct' && (
            <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
              <span>Super Reader! ⭐⭐</span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DRAWING PAD */}
      {activeTab === 'draw' && (
        <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 shadow-md space-y-4 max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-purple-100">
            <div>
              <h3 className="text-xl font-black text-slate-900">Creative Drawing Canvas</h3>
              <p className="text-xs font-semibold text-purple-600">Pick a color, draw your favorite animal or shape, and collect stars!</p>
            </div>

            {/* Colors palette */}
            <div className="flex items-center space-x-2">
              {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#111827'].map(col => (
                <button
                  key={col}
                  onClick={() => setBrushColor(col)}
                  style={{ backgroundColor: col }}
                  className={`w-7 h-7 rounded-full transition-transform ${brushColor === col ? 'scale-125 ring-2 ring-slate-400' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Interactive Canvas Element */}
          <div className="border-2 border-dashed border-purple-200 rounded-2xl overflow-hidden bg-slate-50 flex justify-center">
            <canvas
              ref={canvasRef}
              width={650}
              height={380}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="bg-white cursor-crosshair touch-none w-full max-w-[650px] h-[380px]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={clearCanvas}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Canvas</span>
            </button>

            <button
              onClick={saveDrawingStars}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs rounded-xl shadow-md transform hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Show Volunteer & Earn 3 Stars! ⭐</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MY BADGES */}
      {activeTab === 'badges' && (
        <div className="bg-white rounded-3xl border-2 border-amber-100 p-6 sm:p-8 shadow-md space-y-6 max-w-3xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900">My Trophy Case 🏆</h3>
            <p className="text-xs font-bold text-amber-700 mt-1">Celebrating your personal efforts and joyful learning achievements!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(portalData?.badges || []).map((b: any) => (
              <div key={b.id} className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-200 flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-md">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">{b.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{b.reason || 'Outstanding participation in community session'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent completed activities */}
          <div className="pt-6 border-t border-amber-100">
            <h4 className="font-bold text-slate-800 text-sm mb-3">Recently Completed Activities</h4>
            <div className="space-y-2">
              {(portalData?.recent_activities || []).map((act: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                  <span className="font-bold text-slate-700">{act.title}</span>
                  <span className="font-black text-amber-600">+{act.stars_earned} ⭐ ({act.completed_at})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
