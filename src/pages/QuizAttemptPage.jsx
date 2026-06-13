import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getTopic } from "../services/topicService";
import { getPublishedQuestions } from "../services/questionService";
import { startQuizAttempt, submitAnswer, completeQuiz } from "../services/quizService";
import { addXP, updateTopicProgress, updateSubjectProgress } from "../services/progressService";
import { createLogger } from "../utils/logger";

const logger = createLogger("QuizAttemptPage");

function QuizAttemptPage() {
  const { profile } = useAuthSession();
  const { quizId } = useParams(); // This is actually topicId
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  async function loadQuizData() {
    try {
      setLoading(true);
      setError(null);
      
      const [topicData, questionsData] = await Promise.all([
        getTopic(quizId),
        getPublishedQuestions(quizId),
      ]);
      
      if (!topicData) {
        setError("Quiz not found");
        return;
      }
      
      if (!questionsData || questionsData.length === 0) {
        setError("No questions available for this quiz");
        return;
      }
      
      setTopic(topicData);
      setQuestions(questionsData);
      
      // Start quiz attempt
      const newAttemptId = await startQuizAttempt({
        userId: profile.uid,
        userName: profile.name,
        topicId: topicData.id,
        topicName: topicData.name,
        subjectId: topicData.subjectId,
        subjectName: topicData.subjectName || "Subject",
        questions: questionsData.map(q => q.id),
      });
      
      setAttemptId(newAttemptId);
      
    } catch (err) {
      logger.error("Error loading quiz:", err);
      setError("Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectAnswer(questionId, answerIndex) {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  }

  async function handleNextQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestion.id];
    
    if (userAnswer === undefined) {
      alert("Please select an answer before continuing");
      return;
    }
    
    // Submit answer to Firestore
    const isCorrect = userAnswer === currentQuestion.correctAnswer;
    
    try {
      await submitAnswer(attemptId, currentQuestion.id, userAnswer, isCorrect);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Last question, show submit button
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (err) {
      logger.error("Error submitting answer:", err);
      alert("Failed to save answer. Please try again.");
    }
  }

  async function handleSubmitQuiz() {
    try {
      setSubmitting(true);
      
      // Complete quiz and get results
      const quizResults = await completeQuiz(attemptId, profile.uid);
      
      logger.info("Quiz completed, updating progress...", quizResults);
      
      // Update student progress
      await updateTopicProgress(
        profile.uid,
        topic.id,
        topic.name,
        quizResults.score,
        quizResults.correctAnswers,
        quizResults.totalQuestions
      );
      
      logger.info("Topic progress updated");
      
      // Add XP to student
      const xpResult = await addXP(profile.uid, quizResults.xpEarned, "quiz");
      logger.info("XP added:", xpResult);
      
      // Update subject progress
      await updateSubjectProgress(
        profile.uid,
        topic.subjectId,
        topic.subjectName || "Subject",
        quizResults.xpEarned
      );
      
      logger.info("Subject progress updated");
      
      setResults(quizResults);
      setCompleted(true);
      
    } catch (err) {
      logger.error("Error submitting quiz:", err);
      console.error("Quiz submission error details:", err);
      alert(`Failed to submit quiz: ${err.message}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !topic) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#e53e3e" }}>Error</h2>
          <p style={{ color: "#718096", marginBottom: "2rem" }}>{error}</p>
          <button
            onClick={() => navigate("/quiz")}
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
            Back to Quizzes
          </button>
        </div>
      </AppShell>
    );
  }

  // Results screen
  if (completed && results) {
    const percentage = results.score;
    const passed = percentage >= 70;
    
    return (
      <AppShell profile={profile}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", padding: "2rem" }}>
          <div style={{ 
            fontSize: "5rem", 
            marginBottom: "1rem",
            animation: "bounce 0.6s ease-in-out"
          }}>
            {passed ? "🎉" : "💪"}
          </div>
          
          <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
            {passed ? "Great Job!" : "Keep Practicing!"}
          </h1>
          
          <p style={{ fontSize: "1.125rem", color: "#718096", marginBottom: "2rem" }}>
            {passed 
              ? "You've completed this topic successfully!" 
              : "You're making progress! Try again to improve your score."}
          </p>
          
          <div style={{ 
            backgroundColor: "#f7f9fc", 
            borderRadius: "16px", 
            padding: "2rem",
            marginBottom: "2rem"
          }}>
            <div style={{ 
              fontSize: "4rem", 
              fontWeight: "700", 
              color: passed ? "#48bb78" : "#ed8936",
              marginBottom: "0.5rem"
            }}>
              {percentage}%
            </div>
            <div style={{ fontSize: "1rem", color: "#718096", marginBottom: "1.5rem" }}>
              {results.correctAnswers} out of {results.totalQuestions} correct
            </div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #e2e8f0"
            }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#3182ce" }}>
                  +{results.xpEarned}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#718096" }}>XP Earned</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#805ad5" }}>
                  {Math.floor(results.xpEarned / 100) + 1}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#718096" }}>Level</div>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              onClick={() => navigate(`/course/${topic.subjectId}`)}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#ffffff",
                color: "#3182ce",
                border: "2px solid #3182ce",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Back to Topics
            </button>
            <button
              onClick={() => window.location.reload()}
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
            <button
              onClick={() => navigate("/leaderboard")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#48bb78",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Quiz in progress
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length;

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow={topic.name}
        title={`Question ${currentQuestionIndex + 1} of ${questions.length}`}
        subtitle={`Topic: ${topic.name} • Difficulty: ${topic.difficulty || "Medium"}`}
      />

      {/* Progress Bar */}
      <div style={{ 
        width: "100%", 
        height: "8px", 
        backgroundColor: "#e2e8f0", 
        borderRadius: "4px",
        margin: "2rem 0",
        overflow: "hidden"
      }}>
        <div style={{ 
          width: `${((currentQuestionIndex) / questions.length) * 100}%`,
          height: "100%",
          backgroundColor: "#3182ce",
          transition: "width 0.3s ease"
        }}></div>
      </div>

      {!isLastQuestion ? (
        <div style={{ 
          maxWidth: "800px", 
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "2.5rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
        }}>
          {/* Question */}
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "600", 
            marginBottom: "2rem",
            lineHeight: "1.5",
            color: "#2d3748"
          }}>
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = userAnswers[currentQuestion.id] === index;
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                  style={{
                    padding: "1.25rem",
                    backgroundColor: isSelected ? "#ebf8ff" : "#f7f9fc",
                    border: `2px solid ${isSelected ? "#3182ce" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "1rem",
                    fontWeight: isSelected ? "600" : "400",
                    color: isSelected ? "#2c5282" : "#2d3748",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "#edf2f7";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "#f7f9fc";
                  }}
                >
                  <span style={{ 
                    marginRight: "1rem",
                    display: "inline-block",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: `2px solid ${isSelected ? "#3182ce" : "#cbd5e0"}`,
                    backgroundColor: isSelected ? "#3182ce" : "transparent",
                    verticalAlign: "middle"
                  }}></span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextQuestion}
            disabled={userAnswers[currentQuestion.id] === undefined}
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: userAnswers[currentQuestion.id] !== undefined ? "#3182ce" : "#cbd5e0",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: userAnswers[currentQuestion.id] !== undefined ? "pointer" : "not-allowed",
              fontSize: "1.125rem",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            {currentQuestionIndex === questions.length - 1 ? "Review Answers" : "Next Question →"}
          </button>
        </div>
      ) : (
        // Submit confirmation
        <div style={{ 
          maxWidth: "600px", 
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "2.5rem",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
            Ready to Submit?
          </h2>
          <p style={{ color: "#718096", marginBottom: "2rem" }}>
            You've answered all {questions.length} questions. 
            Submit your quiz to see your results and earn XP!
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              onClick={() => setCurrentQuestionIndex(0)}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#ffffff",
                color: "#3182ce",
                border: "2px solid #3182ce",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Review Answers
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: submitting ? "#cbd5e0" : "#48bb78",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: "600"
              }}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default QuizAttemptPage;
