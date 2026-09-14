import { 
  DashboardStats, Student, StudentDetail, LearningGroup, TeachingPlan, 
  SessionRecord, EducationalResource 
} from './types';
import { 
  initialStudents, initialGroups, initialTeachingPlans, initialSessions, 
  initialResources, getLocalData, setLocalData 
} from './mockData';

// Safe fetch wrapper that attempts the live API first, and seamlessly falls back to localStorage/mockData on Vercel
export const api = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) return await res.json();
    } catch (_) {}

    const students = getLocalData<Student[]>('students', initialStudents);
    const sessions = getLocalData<SessionRecord[]>('sessions', initialSessions);
    const groups = getLocalData<LearningGroup[]>('groups', initialGroups);

    const levelCounts: Record<string, number> = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    students.forEach(s => {
      if (s.learning_level_name && levelCounts[s.learning_level_name] !== undefined) {
        levelCounts[s.learning_level_name]++;
      }
    });

    const atRisk = students.filter(s => s.attendance_pct < 75.0);

    return {
      kpis: {
        total_students: students.length,
        active_volunteers: 2,
        total_groups: groups.length,
        sessions_conducted: sessions.length,
        attendance_rate: 83.3,
        at_risk_students_count: atRisk.length
      },
      level_distribution: [
        { name: 'Beginner', count: levelCounts['Beginner'] },
        { name: 'Intermediate', count: levelCounts['Intermediate'] },
        { name: 'Advanced', count: levelCounts['Advanced'] }
      ],
      students_needing_attention: atRisk.map(s => ({
        id: s.id,
        name: s.name,
        standard_class: s.standard_class,
        group_name: s.group_name || 'Unassigned',
        attendance_pct: s.attendance_pct,
        sessions_attended: s.sessions_attended,
        sessions_total: s.total_sessions,
        reason: `Low attendance: attended ${s.sessions_attended} of ${s.total_sessions} sessions.`
      })),
      recent_sessions: sessions.slice(0, 5).map(s => ({
        id: s.id,
        date: s.session_date,
        group_name: s.group_name,
        volunteer_name: s.volunteer_name,
        subject: s.subject,
        topic: s.topic,
        attendance_count: s.present_count
      }))
    };
  },

  getStudents: async (): Promise<Student[]> => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) return await res.json();
    } catch (_) {}
    return getLocalData<Student[]>('students', initialStudents);
  },

  getStudentDetail: async (studentId: number): Promise<StudentDetail> => {
    try {
      const res = await fetch(`/api/students/${studentId}`);
      if (res.ok) return await res.json();
    } catch (_) {}

    const students = getLocalData<Student[]>('students', initialStudents);
    const s = students.find(st => st.id === studentId) || students[0];

    return {
      ...s,
      attendance: {
        percentage: s.attendance_pct,
        attended: s.sessions_attended,
        missed: s.total_sessions - s.sessions_attended,
        total: s.total_sessions,
        history: [
          { session_id: 4, date: "2026-09-12", subject: "English", topic: "Story Time", status: s.attendance_pct < 50 ? "absent" : "present" },
          { session_id: 3, date: "2026-09-10", subject: "English", topic: "Vowels & Words", status: s.attendance_pct < 50 ? "absent" : "present" },
          { session_id: 2, date: "2026-09-07", subject: "Mathematics", topic: "Addition Basics", status: "present" },
          { session_id: 1, date: "2026-09-04", subject: "Mathematics", topic: "Counting 1-20", status: s.attendance_pct < 50 ? "absent" : "present" }
        ]
      },
      learning_history: [
        {
          date: "2026-09-12",
          volunteer_name: "Rohit Mehta",
          subject: "English",
          topic: "Story Time: The Brave Little Squirrel",
          understanding: 4,
          participation: 5,
          confidence: 4,
          observations: `${s.name} actively participated in shared reading.`,
          areas_needing_help: s.areas_for_improvement || "None",
          recommended_follow_up: "Provide practice worksheet"
        },
        {
          date: "2026-09-07",
          volunteer_name: "Rohit Mehta",
          subject: "Mathematics",
          topic: "Addition Basics (Single Digit)",
          understanding: 5,
          participation: 4,
          confidence: 4,
          observations: "Grasped visual counters quickly.",
          areas_needing_help: "None",
          recommended_follow_up: "Move to 2-digit sums"
        }
      ],
      skills: [
        { id: 1, subject: "Mathematics", skill_name: "Counting (1-50)", mastery_level: s.learning_level_name === "Beginner" ? "Good" : "Mastered" },
        { id: 2, subject: "Mathematics", skill_name: "Addition (1-2 Digits)", mastery_level: s.learning_level_name === "Advanced" ? "Mastered" : "Developing" },
        { id: 3, subject: "Mathematics", skill_name: "Subtraction (Basic)", mastery_level: s.learning_level_name === "Beginner" ? "Needs Support" : "Developing" },
        { id: 4, subject: "English", skill_name: "Alphabet & Phonics", mastery_level: "Mastered" },
        { id: 5, subject: "English", skill_name: "Sight Words", mastery_level: "Good" },
        { id: 6, subject: "English", skill_name: "Simple Sentences", mastery_level: s.learning_level_name === "Beginner" ? "Needs Support" : "Good" }
      ],
      badges: [
        { id: 1, badge_name: "First Session", category: "participation", icon: "Award", reason: "Completed first interactive learning session!", awarded_at: "2026-07-20" },
        { id: 2, badge_name: "Math Explorer", category: "math", icon: "Compass", reason: "Solved 10 visual counting challenges.", awarded_at: "2026-08-05" },
        { id: 3, badge_name: "Super Artist", category: "art", icon: "Palette", reason: "Created an imaginative drawing on the canvas.", awarded_at: "2026-08-18" }
      ]
    };
  },

  createStudent: async (data: any): Promise<Student> => {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const students = getLocalData<Student[]>('students', initialStudents);
    const newStudent: Student = {
      id: students.length + 1,
      name: data.name,
      age: data.age,
      standard_class: data.standard_class,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.name.replace(/\s+/g, '')}`,
      learning_level_id: data.learning_level_id || 1,
      learning_level_name: "Beginner",
      group_id: 1,
      group_name: "Sunshine Explorers (Class 1-2 Math & Literacy)",
      strengths: data.strengths || "Creative and enthusiastic",
      areas_for_improvement: data.areas_for_improvement || "Basic counting",
      stars_count: 10,
      attendance_pct: 100.0,
      sessions_attended: 0,
      total_sessions: 0,
      joined_date: new Date().toISOString().split('T')[0]
    };
    students.unshift(newStudent);
    setLocalData('students', students);
    return newStudent;
  },

  getGroups: async (): Promise<LearningGroup[]> => {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) return await res.json();
    } catch (_) {}
    return getLocalData<LearningGroup[]>('groups', initialGroups);
  },

  createGroup: async (data: any): Promise<LearningGroup> => {
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const groups = getLocalData<LearningGroup[]>('groups', initialGroups);
    const newGroup: LearningGroup = {
      id: groups.length + 1,
      name: data.name,
      level_id: data.level_id,
      level_name: data.level_id === 1 ? 'Beginner' : data.level_id === 2 ? 'Intermediate' : 'Advanced',
      volunteer_id: 1,
      volunteer_name: "Priya Sharma",
      schedule_info: data.schedule_info || "Mon, Wed • 4:00 PM - 5:15 PM",
      description: data.description || "Community learning cohort",
      student_count: 0,
      students: []
    };
    groups.push(newGroup);
    setLocalData('groups', groups);
    return newGroup;
  },

  getTeachingPlans: async (): Promise<TeachingPlan[]> => {
    try {
      const res = await fetch('/api/teaching-plans');
      if (res.ok) return await res.json();
    } catch (_) {}
    return getLocalData<TeachingPlan[]>('plans', initialTeachingPlans);
  },

  createTeachingPlan: async (data: any): Promise<TeachingPlan> => {
    try {
      const res = await fetch('/api/teaching-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const plans = getLocalData<TeachingPlan[]>('plans', initialTeachingPlans);
    const newPlan: TeachingPlan = {
      id: plans.length + 1,
      group_id: data.group_id,
      group_name: "Learning Group",
      volunteer_id: 1,
      volunteer_name: "Priya Sharma",
      planned_date: data.planned_date,
      subject: data.subject,
      topic: data.topic,
      objective: data.objective,
      activities: data.activities,
      worksheets: data.worksheets,
      games: data.games,
      materials: data.materials,
      notes: data.notes
    };
    plans.unshift(newPlan);
    setLocalData('plans', plans);
    return newPlan;
  },

  getSessions: async (): Promise<SessionRecord[]> => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) return await res.json();
    } catch (_) {}
    return getLocalData<SessionRecord[]>('sessions', initialSessions);
  },

  recordSession: async (payload: any): Promise<any> => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const sessions = getLocalData<SessionRecord[]>('sessions', initialSessions);
    const newSession: SessionRecord = {
      id: sessions.length + 1,
      group_id: payload.group_id,
      group_name: "Little Innovators (Class 2-3 Arithmetic)",
      volunteer_id: payload.volunteer_id || 1,
      volunteer_name: "Priya Sharma",
      session_date: payload.session_date || new Date().toISOString().split('T')[0],
      start_time: payload.start_time || "16:00",
      end_time: payload.end_time || "17:15",
      subject: payload.subject,
      topic: payload.topic,
      status: "completed",
      general_notes: payload.general_notes,
      total_students: payload.attendances?.length || 3,
      present_count: (payload.attendances || []).filter((a: any) => a.status === 'present').length
    };
    sessions.unshift(newSession);
    setLocalData('sessions', sessions);
    return { message: "Session recorded successfully", session_id: newSession.id };
  },

  getResources: async (): Promise<EducationalResource[]> => {
    try {
      const res = await fetch('/api/resources');
      if (res.ok) return await res.json();
    } catch (_) {}
    return getLocalData<EducationalResource[]>('resources', initialResources);
  },

  getStudentPortalProfile: async (studentId: number): Promise<any> => {
    try {
      const res = await fetch(`/api/student-portal/${studentId}`);
      if (res.ok) return await res.json();
    } catch (_) {}

    const stars = getLocalData<number>('student_stars', 42);
    return {
      id: studentId,
      name: "Aarav Kumar",
      standard_class: "Class 2",
      stars_count: stars,
      badges: [
        { id: 1, name: "First Session", category: "participation", icon: "Award", reason: "Completed first interactive session!" },
        { id: 2, name: "Math Explorer", category: "math", icon: "Compass", reason: "Solved 10 visual counting challenges." },
        { id: 3, name: "Super Artist", category: "art", icon: "Palette", reason: "Created an imaginative drawing on the canvas." },
        { id: 4, name: "Word Wizard", category: "english", icon: "BookOpen", reason: "Mastered 20 everyday sight words." }
      ],
      recent_activities: [
        { title: "Math Counting Fun", type: "game", stars_earned: 2, completed_at: "Today" },
        { title: "Animal Phonics Match", type: "game", stars_earned: 2, completed_at: "Today" },
        { title: "Creative Art Canvas", type: "drawing", stars_earned: 3, completed_at: "Yesterday" }
      ]
    };
  },

  logActivity: async (data: any): Promise<any> => {
    try {
      const res = await fetch('/api/student-portal/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const currentStars = getLocalData<number>('student_stars', 42);
    const newStars = currentStars + (data.stars_earned || 1);
    setLocalData('student_stars', newStars);
    return { message: "Activity logged!", total_stars: newStars };
  },

  getAiRecommendation: async (studentId: number): Promise<any> => {
    try {
      const res = await fetch(`/api/ai/recommend-level/${studentId}`);
      if (res.ok) return await res.json();
    } catch (_) {}

    return {
      student_id: studentId,
      recommended_level: "Intermediate",
      rationale: "Shows consistent enthusiasm with counting and phonics. Recommended for Intermediate group with focused practice on 2-digit subtraction regrouping.",
      confidence_score: 0.92
    };
  }
};
