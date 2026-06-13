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
  const [view, setView] = useState('subjects'); // 'subjects', 'topics', 'questions'

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject);
      setView('topics');
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopic) {
      loadQuestions(selectedTopic);
      setView('questions');
    }
  }, [selectedTopic]);

  async function loadSubjects() {
    try {
      setLoading(true);
      const data = await getAllSubjects();
      setSubjects(data);
      // Don't auto-select - let teacher choose
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
      // Don't auto-select - let teacher choose
      setSelectedTopic(null); // Clear any previous topic selection
      setQuestions([]); // Clear questions when changing subject
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

      {/* Breadcrumb Navigation */}
      {(selectedSubject || selectedTopic) && (
        <div style={{ marginTop: "1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
          <button
            onClick={() => {
              setSelectedSubject(null);
              setSelectedTopic(null);
              setView('subjects');
            }}
            style={{
              background: "none",
              border: "none",
              color: "#3182ce",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.875rem"
            }}
          >
            All Subjects
          </button>
          {selectedSubject && (
            <>
              <span style={{ color: "#718096" }}>›</span>
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setView('topics');
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: selectedTopic ? "#3182ce" : "#2d3748",
                  cursor: selectedTopic ? "pointer" : "default",
                  textDecoration: selectedTopic ? "underline" : "none",
                  fontSize: "0.875rem",
                  fontWeight: selectedTopic ? "normal" : "600"
                }}
              >
                {subjects.find(s => s.id === selectedSubject)?.name || 'Subject'}
              </button>
            </>
          )}
          {selectedTopic && (
            <>
              <span style={{ color: "#718096" }}>›</span>
              <span style={{ color: "#2d3748", fontWeight: "600" }}>
                {topics.find(t => t.id === selectedTopic)?.name || 'Topic'}
              </span>
            </>
          )}
        </div>
      )}

      {/* Subjects View - Card Grid */}
      {view === 'subjects' && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1.5rem", color: "#2d3748" }}>
            Select a Subject
          </h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {subjects.map(subject => (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                style={{
                  padding: "2rem",
                  backgroundColor: "#ffffff",
                  border: "2px solid #e2e8f0",
                  borderRadius: "16px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = "#3182ce";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(49, 130, 206, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{subject.icon}</div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem", color: "#2d3748" }}>
                  {subject.name}
                </h4>
                <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "1rem" }}>
                  {subject.description || 'Click to view topics'}
                </p>
                <div style={{ fontSize: "0.75rem", color: "#a0aec0" }}>
                  {subject.topicCount || 0} topics
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics View - Card Grid */}
      {view === 'topics' && selectedSubject && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1.5rem", color: "#2d3748" }}>
            Select a Topic
          </h3>
          {topics.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#f7f9fc", borderRadius: "12px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📑</div>
              <p style={{ color: "#718096" }}>No topics available for this subject.</p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
              gap: "1.5rem" 
            }}>
              {topics.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  style={{
                    padding: "1.5rem",
                    backgroundColor: "#ffffff",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "#38a169";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(56, 161, 105, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "start", gap: "1rem" }}>
                    <div style={{ fontSize: "2rem" }}>📑</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem", color: "#2d3748" }}>
                        {topic.name}
                      </h4>
                      <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.75rem" }}>
                        {topic.description || 'Click to view questions'}
                      </p>
                      <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#a0aec0" }}>
                        <span>Difficulty: {topic.difficulty}</span>
                        <span>•</span>
                        <span>{topic.questionCount || 0} questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Questions View - List */}
      {view === 'questions' && selectedTopic && (
        <div style={{ marginTop: "2rem" }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#f7f9fc", borderRadius: "12px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📝</div>
              <p style={{ color: "#718096", marginBottom: "0.5rem" }}>
                No questions found for this topic.
              </p>
              <p style={{ color: "#a0aec0", fontSize: "0.875rem" }}>
                Go to the Generate page to create questions with AI
              </p>
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
      )}
    </AppShell>
  );
}

export default QuestionBankPage;
