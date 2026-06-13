import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfoPanel from "../components/InfoPanel";
import MainSection from "../components/MainSection";
import OptionGrid from "../components/OptionGrid";
import PageHeader from "../components/PageHeader";
import QuickActionPanel from "../components/QuickActionPanel";
import SummaryBar from "../components/SummaryBar";
import AppShell from "../components/AppShell";
import { useDashboardConfig } from "../hooks/useDashboardConfig";
import { useAuthSession } from "../hooks/useAuthSession";
import { getUserProgress } from "../services/progressService";
import { getUserQuizStats } from "../services/quizService";
import { getDocuments } from "../services/firestoreService";

function Home() {
  const { t } = useTranslation();
  const { profile } = useAuthSession();
  const dashboardConfig = useDashboardConfig();
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
          getUserProgress(profile.uid, profile.name || "Student"),
          getUserQuizStats(profile.uid)
        ]);
        
        // Auto-fix progress name if it's showing as "Student"
        if (progressData && progressData.userName === "Student" && profile.name && profile.name !== "Student") {
          try {
            const { fixUserProgressName } = await import("../services/fixProgressNames");
            await fixUserProgressName(profile.uid, profile.name);
            console.log(`✅ Auto-fixed progress name to: ${profile.name}`);
            progressData.userName = profile.name; // Update local state
          } catch (err) {
            console.error("Failed to auto-fix progress name:", err);
          }
        }
        
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

  const roleConfig = dashboardConfig[profile.role] || dashboardConfig.student;
  const firstName = profile.name?.split(" ")[0] || "Learner";

  function buildSummary() {
    if (profile.role === "teacher" && teacherStats) {
      return [
        { label: t('analytics.totalStudents'), value: teacherStats.students, tone: "accent" },
        { label: t('navigation.subjects'), value: teacherStats.subjects, tone: "default" },
        { label: t('questionBank.published'), value: teacherStats.publishedQuestions, tone: "default" },
        { label: t('questionBank.draft'), value: teacherStats.draftQuestions, tone: "default" }
      ];
    }

    if (progress) {
      return [
        { label: t('dashboard.level'), value: progress.level, tone: "accent" },
        { label: t('dashboard.xp'), value: progress.xp, tone: "default" },
        { label: t('dashboard.streak'), value: `${progress.streak} 🔥`, tone: "default" },
        { label: t('dashboard.quizzes'), value: progress.totalQuizzes, tone: "default" }
      ];
    }

    return [
      { label: t('dashboard.level'), value: 1, tone: "accent" },
      { label: t('dashboard.xp'), value: 0, tone: "default" },
      { label: t('dashboard.streak'), value: 0, tone: "default" },
      { label: t('dashboard.quizzes'), value: 0, tone: "default" }
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
          <p>{t('common.loading')}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow={roleConfig.header.eyebrow}
        title={profile.role === "teacher" ? t('dashboard.teacherDashboard') : `${t('dashboard.welcome')}, ${firstName}`}
        subtitle={roleConfig.header.subtitle}
      />

      <SummaryBar items={buildSummary()} />

      <MainSection title={t('dashboard.explore')} meta="Main Options">
        <OptionGrid items={roleConfig.options} />
      </MainSection>

      <MainSection title={t('dashboard.quickActions')} meta="Shortcuts">
        <QuickActionPanel actions={roleConfig.actions} />
      </MainSection>

      <section className="info-grid">
        <MainSection title={t('dashboard.recent')} meta="Now">
          <InfoPanel items={buildUpdates()} />
        </MainSection>
        <MainSection title={t('dashboard.next')} meta="Focus">
          <InfoPanel items={buildTasks()} />
        </MainSection>
      </section>
    </AppShell>
  );
}

export default Home;
