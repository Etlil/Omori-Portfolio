'use client';

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-omori), sans-serif',
      fontSize: '24px',
      zIndex: 20000,
    }}>
      Loading…
    </div>
  );
}
