import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getUserProgress } from "../services/progressService";
import { createLogger } from "../utils/logger";

const logger = createLogger("RewardsPage");

// Badge definitions
const ALL_BADGES = [
  { id: "level_5", name: "Level 5 Master", icon: "🌟", description: "Reached Level 5", requirement: "Reach Level 5" },
  { id: "level_10", name: "Level 10 Champion", icon: "🏆", description: "Reached Level 10", requirement: "Reach Level 10" },
  { id: "level_20", name: "Level 20 Legend", icon: "👑", description: "Reached Level 20", requirement: "Reach Level 20" },
  { id: "streak_7", name: "Week Warrior", icon: "🔥", description: "7-day streak", requirement: "Learn 7 days in a row" },
  { id: "streak_30", name: "Month Master", icon: "💪", description: "30-day streak", requirement: "Learn 30 days in a row" },
  { id: "streak_100", name: "Unstoppable", icon: "⚡", description: "100-day streak", requirement: "Learn 100 days in a row" },
  { id: "quiz_10", name: "Quiz Starter", icon: "📝", description: "Completed 10 quizzes", requirement: "Complete 10 quizzes" },
  { id: "quiz_50", name: "Quiz Expert", icon: "🎯", description: "Completed 50 quizzes", requirement: "Complete 50 quizzes" },
  { id: "quiz_100", name: "Quiz Master", icon: "🎓", description: "Completed 100 quizzes", requirement: "Complete 100 quizzes" },
  { id: "perfect_score", name: "Perfect Score", icon: "💯", description: "100% on any quiz", requirement: "Score 100% on a quiz" },
  { id: "first_quiz", name: "First Steps", icon: "👣", description: "Completed first quiz", requirement: "Complete your first quiz" },
  { id: "speed_demon", name: "Speed Demon", icon: "⚡", description: "Complete 5 quizzes in one day", requirement: "Complete 5 quizzes in 24 hours" },
];

function RewardsPage() {
  const { profile } = useAuthSession();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRewards();
  }, [profile?.uid]);

  async function loadRewards() {
    try {
      setLoading(true);
      setError(null);
      const progressData = await getUserProgress(profile.uid);
      setProgress(progressData);
    } catch (err) {
      logger.error("Error loading rewards:", err);
      setError("Failed to load rewards. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading rewards...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !progress) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Error Loading Rewards</h2>
          <p style={{ color: "#718096", marginBottom: "2rem" }}>{error}</p>
          <button
            onClick={loadRewards}
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

  const earnedBadges = progress.badges || [];
  const earnedBadgeIds = earnedBadges.map(b => b.id);
  const lockedBadges = ALL_BADGES.filter(b => !earnedBadgeIds.includes(b.id));
  
  const xpToNextLevel = (progress.level * 100) - progress.xp;
  const percentToNextLevel = ((progress.xp % 100) / 100) * 100;

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="Rewards"
        title="Achievements & Badges"
        subtitle="Celebrate your learning milestones"
      />

      {/* Progress Summary */}
      <div style={{ 
        margin: "2rem 0",
        padding: "2rem",
        backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "16px",
        color: "white"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "2rem" }}>
          <div>
            <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>Level</div>
            <div style={{ fontSize: "3rem", fontWeight: "700" }}>{progress.level}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>Total XP</div>
            <div style={{ fontSize: "3rem", fontWeight: "700" }}>{progress.xp}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>Streak</div>
            <div style={{ fontSize: "3rem", fontWeight: "700" }}>{progress.streak} 🔥</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>Badges</div>
            <div style={{ fontSize: "3rem", fontWeight: "700" }}>{earnedBadges.length}</div>
          </div>
        </div>
        
        {/* Progress to Next Level */}
        <div style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem" }}>Progress to Level {progress.level + 1}</span>
            <span style={{ fontSize: "0.875rem" }}>{xpToNextLevel} XP needed</span>
          </div>
          <div style={{ 
            width: "100%", 
            height: "12px", 
            backgroundColor: "rgba(255,255,255,0.3)", 
            borderRadius: "6px",
            overflow: "hidden"
          }}>
            <div style={{ 
              width: `${percentToNextLevel}%`,
              height: "100%",
              backgroundColor: "white",
              transition: "width 0.3s ease"
            }}></div>
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>
          Earned Badges ({earnedBadges.length})
        </h2>
        
        {earnedBadges.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem 2rem", 
            backgroundColor: "#f7f9fc", 
            borderRadius: "12px" 
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>No Badges Yet</h3>
            <p style={{ color: "#718096" }}>Complete quizzes and maintain streaks to earn badges!</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {earnedBadges.map((badge) => {
              const badgeInfo = ALL_BADGES.find(b => b.id === badge.id) || badge;
              
              return (
                <div
                  key={badge.id}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #48bb78",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: "0 4px 12px rgba(72, 187, 120, 0.2)"
                  }}
                >
                  <div style={{ 
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "1.25rem"
                  }}>
                    ✓
                  </div>
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                    {badgeInfo.icon || badge.icon || "🏅"}
                  </div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem", color: "#2d3748" }}>
                    {badgeInfo.name || badge.name}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.75rem" }}>
                    {badgeInfo.description || badge.description}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "#a0aec0" }}>
                    Earned {new Date(badge.awardedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Locked Badges */}
      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>
          Available Badges ({lockedBadges.length})
        </h2>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {lockedBadges.map((badge) => (
            <div
              key={badge.id}
              style={{
                backgroundColor: "#f7f9fc",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center",
                opacity: 0.6,
                position: "relative"
              }}
            >
              <div style={{ 
                position: "absolute",
                top: "8px",
                right: "8px",
                fontSize: "1.25rem"
              }}>
                🔒
              </div>
              <div style={{ fontSize: "4rem", marginBottom: "1rem", filter: "grayscale(100%)" }}>
                {badge.icon}
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem", color: "#4a5568" }}>
                {badge.name}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.75rem" }}>
                {badge.description}
              </p>
              <div style={{ 
                fontSize: "0.75rem", 
                color: "#a0aec0",
                padding: "0.5rem",
                backgroundColor: "#edf2f7",
                borderRadius: "6px"
              }}>
                {badge.requirement}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Motivational Message */}
      <div style={{ 
        marginTop: "3rem",
        padding: "2rem",
        backgroundColor: "#fef5e7",
        borderRadius: "12px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⭐</div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem", color: "#744210" }}>
          Keep Learning!
        </h3>
        <p style={{ color: "#975a16" }}>
          Complete more quizzes and maintain your streak to unlock new badges and rewards.
        </p>
      </div>
    </AppShell>
  );
}

export default RewardsPage;
