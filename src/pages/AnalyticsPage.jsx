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
    groupedAttempts: []
  });
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);

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
      
      // Create user name map
      const userNameMap = {};
      users.forEach(user => {
        userNameMap[user.uid] = user.name || user.displayName || "Student";
      });
      
      // Enhance top performers with real names
      const topPerformers = progressDocs
        .map(p => ({
          ...p,
          userName: userNameMap[p.userId] || p.userName
        }))
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .slice(0, 10);
      
      // Group attempts by student
      const attemptsByStudent = {};
      completedAttempts.forEach(attempt => {
        const userName = attempt.userName;
        if (!attemptsByStudent[userName]) {
          attemptsByStudent[userName] = [];
        }
        attemptsByStudent[userName].push(attempt);
      });
      
      // Sort each student's attempts by time
      Object.keys(attemptsByStudent).forEach(userName => {
        attemptsByStudent[userName].sort((a, b) => {
          const aTime = a.completedAt?.seconds || 0;
          const bTime = b.completedAt?.seconds || 0;
          return bTime - aTime;
        });
      });
      
      // Create grouped attempts array
      const groupedAttempts = Object.entries(attemptsByStudent)
        .map(([userName, attempts]) => ({
          userName,
          attempts,
          totalAttempts: attempts.length,
          averageScore: Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length),
          lastAttemptTime: attempts[0].completedAt
        }))
        .sort((a, b) => {
          const aTime = a.lastAttemptTime?.seconds || 0;
          const bTime = b.lastAttemptTime?.seconds || 0;
          return bTime - aTime;
        });
      
      setStats({
        totalStudents: students.length,
        totalAttempts: completedAttempts.length,
        averageScore,
        activeToday,
        topPerformers,
        groupedAttempts
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
          backgroundColor: "var(--surface)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid var(--line)"
        }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#3182ce", marginBottom: "0.25rem" }}>
            {stats.totalStudents}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Total Students</div>
        </div>

        <div style={{
          backgroundColor: "var(--surface)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid var(--line)"
        }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#38a169", marginBottom: "0.25rem" }}>
            {stats.totalAttempts}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Quiz Attempts</div>
        </div>

        <div style={{
          backgroundColor: "var(--surface)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid var(--line)"
        }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#805ad5", marginBottom: "0.25rem" }}>
            {stats.averageScore}%
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Average Score</div>
        </div>

        <div style={{
          backgroundColor: "var(--surface)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid var(--line)"
        }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#dd6b20", marginBottom: "0.25rem" }}>
            {stats.activeToday}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Active Today</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "3rem" }}>
        {/* Top Performers */}
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "var(--text)" }}>Top Performers</h3>
          <div style={{ backgroundColor: "var(--surface)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
            {stats.topPerformers.map((student, index) => (
              <div
                key={student.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderBottom: index < stats.topPerformers.length - 1 ? "1px solid var(--line)" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ 
                    width: "32px", 
                    height: "32px", 
                    borderRadius: "50%", 
                    backgroundColor: index < 3 ? "#ffd700" : "var(--surface-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "0.875rem",
                    color: index < 3 ? "#000" : "var(--text)"
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "1.125rem", color: "var(--text)" }}>
                      {student.userName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
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

        {/* Recent Quiz Attempts - Grouped by Student */}
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "var(--text)" }}>Recent Quiz Attempts</h3>
          <div style={{ backgroundColor: "var(--surface)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
            {stats.groupedAttempts.map((studentGroup, index) => {
              const isExpanded = expandedStudent === studentGroup.userName;
              
              return (
                <div key={studentGroup.userName}>
                  {/* Student Header - Clickable */}
                  <div
                    onClick={() => setExpandedStudent(isExpanded ? null : studentGroup.userName)}
                    style={{
                      padding: "1rem",
                      borderBottom: index < stats.groupedAttempts.length - 1 || isExpanded ? "1px solid var(--line)" : "none",
                      cursor: "pointer",
                      backgroundColor: isExpanded ? "var(--surface-soft)" : "transparent",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) e.currentTarget.style.backgroundColor = "var(--surface-soft)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ 
                          fontSize: "1.25rem",
                          transition: "transform 0.2s",
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                          color: "var(--primary)"
                        }}>
                          ▶
                        </span>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "1.125rem", marginBottom: "0.25rem", color: "var(--text)" }}>
                            {studentGroup.userName}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                            {studentGroup.totalAttempts} attempt{studentGroup.totalAttempts !== 1 ? 's' : ''} • 
                            Avg: {studentGroup.averageScore}%
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        fontWeight: "700", 
                        fontSize: "1.125rem",
                        color: studentGroup.averageScore >= 70 ? "#38a169" : "#dd6b20" 
                      }}>
                        {studentGroup.averageScore}%
                      </div>
                    </div>
                  </div>

                  {/* Expanded Quiz Attempts */}
                  {isExpanded && (
                    <div style={{ backgroundColor: "var(--surface-soft)" }}>
                      {studentGroup.attempts.map((attempt, attemptIndex) => (
                        <div
                          key={attempt.id}
                          style={{
                            padding: "0.75rem 1rem 0.75rem 3.5rem",
                            borderBottom: attemptIndex < studentGroup.attempts.length - 1 ? "1px solid var(--line)" : "none"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--text)" }}>
                              {attempt.topicName}
                            </span>
                            <span style={{ 
                              fontWeight: "700", 
                              color: attempt.score >= 70 ? "#38a169" : "#dd6b20",
                              fontSize: "0.875rem"
                            }}>
                              {attempt.score}%
                            </span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                            {attempt.correctAnswers}/{attempt.totalQuestions} correct
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default AnalyticsPage;
