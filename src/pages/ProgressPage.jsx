import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getUserProgress } from "../services/progressService";
import { getUserQuizStats } from "../services/quizService";
import { createLogger } from "../utils/logger";

const logger = createLogger("ProgressPage");

function ProgressPage() {
  const { profile } = useAuthSession();
  const [progress, setProgress] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProgress();
  }, [profile?.uid]);

  async function loadProgress() {
    try {
      setLoading(true);
      setError(null);
      
      const [progressData, statsData] = await Promise.all([
        getUserProgress(profile.uid),
        getUserQuizStats(profile.uid),
      ]);
      
      setProgress(progressData);
      setQuizStats(statsData);
    } catch (err) {
      logger.error("Error loading progress:", err);
      setError("Failed to load progress. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading progress...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !progress) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Error Loading Progress</h2>
          <p style={{ color: "#718096", marginBottom: "2rem" }}>{error}</p>
          <button
            onClick={loadProgress}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Try Again
          </button>
        </div>
      </AppShell>
    );
  }

  const topicProgressArray = Object.entries(progress.topicProgress || {});
  const subjectProgressArray = Object.entries(progress.subjectProgress || {});
  
  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="Progress"
        title="Your Learning Journey"
        subtitle="Track your growth and achievements"
      />

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
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⭐</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#3182ce", marginBottom: "0.25rem" }}>
            {progress.level}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Current Level</div>
          <div style={{ fontSize: "0.75rem", color: "#a0aec0", marginTop: "0.5rem" }}>
            {progress.xp} / {progress.level * 100} XP
          </div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏆</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#38a169", marginBottom: "0.25rem" }}>
            {progress.xp}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Total XP</div>
          <div style={{ fontSize: "0.75rem", color: "#a0aec0", marginTop: "0.5rem" }}>
            {Math.floor((progress.xp % 100) / 100 * 100)}% to next level
          </div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🔥</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#dd6b20", marginBottom: "0.25rem" }}>
            {progress.streak}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Day Streak</div>
          <div style={{ fontSize: "0.75rem", color: "#a0aec0", marginTop: "0.5rem" }}>
            {progress.streak > 0 ? "Keep it going!" : "Start learning today!"}
          </div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #e2e8f0"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📝</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#805ad5", marginBottom: "0.25rem" }}>
            {progress.totalQuizzes}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#718096" }}>Quizzes Completed</div>
          <div style={{ fontSize: "0.75rem", color: "#a0aec0", marginTop: "0.5rem" }}>
            {quizStats?.averageScore || 0}% average score
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      {subjectProgressArray.length > 0 && (
        <section style={{ marginTop: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Subject Progress</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {subjectProgressArray.map(([subjectId, subjectData]) => (
              <Link
                key={subjectId}
                to={`/course/${subjectId}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3182ce";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#2d3748" }}>
                    {subjectData.subjectName}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#38a169" }}>
                        {subjectData.xp || 0}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#718096" }}>XP Earned</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#3182ce" }}>
                        {subjectData.completedTopics || 0}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#718096" }}>Topics Done</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Topic Progress */}
      {topicProgressArray.length > 0 && (
        <section style={{ marginTop: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Topic Performance</h2>
          
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            {topicProgressArray
              .sort((a, b) => (b[1].bestScore || 0) - (a[1].bestScore || 0))
              .slice(0, 10)
              .map(([topicId, topicData], index) => (
                <div
                  key={topicId}
                  style={{
                    padding: "1.25rem",
                    borderBottom: index < Math.min(10, topicProgressArray.length) - 1 ? "1px solid #e2e8f0" : "none",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "1rem",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "0.25rem" }}>
                      {topicData.topicName}
                      {topicData.completed && (
                        <span style={{ marginLeft: "0.5rem", color: "#48bb78" }}>✓</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                      {topicData.attempts} attempt{topicData.attempts !== 1 ? 's' : ''} • 
                      Last score: {topicData.lastScore || 0}%
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ 
                      fontSize: "1.5rem", 
                      fontWeight: "700", 
                      color: topicData.bestScore >= 70 ? "#48bb78" : "#ed8936"
                    }}>
                      {topicData.bestScore || 0}%
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#a0aec0" }}>Best</div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {quizStats?.recentAttempts && quizStats.recentAttempts.length > 0 && (
        <section style={{ marginTop: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Recent Activity</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {quizStats.recentAttempts.slice(0, 5).map((attempt) => (
              <div
                key={attempt.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "1rem",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1rem",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#2d3748" }}>
                    {attempt.topicName}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                    {new Date(attempt.completedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#38a169" }}>
                    {attempt.score}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                    +{attempt.xpEarned || 0} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

export default ProgressPage;
