export interface User {
  id: number;
  email: string;
  role: 'admin' | 'volunteer' | 'student';
  full_name: string;
  avatar_url?: string;
  volunteer_id?: number | null;
  student_id?: number | null;
}

export interface Student {
  id: number;
  name: string;
  age: number;
  standard_class: string;
  avatar_url?: string;
  learning_level_id?: number;
  learning_level_name?: string;
  group_id?: number;
  group_name?: string;
  strengths?: string;
  areas_for_improvement?: string;
  notes?: string;
  stars_count: number;
  attendance_pct: number;
  sessions_attended: number;
  total_sessions: number;
  joined_date?: string;
}

export interface StudentDetail extends Student {
  attendance: {
    percentage: number;
    attended: number;
    missed: number;
    total: number;
    history: {
      session_id: number;
      date: string;
      subject: string;
      topic: string;
      status: 'present' | 'absent' | 'late';
      remarks?: string;
    }[];
  };
  learning_history: {
    date: string;
    volunteer_name: string;
    subject: string;
    topic: string;
    understanding: number;
    participation: number;
    confidence: number;
    observations?: string;
    areas_needing_help?: string;
    recommended_follow_up?: string;
  }[];
  skills: {
    id: number;
    subject: string;
    skill_name: string;
    mastery_level: 'Needs Support' | 'Developing' | 'Good' | 'Mastered';
  }[];
  badges: {
    id: number;
    badge_name: string;
    category: string;
    icon: string;
    reason?: string;
    awarded_at: string;
  }[];
}

export interface LearningGroup {
  id: number;
  name: string;
  level_id: number;
  level_name: string;
  volunteer_id?: number;
  volunteer_name?: string;
  schedule_info?: string;
  description?: string;
  student_count: number;
  students: {
    id: number;
    name: string;
    standard_class: string;
    avatar_url?: string;
  }[];
}

export interface Volunteer {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  status: string;
  assigned_groups: { id: number; name: string }[];
  sessions_count: number;
}

export interface TeachingPlan {
  id: number;
  group_id: number;
  group_name: string;
  volunteer_id?: number;
  volunteer_name?: string;
  planned_date: string;
  subject: string;
  topic: string;
  objective: string;
  activities?: string;
  worksheets?: string;
  games?: string;
  materials?: string;
  notes?: string;
}

export interface SessionRecord {
  id: number;
  group_id: number;
  group_name: string;
  volunteer_id: number;
  volunteer_name: string;
  session_date: string;
  start_time?: string;
  end_time?: string;
  subject: string;
  topic: string;
  status: string;
  general_notes?: string;
  total_students: number;
  present_count: number;
}

export interface EducationalResource {
  id: number;
  title: string;
  type: 'worksheet' | 'game' | 'drawing' | 'quiz';
  subject: string;
  target_class?: string;
  target_level?: string;
  description?: string;
  content_data?: string;
  thumbnail_url?: string;
}

export interface DashboardStats {
  kpis: {
    total_students: number;
    active_volunteers: number;
    total_groups: number;
    sessions_conducted: number;
    attendance_rate: number;
    at_risk_students_count: number;
  };
  level_distribution: { name: string; count: number }[];
  students_needing_attention: {
    id: number;
    name: string;
    standard_class: string;
    group_name: string;
    attendance_pct: number;
    sessions_attended: number;
    sessions_total: number;
    reason: string;
  }[];
  recent_sessions: {
    id: number;
    date: string;
    group_name: string;
    volunteer_name: string;
    subject: string;
    topic: string;
    attendance_count: number;
  }[];
}
