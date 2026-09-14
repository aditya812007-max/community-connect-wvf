from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DbSession
from typing import List, Optional
from datetime import datetime, timedelta

from .database import get_db, init_db
from .seed import seed_database
from .models import (
    User, UserRole, Volunteer, Student, LearningLevel, LearningGroup,
    TeachingPlan, Session, SessionAttendance, SessionStudentEvaluation,
    StudentSkillAssessment, EducationalResource, StudentBadge, StudentActivityLog,
    Notification, AttendanceStatus, MasteryLevel
)
from .schemas import (
    LoginRequest, Token, StudentCreate, StudentUpdate, VolunteerCreate, VolunteerUpdate,
    GroupCreate, GroupUpdate, TeachingPlanCreate, SessionCreate, ActivityLogCreate
)
from .auth import hash_password, verify_password, create_access_token, decode_access_token

app = FastAPI(
    title="White Volunteers Foundation - Community Connect API",
    description="Backend API powering consistent community teaching, student tracking, and child-friendly educational engagement.",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    seed_database()

# --- Auth Endpoints ---

@app.post("/api/auth/login", response_model=Token)
def login(payload: LoginRequest, db: DbSession = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    volunteer_id = None
    if user.volunteer_profile:
        volunteer_id = user.volunteer_profile.id
    
    student_id = None
    if user.student_profile:
        student_id = user.student_profile.id

    token_data = {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "volunteer_id": volunteer_id,
        "student_id": student_id
    }
    access_token = create_access_token(data=token_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "volunteer_id": volunteer_id,
            "student_id": student_id
        }
    }

# --- Dashboard & Analytics ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: DbSession = Depends(get_db)):
    total_students = db.query(Student).count()
    active_volunteers = db.query(Volunteer).filter(Volunteer.status == "active").count()
    total_groups = db.query(LearningGroup).count()
    sessions_conducted = db.query(Session).filter(Session.status == "completed").count()

    # Calculate overall attendance %
    all_attendances = db.query(SessionAttendance).all()
    present_count = sum(1 for a in all_attendances if a.status in ["present", "late"])
    attendance_pct = round((present_count / len(all_attendances) * 100), 1) if all_attendances else 0.0

    # Identify students needing attention (strictly attendance < 75% or missed multiple sessions)
    students_needing_attention = []
    students = db.query(Student).all()
    for s in students:
        s_att = db.query(SessionAttendance).filter(SessionAttendance.student_id == s.id).all()
        s_pres = sum(1 for a in s_att if a.status in ["present", "late"])
        pct = round((s_pres / len(s_att) * 100), 1) if s_att else 100.0
        if s_att and (pct < 75.0 or (len(s_att) >= 2 and (len(s_att) - s_pres) >= 1)):
            students_needing_attention.append({
                "id": s.id,
                "name": s.name,
                "standard_class": s.standard_class,
                "group_name": s.group.name if s.group else "Unassigned",
                "attendance_pct": pct,
                "sessions_attended": s_pres,
                "sessions_total": len(s_att),
                "reason": f"Low attendance: attended {s_pres} of last {len(s_att)} sessions."
            })

    # Learning level distribution
    levels = db.query(LearningLevel).all()
    level_distribution = []
    for lvl in levels:
        count = db.query(Student).filter(Student.learning_level_id == lvl.id).count()
        level_distribution.append({
            "name": lvl.name,
            "count": count
        })

    # Recent session history
    recent_sessions = db.query(Session).order_by(Session.session_date.desc()).limit(5).all()
    sessions_data = []
    for sess in recent_sessions:
        sessions_data.append({
            "id": sess.id,
            "date": sess.session_date,
            "group_name": sess.group.name if sess.group else "N/A",
            "volunteer_name": sess.volunteer.user.full_name if sess.volunteer and sess.volunteer.user else "N/A",
            "subject": sess.subject,
            "topic": sess.topic,
            "attendance_count": len(sess.attendances)
        })

    return {
        "kpis": {
            "total_students": total_students,
            "active_volunteers": active_volunteers,
            "total_groups": total_groups,
            "sessions_conducted": sessions_conducted,
            "attendance_rate": attendance_pct,
            "at_risk_students_count": len(students_needing_attention)
        },
        "level_distribution": level_distribution,
        "students_needing_attention": students_needing_attention,
        "recent_sessions": sessions_data
    }

# --- Student Management ---

@app.get("/api/students")
def list_students(group_id: Optional[int] = None, level_id: Optional[int] = None, db: DbSession = Depends(get_db)):
    query = db.query(Student)
    if group_id:
        query = query.filter(Student.group_id == group_id)
    if level_id:
        query = query.filter(Student.learning_level_id == level_id)
    
    students = query.all()
    results = []
    for s in students:
        s_att = db.query(SessionAttendance).filter(SessionAttendance.student_id == s.id).all()
        s_pres = sum(1 for a in s_att if a.status in ["present", "late"])
        pct = round((s_pres / len(s_att) * 100), 1) if s_att else 100.0

        results.append({
            "id": s.id,
            "name": s.name,
            "age": s.age,
            "standard_class": s.standard_class,
            "avatar_url": s.avatar_url,
            "learning_level_id": s.learning_level_id,
            "learning_level_name": s.learning_level.name if s.learning_level else "Unassigned",
            "group_id": s.group_id,
            "group_name": s.group.name if s.group else "Unassigned",
            "strengths": s.strengths,
            "areas_for_improvement": s.areas_for_improvement,
            "stars_count": s.stars_count,
            "attendance_pct": pct,
            "sessions_attended": s_pres,
            "total_sessions": len(s_att),
            "joined_date": s.joined_date.strftime("%Y-%m-%d") if s.joined_date else None
        })
    return results

@app.post("/api/students")
def create_student(payload: StudentCreate, db: DbSession = Depends(get_db)):
    student = Student(
        name=payload.name,
        age=payload.age,
        standard_class=payload.standard_class,
        avatar_url=payload.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={payload.name.replace(' ', '')}",
        learning_level_id=payload.learning_level_id,
        group_id=payload.group_id,
        strengths=payload.strengths,
        areas_for_improvement=payload.areas_for_improvement,
        notes=payload.notes,
        stars_count=10
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # Initialize default skills
    skills_defaults = [
        ("Mathematics", "Counting (1-50)"),
        ("Mathematics", "Addition (1-2 Digits)"),
        ("Mathematics", "Subtraction (Basic)"),
        ("English", "Alphabet & Phonics"),
        ("English", "Sight Words"),
        ("English", "Simple Sentences")
    ]
    for subj, sk in skills_defaults:
        db.add(StudentSkillAssessment(
            student_id=student.id,
            subject=subj,
            skill_name=sk,
            mastery_level=MasteryLevel.DEVELOPING.value
        ))
    db.commit()
    return student

@app.get("/api/students/{student_id}")
def get_student_detail(student_id: int, db: DbSession = Depends(get_db)):
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")

    # Attendance stats & history
    attendances = db.query(SessionAttendance).filter(SessionAttendance.student_id == s.id).all()
    attended_count = sum(1 for a in attendances if a.status in ["present", "late"])
    attendance_pct = round((attended_count / len(attendances) * 100), 1) if attendances else 100.0

    att_history = []
    for a in sorted(attendances, key=lambda x: x.session.session_date if x.session else "", reverse=True):
        att_history.append({
            "session_id": a.session_id,
            "date": a.session.session_date if a.session else "N/A",
            "subject": a.session.subject if a.session else "N/A",
            "topic": a.session.topic if a.session else "N/A",
            "status": a.status,
            "remarks": a.remarks
        })

    # Learning history from evaluations
    evals = db.query(SessionStudentEvaluation).filter(SessionStudentEvaluation.student_id == s.id).all()
    learning_history = []
    for e in sorted(evals, key=lambda x: x.session.session_date if x.session else "", reverse=True):
        learning_history.append({
            "date": e.session.session_date if e.session else "N/A",
            "volunteer_name": e.session.volunteer.user.full_name if e.session and e.session.volunteer and e.session.volunteer.user else "Volunteer",
            "subject": e.session.subject if e.session else "N/A",
            "topic": e.session.topic if e.session else "N/A",
            "understanding": e.understanding,
            "participation": e.participation,
            "confidence": e.confidence,
            "observations": e.observations,
            "areas_needing_help": e.areas_needing_help,
            "recommended_follow_up": e.recommended_follow_up
        })

    # Skills progress
    skills = db.query(StudentSkillAssessment).filter(StudentSkillAssessment.student_id == s.id).all()
    skills_data = [
        {
            "id": sk.id,
            "subject": sk.subject,
            "skill_name": sk.skill_name,
            "mastery_level": sk.mastery_level
        } for sk in skills
    ]

    # Badges
    badges = db.query(StudentBadge).filter(StudentBadge.student_id == s.id).all()
    badges_data = [
        {
            "id": b.id,
            "badge_name": b.badge_name,
            "category": b.category,
            "icon": b.icon,
            "reason": b.reason,
            "awarded_at": b.awarded_at.strftime("%Y-%m-%d")
        } for b in badges
    ]

    return {
        "id": s.id,
        "name": s.name,
        "age": s.age,
        "standard_class": s.standard_class,
        "avatar_url": s.avatar_url,
        "learning_level_id": s.learning_level_id,
        "learning_level_name": s.learning_level.name if s.learning_level else "Unassigned",
        "group_id": s.group_id,
        "group_name": s.group.name if s.group else "Unassigned",
        "strengths": s.strengths,
        "areas_for_improvement": s.areas_for_improvement,
        "notes": s.notes,
        "stars_count": s.stars_count,
        "attendance": {
            "percentage": attendance_pct,
            "attended": attended_count,
            "missed": len(attendances) - attended_count,
            "total": len(attendances),
            "history": att_history
        },
        "learning_history": learning_history,
        "skills": skills_data,
        "badges": badges_data
    }

@app.put("/api/students/{student_id}")
def update_student(student_id: int, payload: StudentUpdate, db: DbSession = Depends(get_db)):
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = payload.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(s, k, v)
    
    db.commit()
    db.refresh(s)
    return {"message": "Student updated successfully", "student": s}

# --- Groups & Levels ---

@app.get("/api/levels")
def list_levels(db: DbSession = Depends(get_db)):
    return db.query(LearningLevel).order_by(LearningLevel.order_index).all()

@app.get("/api/groups")
def list_groups(db: DbSession = Depends(get_db)):
    groups = db.query(LearningGroup).all()
    results = []
    for g in groups:
        students = db.query(Student).filter(Student.group_id == g.id).all()
        results.append({
            "id": g.id,
            "name": g.name,
            "level_id": g.level_id,
            "level_name": g.level.name if g.level else "Unassigned",
            "volunteer_id": g.volunteer_id,
            "volunteer_name": g.volunteer.user.full_name if g.volunteer and g.volunteer.user else "Unassigned",
            "schedule_info": g.schedule_info,
            "description": g.description,
            "student_count": len(students),
            "students": [{"id": st.id, "name": st.name, "standard_class": st.standard_class, "avatar_url": st.avatar_url} for st in students]
        })
    return results

@app.post("/api/groups")
def create_group(payload: GroupCreate, db: DbSession = Depends(get_db)):
    grp = LearningGroup(
        name=payload.name,
        level_id=payload.level_id,
        volunteer_id=payload.volunteer_id,
        description=payload.description,
        schedule_info=payload.schedule_info
    )
    db.add(grp)
    db.commit()
    db.refresh(grp)
    return grp

@app.put("/api/groups/{group_id}")
def update_group(group_id: int, payload: GroupUpdate, db: DbSession = Depends(get_db)):
    grp = db.query(LearningGroup).filter(LearningGroup.id == group_id).first()
    if not grp:
        raise HTTPException(status_code=404, detail="Group not found")
    
    update_data = payload.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(grp, k, v)
    
    db.commit()
    return {"message": "Group updated", "group": grp}

# --- Volunteers ---

@app.get("/api/volunteers")
def list_volunteers(db: DbSession = Depends(get_db)):
    volunteers = db.query(Volunteer).all()
    results = []
    for v in volunteers:
        groups = db.query(LearningGroup).filter(LearningGroup.volunteer_id == v.id).all()
        sessions = db.query(Session).filter(Session.volunteer_id == v.id).count()
        results.append({
            "id": v.id,
            "user_id": v.user_id,
            "full_name": v.user.full_name if v.user else "Volunteer",
            "email": v.user.email if v.user else "N/A",
            "avatar_url": v.user.avatar_url if v.user else None,
            "phone": v.phone,
            "bio": v.bio,
            "status": v.status,
            "assigned_groups": [{"id": g.id, "name": g.name} for g in groups],
            "sessions_count": sessions
        })
    return results

# --- Teaching Plans ---

@app.get("/api/teaching-plans")
def list_teaching_plans(volunteer_id: Optional[int] = None, group_id: Optional[int] = None, db: DbSession = Depends(get_db)):
    query = db.query(TeachingPlan)
    if volunteer_id:
        query = query.filter(TeachingPlan.volunteer_id == volunteer_id)
    if group_id:
        query = query.filter(TeachingPlan.group_id == group_id)
    
    plans = query.order_by(TeachingPlan.planned_date.desc()).all()
    results = []
    for p in plans:
        results.append({
            "id": p.id,
            "group_id": p.group_id,
            "group_name": p.group.name if p.group else "Group",
            "volunteer_id": p.volunteer_id,
            "volunteer_name": p.volunteer.user.full_name if p.volunteer and p.volunteer.user else "Unassigned",
            "planned_date": p.planned_date,
            "subject": p.subject,
            "topic": p.topic,
            "objective": p.objective,
            "activities": p.activities,
            "worksheets": p.worksheets,
            "games": p.games,
            "materials": p.materials,
            "notes": p.notes
        })
    return results

@app.post("/api/teaching-plans")
def create_teaching_plan(payload: TeachingPlanCreate, db: DbSession = Depends(get_db)):
    plan = TeachingPlan(
        group_id=payload.group_id,
        volunteer_id=payload.volunteer_id,
        planned_date=payload.planned_date,
        subject=payload.subject,
        topic=payload.topic,
        objective=payload.objective,
        activities=payload.activities,
        worksheets=payload.worksheets,
        games=payload.games,
        materials=payload.materials,
        notes=payload.notes
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

# --- Sessions & Complete Workflow ---

@app.get("/api/sessions")
def list_sessions(volunteer_id: Optional[int] = None, db: DbSession = Depends(get_db)):
    query = db.query(Session)
    if volunteer_id:
        query = query.filter(Session.volunteer_id == volunteer_id)
    
    sessions = query.order_by(Session.session_date.desc()).all()
    results = []
    for sess in sessions:
        present_c = sum(1 for a in sess.attendances if a.status in ["present", "late"])
        results.append({
            "id": sess.id,
            "group_id": sess.group_id,
            "group_name": sess.group.name if sess.group else "N/A",
            "volunteer_id": sess.volunteer_id,
            "volunteer_name": sess.volunteer.user.full_name if sess.volunteer and sess.volunteer.user else "N/A",
            "session_date": sess.session_date,
            "start_time": sess.start_time,
            "end_time": sess.end_time,
            "subject": sess.subject,
            "topic": sess.topic,
            "status": sess.status,
            "general_notes": sess.general_notes,
            "total_students": len(sess.attendances),
            "present_count": present_c
        })
    return results

@app.post("/api/sessions")
def conduct_and_complete_session(payload: SessionCreate, db: DbSession = Depends(get_db)):
    # 1. Create Session
    session = Session(
        group_id=payload.group_id,
        volunteer_id=payload.volunteer_id,
        teaching_plan_id=payload.teaching_plan_id,
        session_date=payload.session_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        subject=payload.subject,
        topic=payload.topic,
        status="completed",
        general_notes=payload.general_notes
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # 2. Record Attendance
    for att in payload.attendances:
        db.add(SessionAttendance(
            session_id=session.id,
            student_id=att.student_id,
            status=att.status,
            remarks=att.remarks
        ))
    
    # 3. Record Evaluations & update stars
    for ev in payload.evaluations:
        db.add(SessionStudentEvaluation(
            session_id=session.id,
            student_id=ev.student_id,
            understanding=ev.understanding,
            participation=ev.participation,
            confidence=ev.confidence,
            observations=ev.observations,
            areas_needing_help=ev.areas_needing_help,
            recommended_follow_up=ev.recommended_follow_up
        ))

        # Award stars for participating
        st = db.query(Student).filter(Student.id == ev.student_id).first()
        if st:
            st.stars_count = (st.stars_count or 0) + 3

    # 4. Update Skills if provided
    if payload.skill_updates:
        for sk in payload.skill_updates:
            existing = db.query(StudentSkillAssessment).filter(
                StudentSkillAssessment.student_id == sk.student_id,
                StudentSkillAssessment.skill_name == sk.skill_name
            ).first()
            if existing:
                existing.mastery_level = sk.mastery_level
                existing.updated_at = datetime.utcnow()
            else:
                db.add(StudentSkillAssessment(
                    student_id=sk.student_id,
                    subject=sk.subject,
                    skill_name=sk.skill_name,
                    mastery_level=sk.mastery_level
                ))

    db.commit()
    return {"message": "Session recorded successfully", "session_id": session.id}

# --- Educational Resources ---

@app.get("/api/resources")
def list_resources(res_type: Optional[str] = None, subject: Optional[str] = None, db: DbSession = Depends(get_db)):
    query = db.query(EducationalResource)
    if res_type:
        query = query.filter(EducationalResource.type == res_type)
    if subject:
        query = query.filter(EducationalResource.subject == subject)
    return query.all()

# --- Student Portal & Gamification ---

@app.get("/api/student-portal/{student_id}")
def get_student_portal_profile(student_id: int, db: DbSession = Depends(get_db)):
    st = db.query(Student).filter(Student.id == student_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")

    badges = db.query(StudentBadge).filter(StudentBadge.student_id == st.id).all()
    activity_logs = db.query(StudentActivityLog).filter(StudentActivityLog.student_id == st.id).order_by(StudentActivityLog.completed_at.desc()).limit(10).all()

    return {
        "id": st.id,
        "name": st.name,
        "standard_class": st.standard_class,
        "avatar_url": st.avatar_url,
        "stars_count": st.stars_count,
        "badges": [
            {
                "id": b.id,
                "name": b.badge_name,
                "category": b.category,
                "icon": b.icon,
                "reason": b.reason
            } for b in badges
        ],
        "recent_activities": [
            {
                "title": a.activity_title,
                "type": a.activity_type,
                "stars_earned": a.stars_earned,
                "completed_at": a.completed_at.strftime("%b %d")
            } for a in activity_logs
        ]
    }

@app.post("/api/student-portal/log-activity")
def log_student_activity(payload: ActivityLogCreate, db: DbSession = Depends(get_db)):
    log = StudentActivityLog(
        student_id=payload.student_id,
        resource_id=payload.resource_id,
        activity_type=payload.activity_type,
        activity_title=payload.activity_title,
        score=payload.score,
        stars_earned=payload.stars_earned
    )
    db.add(log)

    # Increment student stars
    st = db.query(Student).filter(Student.id == payload.student_id).first()
    if st:
        st.stars_count = (st.stars_count or 0) + payload.stars_earned
        # Award badge milestone if reached
        if st.stars_count >= 50:
            has_badge = db.query(StudentBadge).filter(
                StudentBadge.student_id == st.id,
                StudentBadge.badge_name == "Super Star 50"
            ).first()
            if not has_badge:
                db.add(StudentBadge(
                    student_id=st.id,
                    badge_name="Super Star 50",
                    category="streak",
                    icon="Trophy",
                    reason="Collected over 50 shining learning stars!"
                ))

    db.commit()
    return {"message": "Activity logged and stars awarded!", "total_stars": st.stars_count if st else 0}

# --- Notifications ---

@app.get("/api/notifications")
def get_notifications(role: Optional[str] = None, db: DbSession = Depends(get_db)):
    query = db.query(Notification)
    if role:
        query = query.filter((Notification.recipient_role == role) | (Notification.recipient_role == "all"))
    return query.order_by(Notification.created_at.desc()).all()

# --- Future-Ready AI Endpoints ---

@app.get("/api/ai/recommend-level/{student_id}")
def recommend_level(student_id: int, db: DbSession = Depends(get_db)):
    st = db.query(Student).filter(Student.id == student_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")

    # Evaluate skills mastery
    skills = db.query(StudentSkillAssessment).filter(StudentSkillAssessment.student_id == st.id).all()
    mastered_count = sum(1 for s in skills if s.mastery_level == MasteryLevel.MASTERED.value)
    good_count = sum(1 for s in skills if s.mastery_level == MasteryLevel.GOOD.value)
    needs_support_count = sum(1 for s in skills if s.mastery_level == MasteryLevel.NEEDS_SUPPORT.value)

    if mastered_count >= 4 and needs_support_count == 0:
        rec_level = "Advanced"
        rationale = f"{st.name} shows high confidence across foundational arithmetic and reading comprehension. Ready for advanced multi-step problem solving."
    elif mastered_count + good_count >= 3:
        rec_level = "Intermediate"
        rationale = f"{st.name} is comfortable with basic counting and phonics, but requires continued practice with 2-digit operations and simple sentences."
    else:
        rec_level = "Beginner"
        rationale = f"{st.name} benefits strongly from foundational visual counters, phonics games, and 1-on-1 tracing support."

    return {
        "student_id": st.id,
        "current_level": st.learning_level.name if st.learning_level else "None",
        "recommended_level": rec_level,
        "rationale": rationale,
        "confidence_score": 0.92
    }

@app.get("/api/ai/recommend-activities/{student_id}")
def recommend_activities(student_id: int, db: DbSession = Depends(get_db)):
    st = db.query(Student).filter(Student.id == student_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")

    weak_skills = db.query(StudentSkillAssessment).filter(
        StudentSkillAssessment.student_id == st.id,
        StudentSkillAssessment.mastery_level.in_([MasteryLevel.NEEDS_SUPPORT.value, MasteryLevel.DEVELOPING.value])
    ).all()

    recommendations = []
    for ws in weak_skills[:3]:
        recommendations.append({
            "target_skill": ws.skill_name,
            "subject": ws.subject,
            "suggested_activity": f"Tactile and visual drills for {ws.skill_name}",
            "activity_type": "game" if ws.subject == "Mathematics" else "worksheet",
            "reason": f"Student flagged with '{ws.mastery_level}' status during recent sessions."
        })

    return {
        "student_id": st.id,
        "student_name": st.name,
        "recommendations": recommendations
    }
