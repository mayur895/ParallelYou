import { useState, useEffect } from 'react';
import { initSDK } from './runanywhere';
import { ParallelYouTab } from './components/ParallelYouTab';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DownloadAllModels } from './components/DownloadAllModels';

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  useEffect(() => {
    initSDK()
      .then(() => setSdkReady(true))
      .catch((err) => setSdkError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (sdkError) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, black, #1a1a2e)',
        color: 'white',
        padding: '2rem'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>SDK Error</h2>
        <p style={{ color: '#fca5a5' }}>{sdkError}</p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, black, #1a1a2e)',
        color: 'white',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #333',
          borderTop: '4px solid #a855f7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <h2>Loading RunAnywhere SDK...</h2>
        <p style={{ color: '#9ca3af' }}>Initializing on-device AI engine</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Global offline toast — always visible regardless of active tab */}
      <OfflineIndicator />

      {/* Download All Models button — fixed top-right corner */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 500 }}>
        <DownloadAllModels />
      </div>

      <ParallelYouTab />
    </>
  );
}

