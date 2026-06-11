import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { 
  getAllSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject, 
  toggleSubjectPublish 
} from "../services/subjectService";
import { 
  getTopicsBySubject, 
  createTopic, 
  updateTopic, 
  deleteTopic,
  toggleTopicPublish 
} from "../services/topicService";
import { createLogger } from "../utils/logger";

const logger = createLogger("SubjectManagementPage");

function SubjectManagementPage() {
  const { profile } = useAuthSession();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [generatingLesson, setGeneratingLesson] = useState(false);
  const [error, setError] = useState(null);

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    description: "",
    icon: "📚",
    color: "#3182ce"
  });

  const [topicForm, setTopicForm] = useState({
    name: "",
    description: "",
    lessonText: "",
    difficulty: "medium"
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject);
    }
  }, [selectedSubject]);

  async function loadSubjects() {
    try {
      setLoading(true);
      const data = await getAllSubjects();
      setSubjects(data);
      if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0].id);
      }
    } catch (err) {
      logger.error("Error loading subjects:", err);
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }

  async function loadTopics(subjectId) {
    try {
      const data = await getTopicsBySubject(subjectId);
      setTopics(data);
    } catch (err) {
      logger.error("Error loading topics:", err);
    }
  }

  async function handleDeleteSubject(subjectId) {
    try {
      await deleteSubject(subjectId);
      if (selectedSubject === subjectId) {
        setSelectedSubject(null);
        setTopics([]);
      }
      await loadSubjects();
    } catch (err) {
      logger.error("Error deleting subject:", err);
      alert("Failed to delete subject");
    }
  }

  async function handleCreateSubject(e) {
    e.preventDefault();
    try {
      await createSubject({
        ...subjectForm,
        createdBy: profile.uid
      });
      setShowSubjectForm(false);
      setSubjectForm({ name: "", description: "", icon: "📚", color: "#3182ce" });
      await loadSubjects();
    } catch (err) {
      logger.error("Error creating subject:", err);
      alert("Failed to create subject");
    }
  }

  async function handleCreateTopic(e) {
    e.preventDefault();
    try {
      await createTopic({
        ...topicForm,
        subjectId: selectedSubject,
        createdBy: profile.uid
      });
      setShowTopicForm(false);
      setTopicForm({ name: "", description: "", lessonText: "", difficulty: "medium" });
      await loadTopics(selectedSubject);
    } catch (err) {
      logger.error("Error creating topic:", err);
      alert("Failed to create topic");
    }
  }

  async function handleToggleSubjectPublish(subjectId, currentStatus) {
    try {
      await toggleSubjectPublish(subjectId, !currentStatus);
      await loadSubjects();
    } catch (err) {
      logger.error("Error toggling subject publish:", err);
      alert("Failed to update subject");
    }
  }

  async function handleToggleTopicPublish(topicId, currentStatus) {
    try {
      await toggleTopicPublish(topicId, !currentStatus);
      await loadTopics(selectedSubject);
    } catch (err) {
      logger.error("Error toggling topic publish:", err);
      alert("Failed to update topic");
    }
  }

  async function handleDeleteTopic(topicId) {
    try {
      await deleteTopic(topicId);
      await loadTopics(selectedSubject);
      alert("Topic deleted successfully!");
    } catch (err) {
      logger.error("Error deleting topic:", err);
      alert("Failed to delete topic");
    }
  }

  async function handleGenerateLesson() {
    if (!topicForm.name || !topicForm.description) {
      alert("Please enter topic name and description first!");
      return;
    }

    try {
      setGeneratingLesson(true);
      
      const selectedSubjectData = subjects.find(s => s.id === selectedSubject);
      const subjectName = selectedSubjectData?.name || "General";
      
      // Call backend to generate lesson content
      const response = await fetch("http://localhost:3000/api/lessons/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subjectName,
          topic: topicForm.name,
          description: topicForm.description,
          difficulty: topicForm.difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate lesson");
      }

      const data = await response.json();
      
      if (data.success && data.data.content) {
        setTopicForm({
          ...topicForm,
          lessonText: data.data.content,
        });
        alert("✨ Lesson content generated successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      logger.error("Error generating lesson:", err);
      alert("Failed to generate lesson. Make sure the backend is running on port 3000.");
    } finally {
      setGeneratingLesson(false);
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
        eyebrow="Management"
        title="Subjects & Topics"
        subtitle="Create and organize your curriculum"
      />

      {/* Subject List and Topic Management */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem", marginTop: "2rem" }}>
        {/* Subjects Sidebar */}
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "1.5rem",
            paddingBottom: "0.75rem",
            borderBottom: "2px solid #e2e8f0"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#2d3748" }}>📚 Subjects</h3>
            <button
              onClick={() => setShowSubjectForm(true)}
              style={{
                padding: "0.625rem 1.25rem",
                background: "linear-gradient(135deg, #3182ce, #2c5aa0)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                boxShadow: "0 4px 8px rgba(49, 130, 206, 0.3)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(49, 130, 206, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(49, 130, 206, 0.3)";
              }}
            >
              ✨ New Subject
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                style={{
                  padding: "1.25rem",
                  background: "#ffffff",
                  border: `3px solid ${selectedSubject === subject.id ? (subject.color || "#3182ce") : "#e2e8f0"}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: selectedSubject === subject.id ? `0 6px 16px ${subject.color || "#3182ce"}40` : "0 2px 8px rgba(0,0,0,0.08)",
                  transform: selectedSubject === subject.id ? "translateY(-4px)" : "translateY(0)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 6px 16px ${subject.color || "#3182ce"}30`;
                }}
                onMouseLeave={(e) => {
                  if (selectedSubject !== subject.id) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${subject.color || "#3182ce"}, ${subject.color || "#3182ce"}dd)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    boxShadow: `0 4px 8px ${subject.color || "#3182ce"}30`
                  }}>
                    {subject.icon}
                  </div>
                  <span style={{ fontWeight: "600", flex: 1, fontSize: "1rem", color: "#2d3748" }}>{subject.name}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#718096", marginBottom: "0.75rem", paddingLeft: "0.5rem" }}>
                  📚 {subject.topicCount || 0} topics • {subject.questionCount || 0} questions
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSubjectPublish(subject.id, subject.published);
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      background: subject.published 
                        ? "linear-gradient(135deg, #48bb78, #38a169)" 
                        : "linear-gradient(135deg, #667eea, #764ba2)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      boxShadow: subject.published 
                        ? "0 2px 8px rgba(72, 187, 120, 0.3)" 
                        : "0 2px 8px rgba(102, 126, 234, 0.3)",
                      transition: "all 0.2s",
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = subject.published 
                        ? "0 4px 12px rgba(72, 187, 120, 0.4)" 
                        : "0 4px 12px rgba(102, 126, 234, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = subject.published 
                        ? "0 2px 8px rgba(72, 187, 120, 0.3)" 
                        : "0 2px 8px rgba(102, 126, 234, 0.3)";
                    }}
                  >
                    {subject.published ? "✓ Published" : "📝 Draft"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${subject.name}"? This will also delete all its topics and questions.`)) {
                        handleDeleteSubject(subject.id);
                      }
                    }}
                    style={{
                      padding: "0.4rem 0.75rem",
                      background: "linear-gradient(135deg, #f56565, #e53e3e)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.background = "linear-gradient(135deg, #e53e3e, #c53030)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.background = "linear-gradient(135deg, #f56565, #e53e3e)";
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topics for Selected Subject */}
        <div>
          {selectedSubject && (
            <>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "1.5rem",
                paddingBottom: "0.75rem",
                borderBottom: "2px solid #e2e8f0"
              }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#2d3748" }}>
                  📑 Topics ({topics.length})
                </h3>
                <button
                  onClick={() => setShowTopicForm(true)}
                  style={{
                    padding: "0.625rem 1.25rem",
                    background: "linear-gradient(135deg, #38a169, #2f855a)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    boxShadow: "0 4px 8px rgba(56, 161, 105, 0.3)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(56, 161, 105, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(56, 161, 105, 0.3)";
                  }}
                >
                  ➕ Add Topic
                </button>
              </div>

              {topics.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#f7f9fc", borderRadius: "12px" }}>
                  <p style={{ color: "#718096" }}>No topics yet. Create your first topic!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      style={{
                        padding: "1.5rem",
                        backgroundColor: "#ffffff",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                            {topic.name}
                          </h4>
                          <p style={{ fontSize: "0.875rem", color: "#718096" }}>
                            {topic.description}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <button
                            onClick={() => handleToggleTopicPublish(topic.id, topic.published)}
                            style={{
                              padding: "0.5rem 1rem",
                              background: topic.published 
                                ? "linear-gradient(135deg, #48bb78, #38a169)" 
                                : "linear-gradient(135deg, #667eea, #764ba2)",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            {topic.published ? "✓ Published" : "📝 Draft"}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete topic "${topic.name}"? This will also delete all its questions.`)) {
                                handleDeleteTopic(topic.id);
                              }
                            }}
                            style={{
                              padding: "0.5rem 0.75rem",
                              background: "linear-gradient(135deg, #f56565, #e53e3e)",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.05)";
                              e.currentTarget.style.background = "linear-gradient(135deg, #e53e3e, #c53030)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.background = "linear-gradient(135deg, #f56565, #e53e3e)";
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#a0aec0" }}>
                        Difficulty: {topic.difficulty} • {topic.questionCount || 0} questions
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Subject Form Modal */}
      {showSubjectForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "500px",
            width: "90%"
          }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Create Subject</h3>
            <form onSubmit={handleCreateSubject}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Description
                </label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    minHeight: "80px"
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowSubjectForm(false)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#e2e8f0",
                    color: "#2d3748",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#3182ce",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Form Modal */}
      {showTopicForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Add Topic</h3>
            <form onSubmit={handleCreateTopic}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Topic Name *
                </label>
                <input
                  type="text"
                  required
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({...topicForm, name: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Description
                </label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({...topicForm, description: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    minHeight: "60px"
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Difficulty
                </label>
                <select
                  value={topicForm.difficulty}
                  onChange={(e) => setTopicForm({...topicForm, difficulty: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Lesson Content (for students to learn)
                </label>
                <textarea
                  value={topicForm.lessonText}
                  onChange={(e) => setTopicForm({...topicForm, lessonText: e.target.value})}
                  placeholder="Enter the lesson content that students will read before taking the quiz..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    minHeight: "150px",
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                    💡 This is what students will see in the "Learn" section
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateLesson}
                    disabled={!topicForm.name || !topicForm.description || generatingLesson}
                    style={{
                      padding: "0.5rem 1rem",
                      background: (!topicForm.name || !topicForm.description || generatingLesson) 
                        ? "#e2e8f0"
                        : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: (!topicForm.name || !topicForm.description || generatingLesson) ? "not-allowed" : "pointer",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (topicForm.name && topicForm.description && !generatingLesson) {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {generatingLesson ? "⏳ Generating..." : "✨ Generate Lesson with AI"}
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowTopicForm(false)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#e2e8f0",
                    color: "#2d3748",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#38a169",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default SubjectManagementPage;
