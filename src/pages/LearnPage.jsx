import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getPublishedSubjects } from "../services/subjectService";
import { getUserProgress } from "../services/progressService";
import { createLogger } from "../utils/logger";

const logger = createLogger("LearnPage");

function LearnPage() {
  const { profile } = useAuthSession();
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [profile?.uid]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      const [subjectsData, progressData] = await Promise.all([
        getPublishedSubjects(),
        profile?.uid ? getUserProgress(profile.uid) : null,
      ]);
      
      setSubjects(subjectsData || []);
      setProgress(progressData);
      
      // Log for debugging
      logger.info(`Loaded ${subjectsData?.length || 0} subjects`);
    } catch (err) {
      logger.error("Error loading learn page:", err);
      // More user-friendly error message
      if (err.code === 'permission-denied') {
        setError("Access denied. Please make sure you're logged in.");
      } else if (err.code === 'unavailable') {
        setError("Cannot connect to the database. Please check your internet connection.");
      } else {
        setError("Failed to load learning content. Please refresh the page or try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading learning paths...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="Learn"
        title="Learning Paths"
        subtitle="Choose a subject and start your journey"
      />

      {error && (
        <div className="error-banner" style={{ margin: "1rem 0", padding: "1rem", backgroundColor: "#fee", borderRadius: "8px" }}>
          {error}
        </div>
      )}

      {progress && (
        <div className="progress-summary" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
          gap: "1rem", 
          margin: "2rem 0",
          padding: "1.5rem",
          backgroundColor: "#f7f9fc",
          borderRadius: "12px"
        }}>
          <div className="stat">
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3182ce" }}>{progress.level}</div>
            <div style={{ fontSize: "0.875rem", color: "#718096" }}>Level</div>
          </div>
          <div className="stat">
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#38a169" }}>{progress.xp}</div>
            <div style={{ fontSize: "0.875rem", color: "#718096" }}>Total XP</div>
          </div>
          <div className="stat">
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#dd6b20" }}>{progress.streak}</div>
            <div style={{ fontSize: "0.875rem", color: "#718096" }}>Day Streak</div>
          </div>
          <div className="stat">
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#805ad5" }}>{progress.totalQuizzes}</div>
            <div style={{ fontSize: "0.875rem", color: "#718096" }}>Quizzes Done</div>
          </div>
        </div>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Available Subjects</h2>
        
        {subjects.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem 2rem", 
            backgroundColor: "#f7f9fc", 
            borderRadius: "12px" 
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>No Subjects Yet</h3>
            <p style={{ color: "#718096" }}>Your teacher will publish subjects soon.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {subjects.map((subject) => {
              const subjectProgress = progress?.subjectProgress?.[subject.id];
              const subjectXP = subjectProgress?.xp || 0;
              
              return (
                <Link
                  key={subject.id}
                  to={`/course/${subject.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="subject-card" style={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    transition: "all 0.2s",
                    cursor: "pointer",
                    height: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = subject.color || "#3182ce";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                    <div style={{ 
                      fontSize: "3rem", 
                      marginBottom: "1rem",
                      textAlign: "center"
                    }}>
                      {subject.icon || "📖"}
                    </div>
                    <h3 style={{ 
                      fontSize: "1.25rem", 
                      fontWeight: "600", 
                      marginBottom: "0.5rem",
                      color: "#2d3748"
                    }}>
                      {subject.name}
                    </h3>
                    <p style={{ 
                      fontSize: "0.875rem", 
                      color: "#718096", 
                      marginBottom: "1rem",
                      minHeight: "2.5rem"
                    }}>
                      {subject.description || "Start learning this subject"}
                    </p>
                    
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      fontSize: "0.875rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #e2e8f0"
                    }}>
                      <span style={{ color: "#718096" }}>
                        {subject.topicCount || 0} topics
                      </span>
                      {subjectXP > 0 && (
                        <span style={{ color: subject.color || "#3182ce", fontWeight: "600" }}>
                          {subjectXP} XP earned
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default LearnPage;
