import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '0.5rem',
        borderRadius: '8px',
        border: '2px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        width: '40px',
        height: '40px'
      }}
      onMouseEnter={(e) => {
        e.target.style.borderColor = 'var(--primary-color)';
      }}
      onMouseLeave={(e) => {
        e.target.style.borderColor = 'var(--border-color)';
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <span style={{ fontSize: '1.25rem' }}>🌙</span>
      ) : (
        <span style={{ fontSize: '1.25rem' }}>☀️</span>
      )}
    </button>
  );
}

export default ThemeToggle;
