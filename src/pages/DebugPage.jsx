import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import AppShell from "../components/AppShell";
import { useAuthSession } from "../hooks/useAuthSession";

function DebugPage() {
  const { profile } = useAuthSession();
  const [testResult, setTestResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function testFirebaseWrite() {
    setLoading(true);
    setTestResult("Testing...");
    
    try {
      // Test 1: Write to Firestore
      const testRef = collection(db, "test");
      const docRef = await addDoc(testRef, {
        message: "Test from debug page",
        timestamp: serverTimestamp(),
        userId: profile?.uid || "anonymous"
      });
      
      setTestResult(prev => prev + "\n✅ Write successful! Doc ID: " + docRef.id);
      
      // Test 2: Read from Firestore
      const querySnapshot = await getDocs(testRef);
      setTestResult(prev => prev + `\n✅ Read successful! Found ${querySnapshot.size} documents`);
      
      // Test 3: Try creating a subject
      const subjectRef = collection(db, "subjects");
      const subjectDoc = await addDoc(subjectRef, {
        name: "Test Subject " + Date.now(),
        description: "Test description",
        icon: "📚",
        color: "#3182ce",
        published: false,
        topicCount: 0,
        questionCount: 0,
        createdBy: profile?.uid || "test",
        createdAt: serverTimestamp()
      });
      
      setTestResult(prev => prev + "\n✅ Subject creation successful! ID: " + subjectDoc.id);
      setTestResult(prev => prev + "\n\n🎉 All tests passed! Firebase is working correctly.");
      
    } catch (error) {
      setTestResult(prev => prev + "\n\n❌ Error: " + error.message);
      setTestResult(prev => prev + "\n\nError code: " + error.code);
      setTestResult(prev => prev + "\n\nFull error: " + JSON.stringify(error, null, 2));
      console.error("Firebase test error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function checkFirestoreRules() {
    setLoading(true);
    setTestResult("Checking Firestore rules...");
    
    try {
      // Try to read from subjects collection
      const subjectsRef = collection(db, "subjects");
      const snapshot = await getDocs(subjectsRef);
      setTestResult(prev => prev + `\n✅ Can read subjects collection (${snapshot.size} documents)`);
      
      // Try to write
      const testDoc = await addDoc(subjectsRef, {
        name: "Rule Test " + Date.now(),
        createdAt: serverTimestamp()
      });
      setTestResult(prev => prev + "\n✅ Can write to subjects collection");
      setTestResult(prev => prev + "\n\n🎉 Firestore rules are correctly configured!");
      
    } catch (error) {
      setTestResult(prev => prev + "\n\n❌ Firestore rules error: " + error.message);
      setTestResult(prev => prev + "\n\nThis means Firestore security rules are blocking access.");
      setTestResult(prev => prev + "\n\nSolution: Deploy the rules from FIRESTORE_RULES_SETUP.md");
      console.error("Rules check error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell profile={profile}>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "1rem" }}>
          🔧 Firebase Debug Page
        </h1>
        <p style={{ color: "#718096", marginBottom: "2rem" }}>
          Use this page to test Firebase connectivity and diagnose issues.
        </p>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <button
            onClick={testFirebaseWrite}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Testing..." : "Test Firebase Connection"}
          </button>

          <button
            onClick={checkFirestoreRules}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#38a169",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              opacity: loading ? 0.6 : 1
            }}
          >
            Check Firestore Rules
          </button>

          <button
            onClick={() => setTestResult("")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#e2e8f0",
              color: "#2d3748",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Clear Results
          </button>
        </div>

        {testResult && (
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#1a202c",
            color: "#e2e8f0",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            whiteSpace: "pre-wrap",
            overflowX: "auto"
          }}>
            {testResult}
          </div>
        )}

        <div style={{ marginTop: "3rem", padding: "1.5rem", backgroundColor: "#ebf8ff", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
            📋 Debug Information
          </h3>
          <div style={{ fontSize: "0.875rem", color: "#2c5282", fontFamily: "monospace" }}>
            <p><strong>User ID:</strong> {profile?.uid || "Not logged in"}</p>
            <p><strong>User Role:</strong> {profile?.role || "None"}</p>
            <p><strong>User Email:</strong> {profile?.email || "None"}</p>
            <p><strong>Firebase Project:</strong> {import.meta.env.VITE_FIREBASE_PROJECT_ID}</p>
            <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
          </div>
        </div>

        <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#fff5f5", borderRadius: "8px", border: "2px solid #fc8181" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#c53030" }}>
            ⚠️ Common Issues
          </h3>
          <ul style={{ fontSize: "0.875rem", color: "#742a2a", lineHeight: "1.75" }}>
            <li><strong>Permission denied:</strong> Firestore rules need to be deployed</li>
            <li><strong>Network error:</strong> Check internet connection</li>
            <li><strong>Invalid credentials:</strong> Check .env file configuration</li>
            <li><strong>Collection not found:</strong> Normal for first-time setup</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

export default DebugPage;
