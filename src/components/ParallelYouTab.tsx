import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ModelCategory } from '@runanywhere/web';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import { useModelLoader } from '../hooks/useModelLoader';

interface SimulationPath {
  title: string;
  year1: string;
  year5: string;
  year10: string;
  pros: string;
  cons: string;
}

interface SimulationResults {
  paths: SimulationPath[];
}

export function ParallelYouTab() {
  const llmLoader = useModelLoader(ModelCategory.Language);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSimulation = useCallback(async () => {
    if (!input.trim()) {
      setError('Please enter a decision or life choice');
      return;
    }

    if (llmLoader.state !== 'ready') {
      const ok = await llmLoader.ensure();
      if (!ok) return;
    }

    setSimulating(true);
    setError(null);
    setResults(null);

    const systemPrompt = `You are a life path simulator. Analyze decisions and show realistic outcomes.`;

    const prompt = `Analyze this life choice: "${input}"

Create two different paths (Safe/Risky or Conservative/Bold - choose what fits best).

Answer these questions for EACH path:

PATH 1 - Safe/Conservative Path:
1. Path 1 title (2-3 words):
2. Path 1 - 1 year outcome:
3. Path 1 - 5 years outcome:
4. Path 1 - 10 years outcome:
5. Path 1 - Main pros:
6. Path 1 - Main cons:

PATH 2 - Risky/Bold Path:
7. Path 2 title (2-3 words):
8. Path 2 - 1 year outcome:
9. Path 2 - 5 years outcome:
10. Path 2 - 10 years outcome:
11. Path 2 - Main pros:
12. Path 2 - Main cons:

Keep each answer under 15 words. Be realistic.`;

    try {
      const response = await TextGeneration.generate(prompt, {
        maxTokens: 600,
        temperature: 0.7,
        systemPrompt,
      });

      const text = response.text.trim();
      console.log('Raw response:', text);

      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      const extractAnswer = (questionNum: number): string => {
        const line = lines.find(l => l.startsWith(`${questionNum}.`));
        if (!line) return '';
        const match = line.match(/^\d+\.\s*(?:.*?:)?\s*(.+)$/);
        return match ? match[1].trim() : '';
      };

      const parsed: SimulationResults = {
        paths: [
          {
            title: '🛡️ ' + (extractAnswer(1) || 'Safe Path'),
            year1: extractAnswer(2) || 'Steady progress with minimal risk',
            year5: extractAnswer(3) || 'Stable growth and predictable outcomes',
            year10: extractAnswer(4) || 'Comfortable position with security',
            pros: extractAnswer(5) || 'Stability, low risk',
            cons: extractAnswer(6) || 'Limited upside'
          },
          {
            title: '🚀 ' + (extractAnswer(7) || 'Risky Path'),
            year1: extractAnswer(8) || 'High uncertainty but learning fast',
            year5: extractAnswer(9) || 'Either significant success or valuable lessons',
            year10: extractAnswer(10) || 'Major achievement or pivot experience',
            pros: extractAnswer(11) || 'High potential, independence',
            cons: extractAnswer(12) || 'Uncertainty, stress'
          }
        ]
      };

      console.log('Parsed results:', parsed);
      setResults(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate simulation');
      console.error('Error:', err);
    } finally {
      setSimulating(false);
    }
  }, [input, llmLoader]);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setInput('');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      {/* Model Loading Indicator */}
      {llmLoader.state !== 'ready' && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 shadow-xl">
            <div className="flex items-center gap-2">
              {llmLoader.state === 'loading' && (
                <>
                  <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-purple-300">Loading AI...</span>
                  {llmLoader.progress > 0 && (
                    <span className="text-xs text-gray-400">({llmLoader.progress}%)</span>
                  )}
                </>
              )}
              {llmLoader.state === 'idle' && (
                <button 
                  onClick={llmLoader.ensure}
                  className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                >
                  ⚡ Load AI Model
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
          Parallel You 🌌
        </h1>
        <p className="text-gray-400 mt-2">
          Explore alternate realities of your life decisions
        </p>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-2xl mx-auto mb-10"
      >
        <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What if I chose a different path in life...

Examples:
• Should I stay at my job or start my own business?
• Should I move abroad or stay in my hometown?
• Should I pursue higher education or start working?"
            className="w-full p-4 rounded-xl bg-transparent border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 min-h-[120px] resize-none"
            disabled={simulating}
          />
          <button
            onClick={generateSimulation}
            disabled={simulating || !input.trim()}
            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {simulating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Simulating...
              </span>
            ) : (
              '⚡ Explore Parallel Lives'
            )}
          </button>
        </div>
      </motion.div>

      {/* Quick Examples */}
      {!results && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <h3 className="text-center text-sm text-gray-400 mb-4">Quick Examples:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { emoji: '💼', label: 'Career', prompt: 'Should I stay at my stable corporate job or quit and start my own business?' },
              { emoji: '🏠', label: 'Housing', prompt: 'Should I buy a house now or keep renting and invest in stocks?' },
              { emoji: '🌍', label: 'Travel', prompt: 'Should I move abroad for better opportunities or stay close to family?' },
              { emoji: '🎓', label: 'Education', prompt: 'Should I pursue a PhD or join the tech industry with a master\'s degree?' }
            ].map((ex, idx) => (
              <button
                key={idx}
                onClick={() => setInput(ex.prompt)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl p-3 transition text-center"
              >
                <div className="text-2xl mb-1">{ex.emoji}</div>
                <div className="text-xs text-gray-400">{ex.label}</div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      {results && (
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <p className="text-gray-400 mb-2">Your decision:</p>
            <p className="text-xl font-semibold text-purple-400">{input}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {results.paths.map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl hover:scale-105 transition-transform"
              >
                <h2 className="text-2xl font-bold mb-4 text-purple-400">
                  {path.title}
                </h2>

                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>1 Year:</strong> {path.year1}</p>
                  <p><strong>5 Years:</strong> {path.year5}</p>
                  <p><strong>10 Years:</strong> {path.year10}</p>
                </div>

                <div className="mt-4 text-sm space-y-1">
                  <p className="text-green-400">
                    <strong>✓ Pros:</strong> {path.pros}
                  </p>
                  <p className="text-red-400">
                    <strong>✗ Cons:</strong> {path.cons}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={reset}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 px-6 py-3 rounded-xl transition"
            >
              ← Explore Another Decision
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
