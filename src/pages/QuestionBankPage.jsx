import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getAllSubjects } from "../services/subjectService";
import { getTopicsBySubject } from "../services/topicService";
import { getQuestionsByTopic, approveQuestion, publishQuestion, deleteQuestion } from "../services/questionService";
import { createLogger } from "../utils/logger";

const logger = createLogger("QuestionBankPage");

function QuestionBankPage() {
  const { profile } = useAuthSession();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopic) {
      loadQuestions(selectedTopic);
    }
  }, [selectedTopic]);

  async function loadSubjects() {
    try {
      setLoading(true);
      const data = await getAllSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].id);
      }
    } catch (err) {
      logger.error("Error loading subjects:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTopics(subjectId) {
    try {
      const data = await getTopicsBySubject(subjectId);
      setTopics(data);
      if (data.length > 0) {
        setSelectedTopic(data[0].id);
      }
    } catch (err) {
      logger.error("Error loading topics:", err);
    }
  }

  async function loadQuestions(topicId) {
    try {
      const data = await getQuestionsByTopic(topicId, null);
      setQuestions(data);
    } catch (err) {
      logger.error("Error loading questions:", err);
    }
  }

  async function handleApprove(questionId) {
    try {
      await approveQuestion(questionId, profile.uid);
      await loadQuestions(selectedTopic);
    } catch (err) {
      logger.error("Error approving question:", err);
      alert("Failed to approve question");
    }
  }

  async function handlePublish(questionId) {
    try {
      await publishQuestion(questionId, profile.uid);
      await loadQuestions(selectedTopic);
    } catch (err) {
      logger.error("Error publishing question:", err);
      alert("Failed to publish question");
    }
  }

  async function handleDelete(questionId) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    
    try {
      await deleteQuestion(questionId);
      await loadQuestions(selectedTopic);
    } catch (err) {
      logger.error("Error deleting question:", err);
      alert("Failed to delete question");
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="Question Bank"
        title="Manage Questions"
        subtitle="Review, approve, and publish quiz questions"
      />

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2rem", marginTop: "2rem" }}>
        {/* Sidebar */}
        <div>
          {/* Subject Selector */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.75rem", color: "#718096" }}>
              SUBJECT
            </h3>
            {subjects.map(subject => (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                style={{
                  padding: "0.75rem 1rem",
                  background: selectedSubject === subject.id 
                    ? "linear-gradient(135deg, #ffffff, #f7fafc)"
                    : "#2d3748",
                  border: selectedSubject === subject.id ? "2px solid #3182ce" : "2px solid #4a5568",
                  borderRadius: "10px",
                  cursor: "pointer",
                  marginBottom: "0.5rem",
                  fontWeight: selectedSubject === subject.id ? "700" : "500",
                  color: selectedSubject === subject.id ? "#1a202c" : "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                  boxShadow: selectedSubject === subject.id ? "0 4px 12px rgba(49, 130, 206, 0.3)" : "none"
                }}
                onMouseEnter={(e) => {
                  if (selectedSubject !== subject.id) {
                    e.currentTarget.style.background = "#374151";
                    e.currentTarget.style.borderColor = "#6b7280";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSubject !== subject.id) {
                    e.currentTarget.style.background = "#2d3748";
                    e.currentTarget.style.borderColor = "#4a5568";
                  }
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>{subject.icon}</span>
                <span>{subject.name}</span>
              </div>
            ))}
          </div>

          {/* Topic Selector */}
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.75rem", color: "#718096" }}>
              TOPIC
            </h3>
            {topics.map(topic => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                style={{
                  padding: "0.75rem 1rem",
                  background: selectedTopic === topic.id 
                    ? "linear-gradient(135deg, #ffffff, #f7fafc)"
                    : "#2d3748",
                  border: selectedTopic === topic.id ? "2px solid #38a169" : "2px solid #4a5568",
                  borderRadius: "10px",
                  cursor: "pointer",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: selectedTopic === topic.id ? "700" : "500",
                  color: selectedTopic === topic.id ? "#1a202c" : "#e2e8f0",
                  transition: "all 0.2s",
                  boxShadow: selectedTopic === topic.id ? "0 4px 12px rgba(56, 161, 105, 0.3)" : "none"
                }}
                onMouseEnter={(e) => {
                  if (selectedTopic !== topic.id) {
                    e.currentTarget.style.background = "#374151";
                    e.currentTarget.style.borderColor = "#6b7280";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTopic !== topic.id) {
                    e.currentTarget.style.background = "#2d3748";
                    e.currentTarget.style.borderColor = "#4a5568";
                  }
                }}
              >
                {topic.name}
              </div>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div>
          {questions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#f7f9fc", borderRadius: "12px" }}>
              <p style={{ color: "#718096" }}>No questions found for this topic.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "1.5rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <span style={{ fontWeight: "600", fontSize: "1.125rem" }}>
                      Question {index + 1}
                    </span>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: 
                        question.status === "published" ? "#d4edda" :
                        question.status === "approved" ? "#fff3cd" : "#f8d7da",
                      color:
                        question.status === "published" ? "#155724" :
                        question.status === "approved" ? "#856404" : "#721c24",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      textTransform: "uppercase"
                    }}>
                      {question.status}
                    </span>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontWeight: "600", marginBottom: "0.75rem" }}>{question.question}</div>
                    <div style={{ paddingLeft: "1rem" }}>
                      {question.options.map((opt, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "0.5rem",
                            marginBottom: "0.25rem",
                            backgroundColor: i === question.correctAnswer ? "#d4edda" : "#f7f9fc",
                            borderRadius: "4px",
                            fontSize: "0.875rem"
                          }}
                        >
                          {String.fromCharCode(65 + i)}. {opt}
                          {i === question.correctAnswer && " ✓"}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", color: "#718096", marginBottom: "1rem" }}>
                    <span>Difficulty: {question.difficulty}</span>
                    <span>•</span>
                    <span>Source: {question.source}</span>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {question.status === "draft" && (
                      <button
                        onClick={() => handleApprove(question.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#ffc107",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: "600"
                        }}
                      >
                        Approve
                      </button>
                    )}
                    {(question.status === "approved" || question.status === "draft") && (
                      <button
                        onClick={() => handlePublish(question.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: "600"
                        }}
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(question.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "600"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default QuestionBankPage;
