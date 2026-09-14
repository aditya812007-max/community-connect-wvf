import json
from datetime import datetime, timedelta
from .database import SessionLocal, init_db
from .models import (
    User, UserRole, LearningLevel, LearningGroup, Volunteer, Student,
    TeachingPlan, Session, SessionAttendance, SessionStudentEvaluation,
    StudentSkillAssessment, EducationalResource, StudentBadge, StudentActivityLog,
    Notification, AttendanceStatus, MasteryLevel
)
from .auth import hash_password

def seed_database():
    init_db()
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        db.close()
        return

    print("Seeding initial data for White Volunteers Foundation Community Connect...")

    # 1. Users
    admin_user = User(
        email="admin@whitevolunteers.org",
        hashed_password=hash_password("admin123"),
        role=UserRole.ADMIN.value,
        full_name="Aakash Verma (Director, WVF)",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    )
    db.add(admin_user)

    vol_user_1 = User(
        email="priya.sharma@whitevolunteers.org",
        hashed_password=hash_password("vol123"),
        role=UserRole.VOLUNTEER.value,
        full_name="Priya Sharma",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    )
    db.add(vol_user_1)

    vol_user_2 = User(
        email="rohit.mehta@whitevolunteers.org",
        hashed_password=hash_password("vol123"),
        role=UserRole.VOLUNTEER.value,
        full_name="Rohit Mehta",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    )
    db.add(vol_user_2)

    student_user_1 = User(
        email="aarav.kumar@student.local",
        hashed_password=hash_password("student123"),
        role=UserRole.STUDENT.value,
        full_name="Aarav Kumar",
        avatar_url="https://api.dicebear.com/7.x/bottts/svg?seed=Aarav"
    )
    db.add(student_user_1)

    db.commit()

    # 2. Volunteers Profile
    vol_1 = Volunteer(
        user_id=vol_user_1.id,
        phone="+91 98765 43210",
        bio="Educator and passionate early childhood volunteer with WVF since 2024.",
        status="active"
    )
    vol_2 = Volunteer(
        user_id=vol_user_2.id,
        phone="+91 98123 45678",
        bio="Mathematics tutor focusing on activity-based learning in community centers.",
        status="active"
    )
    db.add_all([vol_1, vol_2])
    db.commit()

    # 3. Learning Levels
    level_beg = LearningLevel(
        name="Beginner",
        description="Foundation concepts: single-digit counting, alphabet recognition, phonics, basic motor tracing.",
        order_index=1
    )
    level_int = LearningLevel(
        name="Intermediate",
        description="Developing fluency: 2-digit numbers, addition & subtraction, simple sentences, sight words.",
        order_index=2
    )
    level_adv = LearningLevel(
        name="Advanced",
        description="Confident readers & problem solvers: multiplication basics, paragraph comprehension, creative drawing.",
        order_index=3
    )
    db.add_all([level_beg, level_int, level_adv])
    db.commit()

    # 4. Learning Groups
    grp_sunshine = LearningGroup(
        name="Sunshine Explorers (Class 1-2 Math & Literacy)",
        level_id=level_beg.id,
        volunteer_id=vol_1.id,
        schedule_info="Mon, Wed, Fri • 4:00 PM - 5:15 PM",
        description="Early math and English readiness through flashcards and tactile games."
    )
    grp_innovators = LearningGroup(
        name="Little Innovators (Class 2-3 Arithmetic)",
        level_id=level_int.id,
        volunteer_id=vol_2.id,
        schedule_info="Tue, Thu, Sat • 4:30 PM - 5:45 PM",
        description="Addition, subtraction mastery, and reading short storybooks."
    )
    grp_champions = LearningGroup(
        name="Bright Champions (Class 3-4 All-Round)",
        level_id=level_adv.id,
        volunteer_id=vol_1.id,
        schedule_info="Mon, Thu • 5:30 PM - 6:45 PM",
        description="Applied arithmetic, word problems, and sentence construction."
    )
    db.add_all([grp_sunshine, grp_innovators, grp_champions])
    db.commit()

    # 5. Students
    students_data = [
        {"name": "Aarav Kumar", "age": 7, "class": "Class 2", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav", "level": level_int.id, "grp": grp_innovators.id, "user_id": student_user_1.id, "str": "Quick with mental addition, very active in games", "weak": "Struggles with 2-digit subtraction with borrow", "notes": "Attentive when visual objects/counters are used.", "stars": 38},
        {"name": "Diya Patel", "age": 6, "class": "Class 1", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Diya", "level": level_beg.id, "grp": grp_sunshine.id, "user_id": None, "str": "Loves drawing, good alphabet recall", "weak": "Needs help counting above 20", "notes": "Very cooperative and eager to participate.", "stars": 24},
        {"name": "Vihaan Singh", "age": 7, "class": "Class 2", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Vihaan", "level": level_beg.id, "grp": grp_sunshine.id, "user_id": None, "str": "High energy, great spoken English", "weak": "Frequent absences, needs consistent reinforcement", "notes": "Missed 3 of last 6 sessions due to seasonal illness.", "stars": 14},
        {"name": "Ananya Sharma", "age": 8, "class": "Class 3", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Ananya", "level": level_int.id, "grp": grp_innovators.id, "user_id": None, "str": "Confident reader, strong vocabulary", "weak": "Multiplication tables (needs visual arrays)", "notes": "Helps peer students patiently.", "stars": 42},
        {"name": "Kabir Das", "age": 9, "class": "Class 4", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Kabir", "level": level_adv.id, "grp": grp_champions.id, "user_id": None, "str": "Logical reasoning, quick math quiz solver", "weak": "English sentence grammar and punctuation", "notes": "Ready for advanced multi-step arithmetic.", "stars": 55},
        {"name": "Meera Rao", "age": 8, "class": "Class 3", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Meera", "level": level_int.id, "grp": grp_innovators.id, "user_id": None, "str": "Creative writing, wonderful sketch artist", "weak": "Number line visualization", "notes": "Thrives on gamified rewards.", "stars": 31},
        {"name": "Rohan Joshi", "age": 6, "class": "Class 1", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Rohan", "level": level_beg.id, "grp": grp_sunshine.id, "user_id": None, "str": "Phonics sounds, cheerful demeanor", "weak": "Pencil grip and writing numbers", "notes": "Benefits from finger-tracing activities.", "stars": 19},
        {"name": "Sneha Gupta", "age": 9, "class": "Class 4", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Sneha", "level": level_adv.id, "grp": grp_champions.id, "user_id": None, "str": "Excellent problem solver, consistent attendance", "weak": "Self-confidence when speaking aloud", "notes": "Encourage her to explain solutions to the class.", "stars": 60},
    ]

    created_students = []
    for s in students_data:
        st = Student(
            user_id=s["user_id"],
            name=s["name"],
            age=s["age"],
            standard_class=s["class"],
            avatar_url=s["avatar"],
            learning_level_id=s["level"],
            group_id=s["grp"],
            strengths=s["str"],
            areas_for_improvement=s["weak"],
            notes=s["notes"],
            stars_count=s["stars"],
            joined_date=datetime.utcnow() - timedelta(days=60)
        )
        db.add(st)
        created_students.append(st)
    db.commit()

    # 6. Skill Assessments
    skills_catalog = [
        ("Mathematics", "Counting (1-50)"),
        ("Mathematics", "Addition (1-2 Digits)"),
        ("Mathematics", "Subtraction (Basic)"),
        ("Mathematics", "Multiplication Tables"),
        ("English", "Alphabet & Phonics"),
        ("English", "Sight Words"),
        ("English", "Simple Sentences"),
        ("English", "Reading Comprehension")
    ]
    for st in created_students:
        for subj, sk in skills_catalog:
            # Set realistic default mastery
            if st.learning_level_id == level_beg.id:
                m = MasteryLevel.GOOD.value if "Counting" in sk or "Alphabet" in sk else MasteryLevel.DEVELOPING.value if "Addition" in sk or "Sight Words" in sk else MasteryLevel.NEEDS_SUPPORT.value
            elif st.learning_level_id == level_int.id:
                m = MasteryLevel.MASTERED.value if "Counting" in sk or "Alphabet" in sk else MasteryLevel.GOOD.value if "Addition" in sk or "Words" in sk else MasteryLevel.DEVELOPING.value
            else:
                m = MasteryLevel.MASTERED.value if "Counting" in sk or "Alphabet" in sk or "Addition" in sk else MasteryLevel.GOOD.value
            
            db.add(StudentSkillAssessment(
                student_id=st.id,
                subject=subj,
                skill_name=sk,
                mastery_level=m
            ))
    db.commit()

    # 7. Badges
    badges_data = [
        ("First Session", "participation", "Award", "Completed first interactive learning session!"),
        ("Math Explorer", "math", "Compass", "Solved 10 visual counting challenges."),
        ("Super Artist", "art", "Palette", "Created an imaginative drawing on the canvas."),
        ("Word Wizard", "english", "BookOpen", "Mastered 20 everyday sight words."),
        ("Consistency Star", "streak", "Zap", "Maintained 3 consecutive sessions on time.")
    ]
    for i, st in enumerate(created_students):
        for j in range((i % 3) + 2):
            b_name, b_cat, b_icon, b_reason = badges_data[j]
            db.add(StudentBadge(
                student_id=st.id,
                badge_name=b_name,
                category=b_cat,
                icon=b_icon,
                reason=b_reason
            ))
    db.commit()

    # 8. Teaching Plans
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    tomorrow_str = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")

    plan1 = TeachingPlan(
        group_id=grp_innovators.id,
        volunteer_id=vol_2.id,
        planned_date=today_str,
        subject="Mathematics",
        topic="Visual Addition & Regrouping with Counters",
        objective="Students will comfortably add 2-digit numbers using graphical block counters and real-life fruit scenarios.",
        activities="1. Icebreaker counting song\n2. Fruit addition game\n3. Interactive worksheet\n4. Drawing number bonds",
        worksheets="Add With Friendly Apples, Number Line Fun",
        games="Fruit Basket Addition Match",
        materials="Beads, plastic tokens, drawing sheets, flashcards",
        notes="Give Aarav and Ananya 2-digit challenges while guiding Meera on the visual number line."
    )
    plan2 = TeachingPlan(
        group_id=grp_sunshine.id,
        volunteer_id=vol_1.id,
        planned_date=today_str,
        subject="English",
        topic="Phonics, Animal Sounds & Beginning Letters",
        objective="Recognize the starting sounds of common animals (Lion, Elephant, Monkey) and write the lowercase letters.",
        activities="1. Animal sound guessing\n2. Letter flashcards matching\n3. Tracing on tablet canvas\n4. Sing-along rhyme",
        worksheets="Match Animal to First Letter",
        games="Sound Bingo",
        materials="Animal flashcards, colorful chalks, picture books",
        notes="Priya to assist Vihaan and Rohan with letter stroke tracing."
    )
    plan3 = TeachingPlan(
        group_id=grp_champions.id,
        volunteer_id=vol_1.id,
        planned_date=tomorrow_str,
        subject="Mathematics",
        topic="Multiplication as Repeated Addition",
        objective="Understand the concept of equal groups: 3 groups of 4 equals 12.",
        activities="1. Dot array grouping game\n2. Multiplication puzzle\n3. Story problems",
        worksheets="Fun with Groups of Stars",
        games="Speed Multiplier Bingo",
        materials="Grid paper, colored blocks",
        notes="High energy session scheduled for tomorrow afternoon."
    )
    db.add_all([plan1, plan2, plan3])
    db.commit()

    # 9. Past Sessions & Attendance History
    # Seed 4 historical sessions across past 2 weeks
    for idx, (days_ago, grp, vol, subj, topic) in enumerate([
        (10, grp_sunshine, vol_1, "Mathematics", "Counting 1 to 20 with Beads"),
        (7, grp_innovators, vol_2, "Mathematics", "Addition Basics (Single Digit)"),
        (4, grp_sunshine, vol_1, "English", "Vowels and Simple 3-Letter Words"),
        (2, grp_innovators, vol_2, "English", "Story Time: The Brave Little Squirrel")
    ]):
        sess_date = (datetime.utcnow() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        sess = Session(
            group_id=grp.id,
            volunteer_id=vol.id,
            session_date=sess_date,
            start_time="16:00",
            end_time="17:15",
            subject=subj,
            topic=topic,
            status="completed",
            general_notes=f"Great participation. Students actively engaged in peer activities."
        )
        db.add(sess)
        db.commit()

        # Add attendances & evaluations for students in this group
        group_students = db.query(Student).filter(Student.group_id == grp.id).all()
        for s_idx, st in enumerate(group_students):
            # simulate 1 absent for Vihaan
            is_absent = (st.name == "Vihaan Singh" and days_ago in [10, 4])
            status = AttendanceStatus.ABSENT.value if is_absent else AttendanceStatus.PRESENT.value
            db.add(SessionAttendance(
                session_id=sess.id,
                student_id=st.id,
                status=status,
                remarks="Unwell / family trip" if is_absent else "On time and enthusiastic"
            ))

            if not is_absent:
                db.add(SessionStudentEvaluation(
                    session_id=sess.id,
                    student_id=st.id,
                    understanding=4 if st.name != "Aarav Kumar" else 5,
                    participation=5,
                    confidence=4,
                    observations=f"{st.name} showed clear comprehension of {topic}.",
                    areas_needing_help="Reinforce with hands-on practice sheet" if s_idx % 2 == 0 else "None",
                    recommended_follow_up="Provide practice worksheet"
                ))
    db.commit()

    # 10. Educational Resources (Worksheets, Games, Drawing Prompts, Quizzes)
    res_list = [
        EducationalResource(
            title="Count the Friendly Animals",
            type="game",
            subject="Mathematics",
            target_class="Class 1-2",
            target_level="Beginner",
            description="Interactive counting game where kids click and count apples, stars, and puppies.",
            content_data=json.dumps({
                "gameType": "counter",
                "questions": [
                    {"prompt": "How many friendly puppies are playing?", "items": ["🐶", "🐶", "🐶", "🐶"], "answer": 4, "options": [3, 4, 5, 6]},
                    {"prompt": "Count the shiny golden stars!", "items": ["⭐", "⭐", "⭐", "⭐", "⭐", "⭐"], "answer": 6, "options": [5, 6, 7, 8]},
                    {"prompt": "How many red apples are on the tree?", "items": ["🍎", "🍎", "🍎"], "answer": 3, "options": [2, 3, 4, 5]}
                ]
            }),
            thumbnail_url="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=300"
        ),
        EducationalResource(
            title="Animal First Letters Match",
            type="game",
            subject="English",
            target_class="Class 1-2",
            target_level="Beginner",
            description="Match each cute creature with its starting alphabet sound.",
            content_data=json.dumps({
                "gameType": "matching",
                "pairs": [
                    {"word": "Lion", "icon": "🦁", "letter": "L"},
                    {"word": "Elephant", "icon": "🐘", "letter": "E"},
                    {"word": "Monkey", "icon": "🐒", "letter": "M"},
                    {"word": "Tiger", "icon": "🐯", "letter": "T"}
                ]
            }),
            thumbnail_url="https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300"
        ),
        EducationalResource(
            title="Creative Freehand & Shapes Canvas",
            type="drawing",
            subject="Art",
            target_class="Class 1-4",
            target_level="All Levels",
            description="Child-friendly digital whiteboard with cheerful colors, paintbrushes, and shape stamps.",
            content_data=json.dumps({
                "canvasTools": ["brush", "eraser", "clear", "star_stamp"],
                "colorPalette": ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#111827"]
            }),
            thumbnail_url="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300"
        ),
        EducationalResource(
            title="Speed Addition Champions Quiz",
            type="quiz",
            subject="Mathematics",
            target_class="Class 2-3",
            target_level="Intermediate",
            description="Fun 5-question visual addition quiz with instant feedback and stars reward.",
            content_data=json.dumps({
                "questions": [
                    {"question": "What is 5 + 3?", "options": ["7", "8", "9", "10"], "answer": "8", "hint": "Use your fingers: 5 and 3 more!"},
                    {"question": "What is 10 + 4?", "options": ["12", "13", "14", "15"], "answer": "14", "hint": "One ten and four ones"},
                    {"question": "If you have 7 balloons and friend gives you 2 more, how many do you have?", "options": ["8", "9", "10", "11"], "answer": "9", "hint": "7 + 2 = ?"}
                ]
            }),
            thumbnail_url="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300"
        ),
        EducationalResource(
            title="Sight Words Scramble Worksheet",
            type="worksheet",
            subject="English",
            target_class="Class 2-4",
            target_level="Intermediate",
            description="Interactive printable worksheet for identifying common words: THE, AND, PLAY, FRIEND.",
            content_data=json.dumps({
                "words": ["THE", "COME", "PLAY", "FRIEND", "BOOK", "WATER"],
                "instruction": "Practice saying each word loudly and match with pictures."
            }),
            thumbnail_url="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300"
        )
    ]
    db.add_all(res_list)

    # 11. Initial Notifications
    notifs = [
        Notification(
            recipient_role="admin",
            title="Attendance Alert: Vihaan Singh",
            message="Vihaan Singh (Class 2) has attended only 2 of the last 4 sessions. Consider checking in with his guardians."
        ),
        Notification(
            recipient_role="volunteer",
            title="New Teaching Plan Assigned",
            message="Teaching plan 'Visual Addition & Regrouping' for Little Innovators has been updated for today."
        ),
        Notification(
            recipient_role="student",
            title="Super Star Alert! ⭐",
            message="You earned 3 stars in yesterday's learning session! Keep it up Aarav!"
        )
    ]
    db.add_all(notifs)
    db.commit()

    print("Database successfully seeded with realistic Community Connect data!")
    db.close()

if __name__ == "__main__":
    seed_database()
