import { DashboardStats, Student, StudentDetail, LearningGroup, Volunteer, TeachingPlan, SessionRecord, EducationalResource } from './types';

// Seed initial state into localStorage if not present
const STORAGE_KEY_PREFIX = 'wvf_cc_';

export const initialStudents: Student[] = [
  {
    id: 1,
    name: "Aarav Kumar",
    age: 7,
    standard_class: "Class 2",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav",
    learning_level_id: 2,
    learning_level_name: "Intermediate",
    group_id: 2,
    group_name: "Little Innovators (Class 2-3 Arithmetic)",
    strengths: "Quick with mental addition, very active in games",
    areas_for_improvement: "Struggles with 2-digit subtraction with borrow",
    notes: "Attentive when visual objects/counters are used.",
    stars_count: 38,
    attendance_pct: 100.0,
    sessions_attended: 4,
    total_sessions: 4,
    joined_date: "2026-07-15"
  },
  {
    id: 2,
    name: "Diya Patel",
    age: 6,
    standard_class: "Class 1",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Diya",
    learning_level_id: 1,
    learning_level_name: "Beginner",
    group_id: 1,
    group_name: "Sunshine Explorers (Class 1-2 Math & Literacy)",
    strengths: "Loves drawing, good alphabet recall",
    areas_for_improvement: "Needs help counting above 20",
    notes: "Very cooperative and eager to participate.",
    stars_count: 24,
    attendance_pct: 100.0,
    sessions_attended: 4,
    total_sessions: 4,
    joined_date: "2026-07-20"
  },
  {
    id: 3,
    name: "Vihaan Singh",
    age: 7,
    standard_class: "Class 2",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Vihaan",
    learning_level_id: 1,
    learning_level_name: "Beginner",
    group_id: 1,
    group_name: "Sunshine Explorers (Class 1-2 Math & Literacy)",
    strengths: "High energy, great spoken English",
    areas_for_improvement: "Frequent absences, needs consistent reinforcement",
    notes: "Missed 3 of last 4 sessions due to seasonal illness.",
    stars_count: 14,
    attendance_pct: 25.0,
    sessions_attended: 1,
    total_sessions: 4,
    joined_date: "2026-07-22"
  },
  {
    id: 4,
    name: "Ananya Sharma",
    age: 8,
    standard_class: "Class 3",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Ananya",
    learning_level_id: 2,
    learning_level_name: "Intermediate",
    group_id: 2,
    group_name: "Little Innovators (Class 2-3 Arithmetic)",
    strengths: "Confident reader, strong vocabulary",
    areas_for_improvement: "Multiplication tables (needs visual arrays)",
    notes: "Helps peer students patiently.",
    stars_count: 42,
    attendance_pct: 100.0,
    sessions_attended: 4,
    total_sessions: 4,
    joined_date: "2026-07-10"
  },
  {
    id: 5,
    name: "Kabir Das",
    age: 9,
    standard_class: "Class 4",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Kabir",
    learning_level_id: 3,
    learning_level_name: "Advanced",
    group_id: 3,
    group_name: "Bright Champions (Class 3-4 All-Round)",
    strengths: "Logical reasoning, quick math quiz solver",
    areas_for_improvement: "English sentence grammar and punctuation",
    notes: "Ready for advanced multi-step arithmetic.",
    stars_count: 55,
    attendance_pct: 100.0,
    sessions_attended: 4,
    total_sessions: 4,
    joined_date: "2026-07-05"
  },
  {
    id: 6,
    name: "Meera Rao",
    age: 8,
    standard_class: "Class 3",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Meera",
    learning_level_id: 2,
    learning_level_name: "Intermediate",
    group_id: 2,
    group_name: "Little Innovators (Class 2-3 Arithmetic)",
    strengths: "Creative writing, wonderful sketch artist",
    areas_for_improvement: "Number line visualization",
    notes: "Thrives on gamified rewards.",
    stars_count: 31,
    attendance_pct: 100.0,
    sessions_attended: 4,
    total_sessions: 4,
    joined_date: "2026-07-12"
  },
  {
    id: 7,
    name: "Rohan Joshi",
    age: 6,
    standard_class: "Class 1",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Rohan",
    learning_level_id: 1,
    learning_level_name: "Beginner",
    group_id: 1,
    group_name: "Sunshine Explorers (Class 1-2 Math & Literacy)",
    strengths: "Phonics sounds, cheerful demeanor",
    areas_for_improvement: "Pencil grip and writing numbers",
    notes: "Benefits from finger-tracing activities.",
    stars_count: 19,
    attendance_pct: 100.0,
    sessions_attended: 4,
    total_sessions: 4,
    joined_date: "2026-07-25"
  },
  {
    id: 8,
    name: "Sneha Gupta",
    age: 9,
    standard_class: "Class 4",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Sneha",
    learning_level_id: 3,
    learning_level_name: "Advanced",
    group_id: 3,
    group_name: "Bright Champions (Class 3-4 All-Round)",
    strengths: "Excellent problem solver, consistent attendance",
    areas_for_improvement: "Self-confidence when speaking aloud",
    notes: "Encourage her to explain solutions to the class.",
    stars_count: 60,
    attendance_pct: 100.0,
    sessions_attended: 4,
    total_sessions: 4,
    joined_date: "2026-07-02"
  }
];

export const initialGroups: LearningGroup[] = [
  {
    id: 1,
    name: "Sunshine Explorers (Class 1-2 Math & Literacy)",
    level_id: 1,
    level_name: "Beginner",
    volunteer_id: 1,
    volunteer_name: "Priya Sharma",
    schedule_info: "Mon, Wed, Fri • 4:00 PM - 5:15 PM",
    description: "Early math and English readiness through flashcards and tactile games.",
    student_count: 3,
    students: [
      { id: 2, name: "Diya Patel", standard_class: "Class 1", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Diya" },
      { id: 3, name: "Vihaan Singh", standard_class: "Class 2", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Vihaan" },
      { id: 7, name: "Rohan Joshi", standard_class: "Class 1", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Rohan" }
    ]
  },
  {
    id: 2,
    name: "Little Innovators (Class 2-3 Arithmetic)",
    level_id: 2,
    level_name: "Intermediate",
    volunteer_id: 2,
    volunteer_name: "Rohit Mehta",
    schedule_info: "Tue, Thu, Sat • 4:30 PM - 5:45 PM",
    description: "Addition, subtraction mastery, and reading short storybooks.",
    student_count: 3,
    students: [
      { id: 1, name: "Aarav Kumar", standard_class: "Class 2", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav" },
      { id: 4, name: "Ananya Sharma", standard_class: "Class 3", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Ananya" },
      { id: 6, name: "Meera Rao", standard_class: "Class 3", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Meera" }
    ]
  },
  {
    id: 3,
    name: "Bright Champions (Class 3-4 All-Round)",
    level_id: 3,
    level_name: "Advanced",
    volunteer_id: 1,
    volunteer_name: "Priya Sharma",
    schedule_info: "Mon, Thu • 5:30 PM - 6:45 PM",
    description: "Applied arithmetic, word problems, and sentence construction.",
    student_count: 2,
    students: [
      { id: 5, name: "Kabir Das", standard_class: "Class 4", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Kabir" },
      { id: 8, name: "Sneha Gupta", standard_class: "Class 4", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Sneha" }
    ]
  }
];

export const initialTeachingPlans: TeachingPlan[] = [
  {
    id: 1,
    group_id: 2,
    group_name: "Little Innovators (Class 2-3 Arithmetic)",
    volunteer_id: 2,
    volunteer_name: "Rohit Mehta",
    planned_date: "Today",
    subject: "Mathematics",
    topic: "Visual Addition & Regrouping with Counters",
    objective: "Students will comfortably add 2-digit numbers using graphical block counters and real-life fruit scenarios.",
    activities: "1. Icebreaker counting song\n2. Fruit addition game\n3. Interactive worksheet\n4. Drawing number bonds",
    worksheets: "Add With Friendly Apples, Number Line Fun",
    games: "Fruit Basket Addition Match",
    materials: "Beads, plastic tokens, drawing sheets, flashcards",
    notes: "Give Aarav and Ananya 2-digit challenges while guiding Meera on the visual number line."
  },
  {
    id: 2,
    group_id: 1,
    group_name: "Sunshine Explorers (Class 1-2 Math & Literacy)",
    volunteer_id: 1,
    volunteer_name: "Priya Sharma",
    planned_date: "Today",
    subject: "English",
    topic: "Phonics, Animal Sounds & Beginning Letters",
    objective: "Recognize the starting sounds of common animals (Lion, Elephant, Monkey) and write the lowercase letters.",
    activities: "1. Animal sound guessing\n2. Letter flashcards matching\n3. Tracing on tablet canvas\n4. Sing-along rhyme",
    worksheets: "Match Animal to First Letter",
    games: "Sound Bingo",
    materials: "Animal flashcards, colorful chalks, picture books",
    notes: "Priya to assist Vihaan and Rohan with letter stroke tracing."
  },
  {
    id: 3,
    group_id: 3,
    group_name: "Bright Champions (Class 3-4 All-Round)",
    volunteer_id: 1,
    volunteer_name: "Priya Sharma",
    planned_date: "Tomorrow",
    subject: "Mathematics",
    topic: "Multiplication as Repeated Addition",
    objective: "Understand the concept of equal groups: 3 groups of 4 equals 12.",
    activities: "1. Dot array grouping game\n2. Multiplication puzzle\n3. Story problems",
    worksheets: "Fun with Groups of Stars",
    games: "Speed Multiplier Bingo",
    materials: "Grid paper, colored blocks",
    notes: "High energy session scheduled for tomorrow afternoon."
  }
];

export const initialSessions: SessionRecord[] = [
  {
    id: 4,
    group_id: 2,
    group_name: "Little Innovators (Class 2-3 Arithmetic)",
    volunteer_id: 2,
    volunteer_name: "Rohit Mehta",
    session_date: "2026-09-12",
    start_time: "16:00",
    end_time: "17:15",
    subject: "English",
    topic: "Story Time: The Brave Little Squirrel",
    status: "completed",
    general_notes: "Great interaction. Students took turns reading paragraphs out loud.",
    total_students: 3,
    present_count: 3
  },
  {
    id: 3,
    group_id: 1,
    group_name: "Sunshine Explorers (Class 1-2 Math & Literacy)",
    volunteer_id: 1,
    volunteer_name: "Priya Sharma",
    session_date: "2026-09-10",
    start_time: "16:00",
    end_time: "17:15",
    subject: "English",
    topic: "Vowels and Simple 3-Letter Words",
    status: "completed",
    general_notes: "Vihaan was absent. Diya and Rohan practiced vowel sounds.",
    total_students: 3,
    present_count: 2
  },
  {
    id: 2,
    group_id: 2,
    group_name: "Little Innovators (Class 2-3 Arithmetic)",
    volunteer_id: 2,
    volunteer_name: "Rohit Mehta",
    session_date: "2026-09-07",
    start_time: "16:00",
    end_time: "17:15",
    subject: "Mathematics",
    topic: "Addition Basics (Single Digit)",
    status: "completed",
    general_notes: "Introduced bead counters. High engagement from everyone.",
    total_students: 3,
    present_count: 3
  },
  {
    id: 1,
    group_id: 1,
    group_name: "Sunshine Explorers (Class 1-2 Math & Literacy)",
    volunteer_id: 1,
    volunteer_name: "Priya Sharma",
    session_date: "2026-09-04",
    start_time: "16:00",
    end_time: "17:15",
    subject: "Mathematics",
    topic: "Counting 1 to 20 with Beads",
    status: "completed",
    general_notes: "First batch session. Children established group norms smoothly.",
    total_students: 3,
    present_count: 2
  }
];

export const initialResources: EducationalResource[] = [
  {
    id: 1,
    title: "Count the Friendly Animals",
    type: "game",
    subject: "Mathematics",
    target_class: "Class 1-2",
    target_level: "Beginner",
    description: "Interactive counting game where kids click and count apples, stars, and puppies.",
    thumbnail_url: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=300"
  },
  {
    id: 2,
    title: "Animal First Letters Match",
    type: "game",
    subject: "English",
    target_class: "Class 1-2",
    target_level: "Beginner",
    description: "Match each cute creature with its starting alphabet sound.",
    thumbnail_url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300"
  },
  {
    id: 3,
    title: "Creative Freehand & Shapes Canvas",
    type: "drawing",
    subject: "Art",
    target_class: "Class 1-4",
    target_level: "All Levels",
    description: "Child-friendly digital whiteboard with cheerful colors, paintbrushes, and shape stamps.",
    thumbnail_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300"
  },
  {
    id: 4,
    title: "Speed Addition Champions Quiz",
    type: "quiz",
    subject: "Mathematics",
    target_class: "Class 2-3",
    target_level: "Intermediate",
    description: "Fun 5-question visual addition quiz with instant feedback and stars reward.",
    thumbnail_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300"
  },
  {
    id: 5,
    title: "Sight Words Scramble Worksheet",
    type: "worksheet",
    subject: "English",
    target_class: "Class 2-4",
    target_level: "Intermediate",
    description: "Interactive printable worksheet for identifying common words: THE, AND, PLAY, FRIEND.",
    thumbnail_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300"
  }
];

// Helper to get or set storage
export const getLocalData = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const setLocalData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }
};
