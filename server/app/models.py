import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    VOLUNTEER = "volunteer"
    STUDENT = "student"

class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"

class MasteryLevel(str, enum.Enum):
    NEEDS_SUPPORT = "Needs Support"
    DEVELOPING = "Developing"
    GOOD = "Good"
    MASTERED = "Mastered"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.VOLUNTEER.value, nullable=False)
    full_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    volunteer_profile = relationship("Volunteer", back_populates="user", uselist=False)
    student_profile = relationship("Student", back_populates="user", uselist=False)

class LearningLevel(Base):
    __tablename__ = "learning_levels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=1)

    students = relationship("Student", back_populates="learning_level")
    groups = relationship("LearningGroup", back_populates="level")

class LearningGroup(Base):
    __tablename__ = "learning_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    level_id = Column(Integer, ForeignKey("learning_levels.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=True)
    description = Column(Text, nullable=True)
    schedule_info = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    level = relationship("LearningLevel", back_populates="groups")
    volunteer = relationship("Volunteer", back_populates="groups")
    students = relationship("Student", back_populates="group")
    sessions = relationship("Session", back_populates="group")
    teaching_plans = relationship("TeachingPlan", back_populates="group")

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    phone = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    status = Column(String, default="active")
    joined_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="volunteer_profile")
    groups = relationship("LearningGroup", back_populates="volunteer")
    sessions = relationship("Session", back_populates="volunteer")
    teaching_plans = relationship("TeachingPlan", back_populates="volunteer")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    standard_class = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    learning_level_id = Column(Integer, ForeignKey("learning_levels.id"), nullable=True)
    group_id = Column(Integer, ForeignKey("learning_groups.id"), nullable=True)
    strengths = Column(Text, nullable=True)
    areas_for_improvement = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    joined_date = Column(DateTime, default=datetime.utcnow)
    stars_count = Column(Integer, default=15)

    user = relationship("User", back_populates="student_profile")
    learning_level = relationship("LearningLevel", back_populates="students")
    group = relationship("LearningGroup", back_populates="students")
    attendances = relationship("SessionAttendance", back_populates="student")
    evaluations = relationship("SessionStudentEvaluation", back_populates="student")
    skills = relationship("StudentSkillAssessment", back_populates="student")
    badges = relationship("StudentBadge", back_populates="student")
    activity_logs = relationship("StudentActivityLog", back_populates="student")

class TeachingPlan(Base):
    __tablename__ = "teaching_plans"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("learning_groups.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=True)
    planned_date = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    objective = Column(Text, nullable=False)
    activities = Column(Text, nullable=True)
    worksheets = Column(Text, nullable=True)
    games = Column(Text, nullable=True)
    materials = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("LearningGroup", back_populates="teaching_plans")
    volunteer = relationship("Volunteer", back_populates="teaching_plans")
    sessions = relationship("Session", back_populates="teaching_plan")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("learning_groups.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=False)
    teaching_plan_id = Column(Integer, ForeignKey("teaching_plans.id"), nullable=True)
    session_date = Column(String, nullable=False)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    status = Column(String, default="completed")
    general_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("LearningGroup", back_populates="sessions")
    volunteer = relationship("Volunteer", back_populates="sessions")
    teaching_plan = relationship("TeachingPlan", back_populates="sessions")
    attendances = relationship("SessionAttendance", back_populates="session", cascade="all, delete-orphan")
    evaluations = relationship("SessionStudentEvaluation", back_populates="session", cascade="all, delete-orphan")

class SessionAttendance(Base):
    __tablename__ = "session_attendances"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    status = Column(String, default=AttendanceStatus.PRESENT.value, nullable=False)
    remarks = Column(String, nullable=True)

    session = relationship("Session", back_populates="attendances")
    student = relationship("Student", back_populates="attendances")

class SessionStudentEvaluation(Base):
    __tablename__ = "session_student_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    understanding = Column(Integer, default=4)
    participation = Column(Integer, default=4)
    confidence = Column(Integer, default=4)
    observations = Column(Text, nullable=True)
    areas_needing_help = Column(Text, nullable=True)
    recommended_follow_up = Column(Text, nullable=True)

    session = relationship("Session", back_populates="evaluations")
    student = relationship("Student", back_populates="evaluations")

class StudentSkillAssessment(Base):
    __tablename__ = "student_skill_assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject = Column(String, nullable=False)
    skill_name = Column(String, nullable=False)
    mastery_level = Column(String, default=MasteryLevel.DEVELOPING.value)
    updated_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="skills")

class EducationalResource(Base):
    __tablename__ = "educational_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    target_class = Column(String, nullable=True)
    target_level = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    content_data = Column(Text, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class StudentBadge(Base):
    __tablename__ = "student_badges"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    badge_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    reason = Column(String, nullable=True)
    awarded_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="badges")

class StudentActivityLog(Base):
    __tablename__ = "student_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("educational_resources.id"), nullable=True)
    activity_type = Column(String, nullable=False)
    activity_title = Column(String, nullable=False)
    score = Column(Integer, nullable=True)
    stars_earned = Column(Integer, default=1)
    completed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="activity_logs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_role = Column(String, nullable=True)
    recipient_user_id = Column(Integer, nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
