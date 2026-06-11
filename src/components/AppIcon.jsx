function AppIcon({ name }) {
  const icons = {
    learn: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6.5 12 3l8 3.5v11L12 21l-8-3.5v-11Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 3v18M4 6.5l8 3.5 8-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    courses: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="7" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="5" width="7" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    quiz: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.8 10a2.4 2.4 0 1 1 4.1 1.7c-.7.6-1.3 1-1.3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.8" r="1" fill="currentColor" />
      </svg>
    ),
    rewards: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 7H5.8A1.8 1.8 0 0 0 4 8.8C4 10.6 5.4 12 7.2 12H8m8-5h2.2A1.8 1.8 0 0 1 20 8.8c0 1.8-1.4 3.2-3.2 3.2H16" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 13v3m-3 4h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    leaderboard: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 19V9m6 10V5m6 14v-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    progress: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 17 10 12l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5v14h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    students: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 18a4.5 4.5 0 0 1 9 0m1.5 0a4 4 0 0 1 5 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    questions: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="4" width="14" height="16" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 9h6M9 13h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    publish: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v10m0-10 4 4m-4-4-4 4M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    analytics: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 19V9m5 10V5m5 14v-6m4 6H3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    bank: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10h8M8 14h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    manage: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19 12a7 7 0 0 0-.1-1.1l2-1.6-2-3.4-2.4 1a8 8 0 0 0-1.9-1.1L14.2 3h-4.4l-.4 2.8a8 8 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .7.1 1.1l-2 1.6 2 3.4 2.4-1c.6.5 1.2.8 1.9 1.1l.4 2.8h4.4l.4-2.8c.7-.3 1.3-.6 1.9-1.1l2.4 1 2-3.4-2-1.6c.1-.4.1-.7.1-1.1Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
    home: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9.5 20v-5h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  };

  return <>{icons[name] || icons.home}</>;
}

export default AppIcon;
