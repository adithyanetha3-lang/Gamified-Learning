import { useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import { useAuthSession } from "../hooks/useAuthSession";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function DebugProgressPage() {
  const { profile } = useAuthSession();
  const [debugInfo, setDebugInfo] = useState(null);
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState(null);

  async function runDiagnostics() {
    try {
      setDebugInfo({ loading: true });
      
      const results = {
        timestamp: new Date().toISOString(),
        currentUser: {
          uid: profile.uid,
          name: profile.name,
          role: profile.role,
          email: profile.emailOrId
        },
        checks: []
      };

      // Check 1: User document exists
      const userRef = doc(db, "users", profile.uid);
      const userSnap = await getDoc(userRef);
      results.checks.push({
        name: "User Document",
        status: userSnap.exists() ? "✅ EXISTS" : "❌ MISSING",
        data: userSnap.exists() ? userSnap.data() : null
      });

      // Check 2: Progress document exists
      const progressRef = doc(db, "progress", profile.uid);
      const progressSnap = await getDoc(progressRef);
      results.checks.push({
        name: "Progress Document",
        status: progressSnap.exists() ? "✅ EXISTS" : "❌ MISSING",
        data: progressSnap.exists() ? progressSnap.data() : null
      });

      // Check 3: Progress name matches user name
      if (progressSnap.exists() && userSnap.exists()) {
        const progressName = progressSnap.data().userName;
        const actualName = userSnap.data().name;
        const matches = progressName === actualName;
        results.checks.push({
          name: "Name Match",
          status: matches ? "✅ MATCHES" : "⚠️ MISMATCH",
          data: {
            progressName: progressName,
            actualName: actualName,
            needsFix: progressName === "Student" && actualName !== "Student"
          }
        });
      }

      // Check 4: Get all progress documents count
      const allProgressRef = collection(db, "progress");
      const allProgressSnap = await getDocs(allProgressRef);
      results.checks.push({
        name: "Total Progress Docs",
        status: "ℹ️ INFO",
        data: {
          total: allProgressSnap.docs.length,
          withDefaultName: allProgressSnap.docs.filter(d => d.data().userName === "Student").length
        }
      });

      // Check 5: Get all users count
      const allUsersRef = collection(db, "users");
      const allUsersSnap = await getDocs(allUsersRef);
      const students = allUsersSnap.docs.filter(d => d.data().role === "student");
      results.checks.push({
        name: "Users Count",
        status: "ℹ️ INFO",
        data: {
          total: allUsersSnap.docs.length,
          students: students.length,
          teachers: allUsersSnap.docs.length - students.length
        }
      });

      setDebugInfo(results);
    } catch (error) {
      setDebugInfo({
        error: true,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    }
  }

  async function fixAllNames() {
    try {
      setFixing(true);
      setFixResult(null);

      // Get all users
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      
      // Get all progress documents
      const progressRef = collection(db, "progress");
      const progressSnapshot = await getDocs(progressRef);
      
      const updates = [];
      
      // For each progress document
      for (const progressDoc of progressSnapshot.docs) {
        const progressData = progressDoc.data();
        const userId = progressDoc.id;
        
        // Find the corresponding user
        const userDoc = usersSnapshot.docs.find(u => u.id === userId);
        
        if (userDoc) {
          const userData = userDoc.data();
          const actualName = userData.name || userData.displayName || "Student";
          
          // If the current name is "Student" and we have a real name, update it
          if (progressData.userName === "Student" && actualName !== "Student") {
            const docRef = doc(db, "progress", userId);
            await updateDoc(docRef, {
              userName: actualName
            });
            updates.push({
              userId,
              oldName: progressData.userName,
              newName: actualName
            });
          }
        }
      }
      
      setFixResult({
        success: true,
        updated: updates.length,
        updates
      });
    } catch (error) {
      setFixResult({
        success: false,
        error: error.message
      });
    } finally {
      setFixing(false);
    }
  }

  if (!profile || profile.role !== "teacher") {
    return (
      <AppShell profile={profile}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>This page is only accessible to teachers.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile}>
      <PageHeader
        eyebrow="System Diagnostics"
        title="Progress Tracking Debug"
        subtitle="Diagnose and fix progress tracking issues"
      />

      <div style={{ maxWidth: "1000px", margin: "2rem auto" }}>
        {/* Actions */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          marginBottom: "2rem",
          flexWrap: "wrap"
        }}>
          <button
            onClick={runDiagnostics}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem"
            }}
          >
            🔍 Run Diagnostics
          </button>

          <button
            onClick={fixAllNames}
            disabled={fixing}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: fixing ? "#cbd5e0" : "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: fixing ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "1rem"
            }}
          >
            {fixing ? "Fixing..." : "🔧 Fix All Names"}
          </button>

          <button
            onClick={() => {
              setDebugInfo(null);
              setFixResult(null);
            }}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#718096",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem"
            }}
          >
            Clear
          </button>
        </div>

        {/* Fix Result */}
        {fixResult && (
          <div style={{
            backgroundColor: fixResult.success ? "#f0fff4" : "#fff5f5",
            border: `2px solid ${fixResult.success ? "#48bb78" : "#e53e3e"}`,
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem"
          }}>
            <h3 style={{ 
              fontSize: "1.25rem", 
              fontWeight: "600", 
              marginBottom: "1rem",
              color: fixResult.success ? "#22543d" : "#742a2a"
            }}>
              {fixResult.success ? "✅ Fix Complete" : "❌ Fix Failed"}
            </h3>
            
            {fixResult.success ? (
              <>
                <p style={{ marginBottom: "1rem" }}>
                  Updated {fixResult.updated} progress document(s)
                </p>
                {fixResult.updates.length > 0 && (
                  <div style={{ 
                    backgroundColor: "white", 
                    padding: "1rem", 
                    borderRadius: "8px",
                    maxHeight: "300px",
                    overflow: "auto"
                  }}>
                    {fixResult.updates.map((update, i) => (
                      <div key={i} style={{ 
                        padding: "0.5rem 0", 
                        borderBottom: i < fixResult.updates.length - 1 ? "1px solid #e2e8f0" : "none"
                      }}>
                        <code style={{ fontSize: "0.875rem" }}>
                          "{update.oldName}" → "{update.newName}"
                        </code>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: "#742a2a" }}>Error: {fixResult.error}</p>
            )}
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <div style={{
            backgroundColor: "#ffffff",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            padding: "2rem"
          }}>
            {debugInfo.loading ? (
              <div style={{ textAlign: "center" }}>
                <div className="spinner"></div>
                <p>Running diagnostics...</p>
              </div>
            ) : debugInfo.error ? (
              <div>
                <h3 style={{ color: "#e53e3e", fontSize: "1.25rem", marginBottom: "1rem" }}>
                  ❌ Error
                </h3>
                <p style={{ color: "#742a2a", marginBottom: "0.5rem" }}>
                  {debugInfo.message}
                </p>
                <pre style={{ 
                  backgroundColor: "#f7f9fc", 
                  padding: "1rem", 
                  borderRadius: "8px",
                  overflow: "auto",
                  fontSize: "0.875rem"
                }}>
                  {debugInfo.stack}
                </pre>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
                  Diagnostic Results
                </h3>
                
                <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "1.5rem" }}>
                  {debugInfo.timestamp}
                </p>

                <div style={{ marginBottom: "2rem" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Current User
                  </h4>
                  <pre style={{ 
                    backgroundColor: "#f7f9fc", 
                    padding: "1rem", 
                    borderRadius: "8px",
                    overflow: "auto",
                    fontSize: "0.875rem"
                  }}>
                    {JSON.stringify(debugInfo.currentUser, null, 2)}
                  </pre>
                </div>

                {debugInfo.checks.map((check, i) => (
                  <div key={i} style={{ marginBottom: "1.5rem" }}>
                    <h4 style={{ 
                      fontSize: "1rem", 
                      fontWeight: "600", 
                      marginBottom: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}>
                      {check.name}
                      <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                        {check.status}
                      </span>
                    </h4>
                    <pre style={{ 
                      backgroundColor: "#f7f9fc", 
                      padding: "1rem", 
                      borderRadius: "8px",
                      overflow: "auto",
                      fontSize: "0.875rem"
                    }}>
                      {JSON.stringify(check.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Instructions */}
        {!debugInfo && !fixResult && (
          <div style={{
            backgroundColor: "#f7f9fc",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            padding: "2rem"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
              How to Use
            </h3>
            
            <ol style={{ lineHeight: "1.8", paddingLeft: "1.5rem" }}>
              <li>
                <strong>Run Diagnostics:</strong> Check the current state of progress tracking for all users
              </li>
              <li>
                <strong>Fix All Names:</strong> Automatically update all progress documents with "Student" name to use actual user names
              </li>
              <li>
                Review the results and check if leaderboard/track pages now work
              </li>
            </ol>

            <div style={{ 
              marginTop: "1.5rem", 
              padding: "1rem", 
              backgroundColor: "#fff5e6",
              borderRadius: "8px"
            }}>
              <p style={{ fontSize: "0.875rem", color: "#744210" }}>
                <strong>⚠️ Note:</strong> The "Fix All Names" button will update all progress documents in Firestore. Make sure you have a backup before running this operation.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default DebugProgressPage;
