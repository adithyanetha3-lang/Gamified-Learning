import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getPublishedSubjects } from "../services/subjectService";
import { getPublishedTopicsBySubject } from "../services/topicService";
import { getUserProgress } from "../services/progressService";
import { createLogger } from "../utils/logger";

const logger = createLogger("QuizPage");

function QuizPage() {
  const { profile } = useAuthSession();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [profile?.uid]);

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject);
    } else {
      setTopics([]);
    }
  }, [selectedSubject]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      const [subjectsData, progressData] = await Promise.all([
        getPublishedSubjects(),
        profile?.uid ? getUserProgress(profile.uid) : null,
      ]);
      
      setSubjects(subjectsData);
      setProgress(progressData);
      
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0].id);
      }
    } catch (err) {
      logger.error("Error loading quiz page:", err);
      setError("Failed to load quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTopics(subjectId) {
    try {
      setLoadingTopics(true);
      const topicsData = await getPublishedTopicsBySubject(subjectId);
      setTopics(topicsData);
    } catch (err) {
      logger.error("Error loading topics:", err);
    } finally {
      setLoadingTopics(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading quizzes...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="Quiz"
        title="Practice Quizzes"
        subtitle="Select a subject and topic to start practicing"
      />

      {error && (
        <div className="error-banner" style={{ margin: "1rem 0", padding: "1rem", backgroundColor: "#fee", borderRadius: "8px" }}>
          {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem 2rem", 
          backgroundColor: "#f7f9fc", 
          borderRadius: "12px",
          marginTop: "2rem"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📝</div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>No Quizzes Available</h3>
          <p style={{ color: "#718096" }}>Your teacher hasn't published any quizzes yet.</p>
        </div>
      ) : (
        <>
          {/* Subject Selector */}
          <div style={{ margin: "2rem 0" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>Select Subject</h2>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
              gap: "1rem" 
            }}>
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  style={{
                    padding: "1rem",
                    backgroundColor: selectedSubject === subject.id ? (subject.color || "#3182ce") : "#ffffff",
                    color: selectedSubject === subject.id ? "white" : "#2d3748",
                    border: `2px solid ${selectedSubject === subject.id ? (subject.color || "#3182ce") : "#e2e8f0"}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{subject.icon || "📚"}</span>
                  <span>{subject.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topics List */}
          <div style={{ marginTop: "2rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>Select Quiz Topic</h2>
            
            {loadingTopics ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div className="spinner"></div>
                <p>Loading topics...</p>
              </div>
            ) : topics.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "2rem", 
                backgroundColor: "#f7f9fc", 
                borderRadius: "12px" 
              }}>
                <p style={{ color: "#718096" }}>No quiz topics available for this subject.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {topics.map((topic) => {
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
                        gridTemplateColumns: "1fr auto",
                        gap: "1.5rem",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                          {topic.name}
                          {isCompleted && (
                            <span style={{ 
                              marginLeft: "0.75rem", 
                              fontSize: "1rem", 
                              color: "#48bb78" 
                            }}>
                              ✓ Completed
                            </span>
                          )}
                        </h3>
                        <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.5rem" }}>
                          {topic.description || "Test your knowledge on this topic"}
                        </p>
                        <div style={{ 
                          display: "flex", 
                          gap: "1.5rem", 
                          fontSize: "0.75rem", 
                          color: "#a0aec0" 
                        }}>
                          <span>Difficulty: {topic.difficulty || "Medium"}</span>
                          <span>Questions: {topic.questionCount || 0}</span>
                          {attempts > 0 && (
                            <>
                              <span>Best: {bestScore}%</span>
                              <span>Attempts: {attempts}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <Link
                        to={`/quiz/${topic.id}`}
                        style={{
                          padding: "0.75rem 2rem",
                          backgroundColor: isCompleted ? "#48bb78" : "#3182ce",
                          color: "white",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                      >
                        {attempts > 0 ? "Retry" : "Start"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}

export default QuizPage;
