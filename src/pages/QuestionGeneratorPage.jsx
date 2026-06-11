import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { getAllSubjects } from "../services/subjectService";
import { getTopicsBySubject } from "../services/topicService";
import { bulkCreateQuestions } from "../services/questionService";
import api from "../config/api";
import { createLogger } from "../utils/logger";

const logger = createLogger("QuestionGeneratorPage");

function QuestionGeneratorPage() {
  const { profile } = useAuthSession();
  const navigate = useNavigate();
  
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  
  const [formData, setFormData] = useState({
    subjectId: "",
    topicId: "",
    difficulty: "medium",
    count: 5,
    lessonText: ""
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (formData.subjectId) {
      loadTopics(formData.subjectId);
    }
  }, [formData.subjectId]);

  async function loadSubjects() {
    try {
      setLoading(true);
      const data = await getAllSubjects();
      logger.info("Loaded subjects:", data.length);
      setSubjects(data);
    } catch (err) {
      logger.error("Error loading subjects:", err);
      alert("Failed to load subjects: " + err.message);
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
      alert("Failed to load topics");
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    
    if (!formData.subjectId || !formData.topicId) {
      alert("Please select a subject and topic");
      return;
    }

    try {
      setGenerating(true);
      
      const selectedSubject = subjects.find(s => s.id === formData.subjectId);
      const selectedTopic = topics.find(t => t.id === formData.topicId);
      
      // Call backend API to generate questions
      const response = await api.generateQuestions({
        subject: selectedSubject.name,
        topic: selectedTopic.name,
        classLevel: "Grade 8",
        difficulty: formData.difficulty,
        count: formData.count,
        lessonText: formData.lessonText
      });
      
      if (response.success && response.data.questions) {
        // Format questions for Firestore
        const formattedQuestions = response.data.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          topicId: formData.topicId,
          subjectId: formData.subjectId,
          difficulty: formData.difficulty,
          status: "draft",
          source: "ai-generated",
          createdBy: profile.uid
        }));
        
        setGeneratedQuestions(formattedQuestions);
      } else {
        throw new Error("Invalid response from API");
      }
      
    } catch (err) {
      logger.error("Error generating questions:", err);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveQuestions() {
    try {
      await bulkCreateQuestions(generatedQuestions);
      alert(`Successfully saved ${generatedQuestions.length} questions!`);
      setGeneratedQuestions([]);
      setFormData({
        subjectId: "",
        topicId: "",
        difficulty: "medium",
        count: 5,
        lessonText: ""
      });
    } catch (err) {
      logger.error("Error saving questions:", err);
      alert("Failed to save questions");
    }
  }

  if (loading) {
    return (
      <AppShell profile={profile}>
        <PageHeader
          eyebrow="AI Generator"
          title="Question Generator"
          subtitle="Loading subjects..."
        />
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="spinner" style={{
            width: "50px",
            height: "50px",
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #3182ce",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1rem"
          }}></div>
          <p style={{ color: "#718096" }}>Loading subjects and topics...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="AI Generator"
        title="Question Generator"
        subtitle="Use AI to create quiz questions automatically"
      />

      {subjects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#f7f9fc", borderRadius: "12px", marginTop: "2rem" }}>
          <p style={{ color: "#718096", marginBottom: "1rem" }}>No subjects available. Create subjects first!</p>
          <button
            onClick={() => navigate("/subjects")}
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
            Go to Subject Management
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
          {/* Generator Form */}
          <div style={{
            backgroundColor: "#ffffff",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            padding: "2rem"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
              Generate Questions
            </h3>
            
            <form onSubmit={handleGenerate}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Subject *
                </label>
                <select
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({...formData, subjectId: e.target.value, topicId: ""})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                >
                  <option value="">Select a subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Topic *
                </label>
                <select
                  required
                  value={formData.topicId}
                  onChange={(e) => setFormData({...formData, topicId: e.target.value})}
                  disabled={!formData.subjectId}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                >
                  <option value="">Select a topic</option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
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

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Number of Questions (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.count}
                  onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                  Lesson Text (Optional)
                </label>
                <textarea
                  value={formData.lessonText}
                  onChange={(e) => setFormData({...formData, lessonText: e.target.value})}
                  placeholder="Paste lesson content here to generate contextual questions..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    minHeight: "120px",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                style={{
                  width: "100%",
                  padding: "1rem",
                  backgroundColor: generating ? "#cbd5e0" : "#38a169",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: generating ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "1rem"
                }}
              >
                {generating ? "Generating..." : "🤖 Generate Questions"}
              </button>
            </form>
          </div>

          {/* Generated Questions Preview */}
          <div style={{
            backgroundColor: "#ffffff",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            padding: "2rem",
            maxHeight: "calc(100vh - 250px)",
            overflowY: "auto"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
              Generated Questions ({generatedQuestions.length})
            </h3>

            {generatedQuestions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#718096" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
                <p>No questions generated yet.</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  Fill the form and click Generate
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "1.5rem" }}>
                  {generatedQuestions.map((q, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "1rem",
                        backgroundColor: "#f7f9fc",
                        borderRadius: "8px",
                        marginBottom: "1rem"
                      }}
                    >
                      <div style={{ fontWeight: "600", marginBottom: "0.75rem" }}>
                        {index + 1}. {q.question}
                      </div>
                      <div style={{ paddingLeft: "1rem" }}>
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "0.5rem",
                              marginBottom: "0.25rem",
                              backgroundColor: i === q.correctAnswer ? "#d4edda" : "transparent",
                              borderRadius: "4px",
                              fontSize: "0.875rem"
                            }}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                            {i === q.correctAnswer && " ✓"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveQuestions}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    backgroundColor: "#3182ce",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}
                >
                  💾 Save Questions to Bank
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default QuestionGeneratorPage;
