import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getGlobalLeaderboard, getUserRank } from "../services/leaderboardService";
import { createLogger } from "../utils/logger";

const logger = createLogger("LeaderboardPage");

function LeaderboardPage() {
  const { profile } = useAuthSession();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [profile?.uid]);

  async function loadLeaderboard() {
    try {
      setLoading(true);
      setError(null);
      
      const [leaderboardData, rankData] = await Promise.all([
        getGlobalLeaderboard(50),
        profile?.uid ? getUserRank(profile.uid) : null,
      ]);
      
      setLeaderboard(leaderboardData);
      setUserRank(rankData);
    } catch (err) {
      logger.error("Error loading leaderboard:", err);
      setError("Failed to load leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="Leaderboard"
        title="Top Learners"
        subtitle="See how you rank against other students"
      />

      {error && (
        <div className="error-banner" style={{ margin: "1rem 0", padding: "1rem", backgroundColor: "#fee", borderRadius: "8px" }}>
          {error}
        </div>
      )}

      {/* User's Rank Card */}
      {userRank && userRank.rank && (
        <div style={{ 
          margin: "2rem 0",
          padding: "1.5rem",
          backgroundColor: "#ebf8ff",
          border: "2px solid #3182ce",
          borderRadius: "12px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#2c5282", marginBottom: "0.25rem" }}>Your Rank</div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#2c5282" }}>
                #{userRank.rank}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#2c5282" }}>
                Top {userRank.percentile}% of {userRank.total} students
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#38a169" }}>
                {userRank.xp} XP
              </div>
              <div style={{ fontSize: "0.875rem", color: "#2c5282" }}>
                Level {userRank.level}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <section style={{ marginTop: "2rem" }}>
        {leaderboard.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem 2rem", 
            backgroundColor: "#f7f9fc", 
            borderRadius: "12px" 
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>No Rankings Yet</h3>
            <p style={{ color: "#718096" }}>Be the first to complete quizzes and claim the top spot!</p>
          </div>
        ) : (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            {leaderboard.map((student, index) => {
              const isCurrentUser = student.userId === profile?.uid;
              const rank = index + 1;
              const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
              
              return (
                <div
                  key={student.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr auto",
                    gap: "1rem",
                    padding: "1.25rem",
                    borderBottom: index < leaderboard.length - 1 ? "1px solid #e2e8f0" : "none",
                    backgroundColor: isCurrentUser ? "#f7fafc" : "transparent",
                    alignItems: "center"
                  }}
                >
                  {/* Rank */}
                  <div style={{ 
                    fontSize: rank <= 3 ? "2rem" : "1.25rem",
                    fontWeight: "700",
                    color: rank <= 3 ? "transparent" : "#718096",
                    textAlign: "center"
                  }}>
                    {rank <= 3 ? medals[rank] : `#${rank}`}
                  </div>
                  
                  {/* Student Info */}
                  <div>
                    <div style={{ 
                      fontSize: "1.125rem", 
                      fontWeight: "600",
                      color: "#2d3748",
                      marginBottom: "0.25rem"
                    }}>
                      {student.userName}
                      {isCurrentUser && (
                        <span style={{ 
                          marginLeft: "0.5rem",
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "#3182ce",
                          color: "white",
                          borderRadius: "4px"
                        }}>
                          You
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#718096" }}>
                      Level {student.level} • {student.totalQuizzes || 0} quizzes completed
                      {student.streak > 0 && ` • 🔥 ${student.streak} day streak`}
                    </div>
                  </div>
                  
                  {/* XP */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ 
                      fontSize: "1.5rem", 
                      fontWeight: "700", 
                      color: "#38a169" 
                    }}>
                      {student.xp}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#a0aec0", textTransform: "uppercase" }}>
                      XP
                    </div>
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

export default LeaderboardPage;
