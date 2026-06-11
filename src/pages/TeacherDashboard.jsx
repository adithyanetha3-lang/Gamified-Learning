import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getAllSubjects } from "../services/subjectService";
import { getDocuments } from "../services/firestoreService";
import { createLogger } from "../utils/logger";

const logger = createLogger("TeacherDashboard");

function TeacherDashboard() {
  const { profile } = useAuthSession();
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTopics: 0,
    totalQuestions: 0,
    publishedQuestions: 0,
    draftQuestions: 0,
    totalStudents: 0,
    totalQuizAttempts: 0,
  });
  const [recentSubjects, setRecentSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);
      
      // Load subjects
      const subjects = await getAllSubjects();
      setRecentSubjects(subjects.slice(0, 5));
      
      // Calculate totals
      const totalTopics = subjects.reduce((sum, s) => sum + (s.topicCount || 0), 0);
      const totalQuestions = subjects.reduce((sum, s) => sum + (s.questionCount || 0), 0);
      
      // Get all questions to count by status
      const allQuestions = await getDocuments("questions");
      const publishedQuestions = allQuestions.filter(q => q.status === "published").length;
      const draftQuestions = allQuestions.filter(q => q.status === "draft").length;
      
      // Get student count (users with role student)
      const allUsers = await getDocuments("users");
      const studentCount = allUsers.filter(u => u.role === "student").length;
      
      // Get quiz attempts count
      const quizAttempts = await getDocuments("quizAttempts");
      
      setStats({
        totalSubjects: subjects.length,
        totalTopics,
        totalQuestions,
        publishedQuestions,
        draftQuestions,
        totalStudents: studentCount,
        totalQuizAttempts: quizAttempts.length,
      });
      
    } catch (err) {
      logger.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="Teacher Hub"
        title="Welcome Back, Teacher"
        subtitle="Manage your classes and content"
      />

      {error && (
        <div className="error-banner" style={{ margin: "1rem 0", padding: "1rem", backgroundColor: "#fee", borderRadius: "8px" }}>
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1.5rem",
        margin: "2rem 0"
      }}>
        <div className="stat-card" style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👥</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#3182ce", marginBottom: "0.25rem" }}>
            {stats.totalStudents}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Total Students</div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📚</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#38a169", marginBottom: "0.25rem" }}>
            {stats.totalSubjects}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Subjects</div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📝</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#805ad5", marginBottom: "0.25rem" }}>
            {stats.totalTopics}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Topics</div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>❓</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#dd6b20", marginBottom: "0.25rem" }}>
            {stats.totalQuestions}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>
            Total Questions ({stats.publishedQuestions} published)
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Quick Actions</h2>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "1rem" 
        }}>
          <Link to="/subjects" style={{ textDecoration: "none" }}>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              padding: "1.5rem",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "1rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3182ce";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(0)";
            }}>
              <div style={{ fontSize: "3rem" }}>📚</div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#2d3748", marginBottom: "0.25rem" }}>
                  Manage Subjects
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#718096" }}>
                  Create and organize subjects
                </p>
              </div>
            </div>
          </Link>

          <Link to="/generator" style={{ textDecoration: "none" }}>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              padding: "1.5rem",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "1rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#38a169";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(0)";
            }}>
              <div style={{ fontSize: "3rem" }}>🤖</div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#2d3748", marginBottom: "0.25rem" }}>
                  Generate Questions
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#718096" }}>
                  Use AI to create quizzes
                </p>
              </div>
            </div>
          </Link>

          <Link to="/question-bank" style={{ textDecoration: "none" }}>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              padding: "1.5rem",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "1rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#805ad5";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(0)";
            }}>
              <div style={{ fontSize: "3rem" }}>🏦</div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#2d3748", marginBottom: "0.25rem" }}>
                  Question Bank
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#718096" }}>
                  Review and publish questions
                </p>
              </div>
            </div>
          </Link>

          <Link to="/analytics" style={{ textDecoration: "none" }}>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              padding: "1.5rem",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "1rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#dd6b20";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(0)";
            }}>
              <div style={{ fontSize: "3rem" }}>📊</div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#2d3748", marginBottom: "0.25rem" }}>
                  View Analytics
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#718096" }}>
                  Student performance insights
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Subjects */}
      {recentSubjects.length > 0 && (
        <section style={{ marginTop: "3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>Your Subjects</h2>
            <Link to="/subjects" style={{ color: "#3182ce", textDecoration: "none", fontSize: "0.875rem" }}>
              View All →
            </Link>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
            {recentSubjects.map((subject) => (
              <Link key={subject.id} to="/subjects" style={{ textDecoration: "none" }}>
                <div style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = subject.color || "#3182ce";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                    {subject.icon || "📖"}
                  </div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#2d3748", marginBottom: "0.5rem" }}>
                    {subject.name}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                    {subject.topicCount || 0} topics • {subject.questionCount || 0} questions
                  </div>
                  {subject.published && (
                    <div style={{ 
                      marginTop: "0.5rem",
                      fontSize: "0.75rem",
                      color: "#48bb78",
                      fontWeight: "600"
                    }}>
                      ✓ Published
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Activity Summary */}
      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Activity Summary</h2>
        
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "1.5rem"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#718096" }}>Total Quiz Attempts</span>
              <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#2d3748" }}>
                {stats.totalQuizAttempts}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#718096" }}>Draft Questions</span>
              <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#dd6b20" }}>
                {stats.draftQuestions}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#718096" }}>Published Questions</span>
              <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#48bb78" }}>
                {stats.publishedQuestions}
              </span>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default TeacherDashboard;
