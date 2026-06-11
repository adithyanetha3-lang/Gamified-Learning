import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getSubject } from "../services/subjectService";
import { getPublishedTopicsBySubject } from "../services/topicService";
import { getUserProgress } from "../services/progressService";
import { createLogger } from "../utils/logger";

const logger = createLogger("CourseDetailPage");

function CourseDetailPage() {
  const { profile } = useAuthSession();
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourseData();
  }, [courseId, profile?.uid]);

  async function loadCourseData() {
    try {
      setLoading(true);
      setError(null);
      
      const [subjectData, topicsData, progressData] = await Promise.all([
        getSubject(courseId),
        getPublishedTopicsBySubject(courseId),
        profile?.uid ? getUserProgress(profile.uid) : null,
      ]);
      
      if (!subjectData) {
        setError("Subject not found");
        return;
      }
      
      setSubject(subjectData);
      setTopics(topicsData);
      setProgress(progressData);
    } catch (err) {
      logger.error("Error loading course:", err);
      setError("Failed to load course. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading course...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !subject) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Course Not Found</h2>
          <p style={{ color: "#718096", marginBottom: "2rem" }}>{error || "This course doesn't exist."}</p>
          <Link to="/courses" style={{ 
            display: "inline-block",
            padding: "0.75rem 1.5rem", 
            backgroundColor: "#3182ce", 
            color: "white", 
            borderRadius: "8px",
            textDecoration: "none"
          }}>
            Back to Courses
          </Link>
        </div>
      </AppShell>
    );
  }

  const subjectProgress = progress?.subjectProgress?.[courseId];

  return (
    <AppShell profile={profile}>
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/courses" style={{ color: "#3182ce", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Back to Courses
        </Link>
      </div>

      <PageHeader
        eyebrow={subject.name}
        title="Course Topics"
        subtitle={subject.description || "Select a topic to start learning"}
      />

      {subjectProgress && (
        <div style={{ 
          margin: "2rem 0",
          padding: "1.5rem",
          backgroundColor: "#f7f9fc",
          borderRadius: "12px",
          display: "flex",
          gap: "2rem",
          alignItems: "center"
        }}>
          <div>
            <div style={{ fontSize: "2.5rem", fontWeight: "700", color: subject.color || "#3182ce" }}>
              {subjectProgress.xp || 0}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#718096" }}>XP Earned</div>
          </div>
          <div>
            <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#48bb78" }}>
              {subjectProgress.completedTopics || 0}/{topics.length}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#718096" }}>Topics Completed</div>
          </div>
        </div>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>Topics</h2>
        
        {topics.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem 2rem", 
            backgroundColor: "#f7f9fc", 
            borderRadius: "12px" 
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>No Topics Yet</h3>
            <p style={{ color: "#718096" }}>Your teacher will add topics soon.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {topics.map((topic, index) => {
              const topicProgress = progress?.topicProgress?.[topic.id];
              const isCompleted = topicProgress?.completed || false;
              const bestScore = topicProgress?.bestScore || 0;
              const attempts = topicProgress?.attempts || 0;
              
              return (
                <div
                  key={topic.id}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "1.5rem",
                    alignItems: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "50%", 
                    backgroundColor: isCompleted ? "#48bb78" : "#e2e8f0",
                    color: isCompleted ? "white" : "#718096",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    fontWeight: "700"
                  }}>
                    {isCompleted ? "✓" : index + 1}
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                      {topic.name}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.5rem" }}>
                      {topic.description || "Start this topic"}
                    </p>
                    {attempts > 0 && (
                      <div style={{ fontSize: "0.75rem", color: "#a0aec0" }}>
                        Best Score: {bestScore}% • {attempts} attempt{attempts !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Link
                      to={`/learn/section/${topic.id}`}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      📖 Learn
                    </Link>
                    <Link
                      to={`/quiz/${topic.id}`}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: isCompleted 
                          ? "linear-gradient(135deg, #48bb78, #38a169)" 
                          : "linear-gradient(135deg, #3182ce, #2c5aa0)",
                        color: "white",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = isCompleted 
                          ? "0 4px 12px rgba(72, 187, 120, 0.4)" 
                          : "0 4px 12px rgba(49, 130, 206, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      🎯 {isCompleted ? "Practice Quiz" : attempts > 0 ? "Retry Quiz" : "Take Quiz"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default CourseDetailPage;
