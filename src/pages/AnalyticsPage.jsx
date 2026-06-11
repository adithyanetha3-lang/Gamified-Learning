import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getDocuments } from "../services/firestoreService";
import { createLogger } from "../utils/logger";

const logger = createLogger("AnalyticsPage");

function AnalyticsPage() {
  const { profile } = useAuthSession();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttempts: 0,
    averageScore: 0,
    activeToday: 0,
    topPerformers: [],
    recentAttempts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      
      const [users, attempts, progressDocs] = await Promise.all([
        getDocuments("users"),
        getDocuments("quizAttempts"),
        getDocuments("progress")
      ]);
      
      const students = users.filter(u => u.role === "student");
      const completedAttempts = attempts.filter(a => a.completed);
      
      const averageScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
        : 0;
      
      const today = new Date().toISOString().split('T')[0];
      const activeToday = progressDocs.filter(p => p.lastActivityDate === today).length;
      
      const topPerformers = progressDocs
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .slice(0, 10);
      
      const recentAttempts = completedAttempts
        .sort((a, b) => {
          const aTime = a.completedAt?.seconds || 0;
          const bTime = b.completedAt?.seconds || 0;
          return bTime - aTime;
        })
        .slice(0, 10);
      
      setStats({
        totalStudents: students.length,
        totalAttempts: completedAttempts.length,
        averageScore,
        activeToday,
        topPerformers,
        recentAttempts
      });
      
    } catch (err) {
      logger.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="Analytics"
        title="Student Performance"
        subtitle="Monitor class activity and progress"
      />

      {/* Key Metrics */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1.5rem",
        margin: "2rem 0"
      }}>
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#3182ce", marginBottom: "0.25rem" }}>
            {stats.totalStudents}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Total Students</div>
        </div>

        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#38a169", marginBottom: "0.25rem" }}>
            {stats.totalAttempts}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Quiz Attempts</div>
        </div>

        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#805ad5", marginBottom: "0.25rem" }}>
            {stats.averageScore}%
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Average Score</div>
        </div>

        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#dd6b20", marginBottom: "0.25rem" }}>
            {stats.activeToday}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Active Today</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "3rem" }}>
        {/* Top Performers */}
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Top Performers</h3>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            {stats.topPerformers.map((student, index) => (
              <div
                key={student.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderBottom: index < stats.topPerformers.length - 1 ? "1px solid #e2e8f0" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ 
                    width: "32px", 
                    height: "32px", 
                    borderRadius: "50%", 
                    backgroundColor: index < 3 ? "#ffd700" : "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "0.875rem"
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{student.userName}</div>
                    <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                      Level {student.level} • {student.totalQuizzes || 0} quizzes
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: "700", color: "#38a169", fontSize: "1.125rem" }}>
                  {student.xp}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Recent Quiz Attempts</h3>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            {stats.recentAttempts.map((attempt, index) => (
              <div
                key={attempt.id}
                style={{
                  padding: "1rem",
                  borderBottom: index < stats.recentAttempts.length - 1 ? "1px solid #e2e8f0" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: "600", fontSize: "0.875rem" }}>{attempt.userName}</span>
                  <span style={{ 
                    fontWeight: "700", 
                    color: attempt.score >= 70 ? "#38a169" : "#dd6b20" 
                  }}>
                    {attempt.score}%
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                  {attempt.topicName} • {attempt.correctAnswers}/{attempt.totalQuestions} correct
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default AnalyticsPage;
