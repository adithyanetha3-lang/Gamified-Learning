import { Suspense } from "react";
import AppRouter from "./routes/AppRouter";
import ErrorBoundary from "./utils/errorBoundary";
import "./i18n/config"; // Initialize i18n

// Loading fallback component
function AppLoader() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#f7f7f7",
    }}>
      <div style={{
        textAlign: "center",
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #3182ce",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 1rem",
        }}></div>
        <p style={{ color: "#4a5568" }}>Loading...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoader />}>
        <AppRouter />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
