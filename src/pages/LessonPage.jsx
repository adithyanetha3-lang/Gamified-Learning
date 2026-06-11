import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getTopic } from "../services/topicService";
import { getSubject } from "../services/subjectService";
import { createLogger } from "../utils/logger";

const logger = createLogger("LessonPage");

function LessonPage() {
  const { profile } = useAuthSession();
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState(null);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLessonData();
  }, [topicId]);

  async function loadLessonData() {
    try {
      setLoading(true);
      setError(null);
      
      const topicData = await getTopic(topicId);
      
      if (!topicData) {
        setError("Topic not found");
        return;
      }
      
      setTopic(topicData);
      
      // Load subject info
      if (topicData.subjectId) {
        const subjectData = await getSubject(topicData.subjectId);
        setSubject(subjectData);
      }
    } catch (err) {
      logger.error("Error loading lesson:", err);
      setError("Failed to load lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading lesson...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !topic) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Lesson Not Found</h2>
          <p style={{ color: "#718096", marginBottom: "2rem" }}>{error || "This lesson doesn't exist."}</p>
          <Link to="/learn" style={{ 
            display: "inline-block",
            padding: "0.75rem 1.5rem", 
            backgroundColor: "#3182ce", 
            color: "white", 
            borderRadius: "8px",
            textDecoration: "none"
          }}>
            Back to Learn
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
        <Link to="/learn" style={{ color: "#3182ce", textDecoration: "none" }}>
          Learn
        </Link>
        {subject && (
          <>
            <span style={{ margin: "0 0.5rem", color: "#a0aec0" }}>/</span>
            <Link to={`/course/${subject.id}`} style={{ color: "#3182ce", textDecoration: "none" }}>
              {subject.name}
            </Link>
          </>
        )}
        <span style={{ margin: "0 0.5rem", color: "#a0aec0" }}>/</span>
        <span style={{ color: "#2d3748" }}>{topic.name}</span>
      </div>

      <PageHeader
        eyebrow={subject?.name || "Lesson"}
        title={topic.name}
        subtitle={topic.description || "Study the lesson content below"}
      />

      {/* Difficulty Badge */}
      <div style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <span style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          fontSize: "0.875rem",
          fontWeight: "600",
          background: topic.difficulty === "easy" 
            ? "linear-gradient(135deg, #48bb78, #38a169)"
            : topic.difficulty === "hard"
            ? "linear-gradient(135deg, #f56565, #e53e3e)"
            : "linear-gradient(135deg, #ed8936, #dd6b20)",
          color: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          {topic.difficulty === "easy" && "🌱"} 
          {topic.difficulty === "medium" && "🌿"}
          {topic.difficulty === "hard" && "🌲"}
          {" "}
          {topic.difficulty?.charAt(0).toUpperCase() + topic.difficulty?.slice(1)} Level
        </span>
      </div>

      {/* Lesson Content */}
      <div style={{
        backgroundColor: "#ffffff",
        border: "2px solid #e2e8f0",
        borderRadius: "16px",
        padding: "2.5rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}>
        {topic.lessonText ? (
          <div style={{
            fontSize: "1.125rem",
            lineHeight: "1.8",
            color: "#2d3748",
            whiteSpace: "pre-wrap"
          }}>
            {topic.lessonText}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#a0aec0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
            <p>No lesson content available yet.</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Your teacher will add content soon!
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: "flex",
        gap: "1rem",
        justifyContent: "space-between",
        padding: "2rem",
        backgroundColor: "#f7fafc",
        borderRadius: "12px",
        border: "2px solid #e2e8f0"
      }}>
        <Link
          to={subject ? `/course/${subject.id}` : "/learn"}
          style={{
            padding: "1rem 2rem",
            background: "linear-gradient(135deg, #cbd5e0, #a0aec0)",
            color: "white",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "600",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(160, 174, 192, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          ← Back to Topics
        </Link>

        <Link
          to={`/quiz/${topic.id}`}
          style={{
            padding: "1rem 2rem",
            background: "linear-gradient(135deg, #3182ce, #2c5aa0)",
            color: "white",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "600",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.125rem"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(49, 130, 206, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Take Quiz Now 🎯
        </Link>
      </div>

      {/* Study Tips */}
      <div style={{
        marginTop: "2rem",
        padding: "1.5rem",
        background: "linear-gradient(135deg, #ebf8ff, #e6fffa)",
        borderRadius: "12px",
        border: "2px solid #90cdf4"
      }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#2c5282" }}>
          💡 Study Tips
        </h3>
        <ul style={{ fontSize: "0.875rem", color: "#2d3748", lineHeight: "1.8", paddingLeft: "1.5rem" }}>
          <li>Read the lesson content carefully</li>
          <li>Take notes of important points</li>
          <li>Try to understand concepts, not just memorize</li>
          <li>Take the quiz when you feel confident</li>
          <li>You can retake the quiz to improve your score</li>
        </ul>
      </div>
    </AppShell>
  );
}

export default LessonPage;
