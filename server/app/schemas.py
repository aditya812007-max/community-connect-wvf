from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# --- Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class LoginRequest(BaseModel):
    email: str
    password: str

# --- Student ---
class StudentBase(BaseModel):
    name: str
    age: int
    standard_class: str
    avatar_url: Optional[str] = None
    learning_level_id: Optional[int] = None
    group_id: Optional[int] = None
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    notes: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    standard_class: Optional[str] = None
    avatar_url: Optional[str] = None
    learning_level_id: Optional[int] = None
    group_id: Optional[int] = None
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    notes: Optional[str] = None

# --- Volunteer ---
class VolunteerCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    bio: Optional[str] = None

class VolunteerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    status: Optional[str] = None

# --- Groups & Levels ---
class GroupCreate(BaseModel):
    name: str
    level_id: int
    volunteer_id: Optional[int] = None
    description: Optional[str] = None
    schedule_info: Optional[str] = None

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    level_id: Optional[int] = None
    volunteer_id: Optional[int] = None
    description: Optional[str] = None
    schedule_info: Optional[str] = None

# --- Teaching Plans ---
class TeachingPlanCreate(BaseModel):
    group_id: int
    volunteer_id: Optional[int] = None
    planned_date: str
    subject: str
    topic: str
    objective: str
    activities: Optional[str] = None
    worksheets: Optional[str] = None
    games: Optional[str] = None
    materials: Optional[str] = None
    notes: Optional[str] = None

# --- Sessions & Attendance ---
class AttendanceRecord(BaseModel):
    student_id: int
    status: str # present, absent, late
    remarks: Optional[str] = None

class StudentEvaluationRecord(BaseModel):
    student_id: int
    understanding: int = 4
    participation: int = 4
    confidence: int = 4
    observations: Optional[str] = None
    areas_needing_help: Optional[str] = None
    recommended_follow_up: Optional[str] = None

class SkillRatingRecord(BaseModel):
    student_id: int
    subject: str
    skill_name: str
    mastery_level: str

class SessionCreate(BaseModel):
    group_id: int
    volunteer_id: int
    teaching_plan_id: Optional[int] = None
    session_date: str
    start_time: Optional[str] = "16:00"
    end_time: Optional[str] = "17:15"
    subject: str
    topic: str
    general_notes: Optional[str] = None
    attendances: List[AttendanceRecord]
    evaluations: List[StudentEvaluationRecord]
    skill_updates: Optional[List[SkillRatingRecord]] = []

# --- Student Activity Log ---
class ActivityLogCreate(BaseModel):
    student_id: int
    resource_id: Optional[int] = None
    activity_type: str
    activity_title: str
    score: Optional[int] = None
    stars_earned: int = 1
