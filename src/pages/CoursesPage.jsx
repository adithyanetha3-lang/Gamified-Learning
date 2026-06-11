import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getPublishedSubjects } from "../services/subjectService";
import { createLogger } from "../utils/logger";

const logger = createLogger("CoursesPage");

function CoursesPage() {
  const { profile } = useAuthSession();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublishedSubjects();
      setSubjects(data);
    } catch (err) {
      logger.error("Error loading subjects:", err);
      setError("Failed to load subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="Courses"
        title="Subject Library"
        subtitle="Browse all available subjects and topics"
      />

      {error && (
        <div className="error-banner" style={{ margin: "1rem 0", padding: "1rem", backgroundColor: "#fee", borderRadius: "8px" }}>
          {error}
        </div>
      )}

      <section style={{ marginTop: "2rem" }}>
        {subjects.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "4rem 2rem", 
            backgroundColor: "#f7f9fc", 
            borderRadius: "12px" 
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📚</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>No Courses Available</h3>
            <p style={{ color: "#718096" }}>Your teacher hasn't published any courses yet.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "2rem" 
          }}>
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/course/${subject.id}`}
                style={{ textDecoration: "none" }}
              >
                <div className="course-card" style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "2rem",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = subject.color || "#3182ce";
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                  <div style={{ 
                    fontSize: "4rem", 
                    marginBottom: "1.5rem",
                    textAlign: "center"
                  }}>
                    {subject.icon || "📖"}
                  </div>
                  <h3 style={{ 
                    fontSize: "1.5rem", 
                    fontWeight: "700", 
                    marginBottom: "0.75rem",
                    color: "#2d3748"
                  }}>
                    {subject.name}
                  </h3>
                  <p style={{ 
                    fontSize: "0.9375rem", 
                    color: "#718096", 
                    marginBottom: "1.5rem",
                    minHeight: "3rem",
                    lineHeight: "1.6"
                  }}>
                    {subject.description || "Explore this subject"}
                  </p>
                  
                  <div style={{ 
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid #e2e8f0"
                  }}>
                    <div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: subject.color || "#3182ce" }}>
                        {subject.topicCount || 0}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#a0aec0", textTransform: "uppercase" }}>Topics</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#48bb78" }}>
                        {subject.questionCount || 0}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#a0aec0", textTransform: "uppercase" }}>Questions</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default CoursesPage;
