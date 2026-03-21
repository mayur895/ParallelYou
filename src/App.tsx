import { useEffect, useState } from 'react';
import { initSDK } from './runanywhere';
import { ParallelYouTab } from './components/ParallelYouTab';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center text-white p-8">
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-3xl p-8 max-w-md text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold mb-4">SDK Error</h2>
          <p className="text-red-200">{sdkError}</p>
        </div>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-24 h-24 bg-gradient-to-r from-purple-600 to-orange-600 rounded-full flex items-center justify-center text-4xl">
              🔮
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Loading Parallel You
          </h2>
          <p className="text-gray-400">Initializing on-device AI engine...</p>
        </div>
      </div>
    );
  }

  return <ParallelYouTab />;
}
