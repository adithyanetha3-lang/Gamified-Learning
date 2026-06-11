import { useEffect, useState } from "react";
import InfoPanel from "../components/InfoPanel";
import MainSection from "../components/MainSection";
import OptionGrid from "../components/OptionGrid";
import PageHeader from "../components/PageHeader";
import QuickActionPanel from "../components/QuickActionPanel";
import SummaryBar from "../components/SummaryBar";
import AppShell from "../components/AppShell";
import { DASHBOARD_CONFIG } from "../data/dashboardConfig";
import { useAuthSession } from "../hooks/useAuthSession";
import { getUserProgress } from "../services/progressService";
import { getUserQuizStats } from "../services/quizService";
import { getDocuments } from "../services/firestoreService";

function Home() {
  const { profile } = useAuthSession();
  const [progress, setProgress] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadUserData();
    }
  }, [profile?.uid, profile?.role]);

  async function loadUserData() {
    try {
      setLoading(true);
      
      if (profile.role === "student") {
        const [progressData, statsData] = await Promise.all([
          getUserProgress(profile.uid),
          getUserQuizStats(profile.uid)
        ]);
        setProgress(progressData);
        setQuizStats(statsData);
      } else if (profile.role === "teacher") {
        const [subjects, questions, users] = await Promise.all([
          getDocuments("subjects"),
          getDocuments("questions"),
          getDocuments("users")
        ]);
        
        const draftQuestions = questions.filter(q => q.status === "draft").length;
        const publishedQuestions = questions.filter(q => q.status === "published").length;
        const studentCount = users.filter(u => u.role === "student").length;
        
        setTeacherStats({
          subjects: subjects.length,
          draftQuestions,
          publishedQuestions,
          students: studentCount
        });
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return null;
  }

  const roleConfig = DASHBOARD_CONFIG[profile.role] || DASHBOARD_CONFIG.student;
  const firstName = profile.name?.split(" ")[0] || "Learner";

  function buildSummary() {
    if (profile.role === "teacher" && teacherStats) {
      return [
        { label: "Students", value: teacherStats.students, tone: "accent" },
        { label: "Subjects", value: teacherStats.subjects, tone: "default" },
        { label: "Published", value: teacherStats.publishedQuestions, tone: "default" },
        { label: "Drafts", value: teacherStats.draftQuestions, tone: "default" }
      ];
    }

    if (progress) {
      return [
        { label: "Level", value: progress.level, tone: "accent" },
        { label: "XP", value: progress.xp, tone: "default" },
        { label: "Streak", value: `${progress.streak} 🔥`, tone: "default" },
        { label: "Quizzes", value: progress.totalQuizzes, tone: "default" }
      ];
    }

    return [
      { label: "Level", value: 1, tone: "accent" },
      { label: "XP", value: 0, tone: "default" },
      { label: "Streak", value: 0, tone: "default" },
      { label: "Quizzes", value: 0, tone: "default" }
    ];
  }

  function buildUpdates() {
    if (profile.role === "teacher") {
      if (!teacherStats) return ["Loading..."];
      const updates = [];
      if (teacherStats.draftQuestions > 0) updates.push(`${teacherStats.draftQuestions} questions need review`);
      if (teacherStats.students > 0) updates.push(`${teacherStats.students} students enrolled`);
      updates.push("Analytics available");
      return updates.slice(0, 3);
    }

    if (quizStats?.recentAttempts && quizStats.recentAttempts.length > 0) {
      return quizStats.recentAttempts.slice(0, 3).map(a => 
        `${a.topicName}: ${a.score}%`
      );
    }

    return ["Start your first quiz", "Earn XP and badges", "Track your progress"];
  }

  function buildTasks() {
    return profile.role === "teacher"
      ? ["Review draft questions", "Generate new quizzes", "Check student performance"]
      : ["Complete a quiz today", "Maintain your streak", "Reach next level"];
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow={roleConfig.header.eyebrow}
        title={profile.role === "teacher" ? "Teacher Dashboard" : `Welcome, ${firstName}`}
        subtitle={roleConfig.header.subtitle}
      />

      <SummaryBar items={buildSummary()} />

      <MainSection title="Explore" meta="Main Options">
        <OptionGrid items={roleConfig.options} />
      </MainSection>

      <MainSection title="Quick Actions" meta="Shortcuts">
        <QuickActionPanel actions={roleConfig.actions} />
      </MainSection>

      <section className="info-grid">
        <MainSection title="Recent" meta="Now">
          <InfoPanel items={buildUpdates()} />
        </MainSection>
        <MainSection title="Next" meta="Focus">
          <InfoPanel items={buildTasks()} />
        </MainSection>
      </section>
    </AppShell>
  );
}

export default Home;
