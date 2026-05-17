import { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  ChevronRight, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  Scale,
  BrainCircuit,
  CheckCircle2,
  Fingerprint,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnalysisResult } from './types.ts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function NLPMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-mono uppercase">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-300 font-bold">{value}%</span>
      </div>
      <div className="h-1 bg-slate-900 rounded-full overflow-hidden flex">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full", color)}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const isUrl = input.trim().startsWith('http');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isUrl ? { url: input } : { text: input }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Analysis failed. Please try again.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen font-body selection:bg-indigo-500/30 selection:text-indigo-200">
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-24">
        {/* Simple Header */}
        <header className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6"
          >
            <ShieldCheck size={12} />
            <span>AI Verification Protocol</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 font-sans">
            VeriTrust <span className="text-indigo-500">AI</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Instant credibility check for any article or URL. We decode bias and fact-verify claims in seconds.
          </p>
        </header>

        {/* Focused Input Area */}
        <section className="mb-16">
          <motion.div 
            layout
            className="glass-panel p-2 rounded-2xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)] focus-within:shadow-[0_0_50px_-12px_rgba(99,102,241,0.4)] transition-all duration-500 ring-1 ring-inset ring-white/5 focus-within:ring-indigo-500/50"
          >
            <div className="flex flex-col">
              <div className="relative">
                <div className="absolute left-4 top-5 text-slate-500">
                  <FileSearch size={22} strokeWidth={1.5} />
                </div>
                <textarea
                  placeholder="Paste article URL or content..."
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 pl-14 py-5 pr-4 text-lg transition-all resize-none min-h-[72px]"
                  style={{ height: input.length > 100 ? '160px' : '72px' }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between p-2 pt-0 gap-4">
                <div className="text-[10px] text-slate-600 font-mono uppercase pl-4">
                  {input.length > 0 && `${input.length} characters tracked`}
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !input.trim()}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                    input.trim() 
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/40 active:scale-95" 
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  )}
                >
                  {isAnalyzing ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Verify <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Results Container */}
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-t-indigo-500"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500 animate-pulse">Running NLP Analytics</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 flex items-start gap-4"
            >
              <AlertTriangle className="mt-0.5 shrink-0" size={20} />
              <div className="text-sm">{error}</div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-32"
            >
              {/* Score Headline */}
              <div className="text-center space-y-4 py-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative inline-block"
                >
                  <div className={cn(
                    "absolute inset-0 blur-3xl opacity-30 rounded-full",
                    result.credibilityScore > 70 ? "bg-emerald-500" : result.credibilityScore > 40 ? "bg-amber-500" : "bg-red-500"
                  )} />
                  <div className="relative font-sans text-9xl font-black tracking-tighter text-white">
                    {result.credibilityScore}<span className="text-2xl text-slate-600 font-medium ml-1">/100</span>
                  </div>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{result.verdict}</h2>
                  <p className="text-slate-400 max-w-md mx-auto">Comprehensive analysis based on factual cross-referencing and linguistic patterns.</p>
                </div>
              </div>

              {/* Core Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-6 rounded-3xl group transition-all hover:border-indigo-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Scale size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Bias Rating</span>
                  </div>
                  <div className="font-bold text-xl text-white mb-2">{result.biasAnalysis.rating}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{result.biasAnalysis.explanation}</p>
                </div>

                <div className="glass-panel p-6 rounded-3xl border-purple-500/10 hover:border-purple-500/30 transition-all group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <BrainCircuit size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Neural NLP Signatures</h3>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <NLPMetric label="Propaganda Likelihood" value={result.nlpBreakdown.propagandaLikelihood} color="bg-red-500" />
                    <NLPMetric label="Emotional Intensity" value={result.nlpBreakdown.emotionalIntensity} color="bg-orange-500" />
                    <NLPMetric label="Lexical Density" value={result.nlpBreakdown.lexicalDensity} color="bg-blue-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-white/5">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-600 font-mono mb-1">Sentiment</span>
                      <span className="text-sm text-slate-300 font-medium">{result.nlpBreakdown.sentiment}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-600 font-mono mb-1">Sophistication</span>
                      <span className="text-sm text-slate-300 font-medium">{result.nlpBreakdown.sophistication}</span>
                    </div>
                  </div>
                  
                  {result.nlpBreakdown.logicalFallacies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {result.nlpBreakdown.logicalFallacies.map((f, i) => (
                        <span key={i} className="text-[10px] text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fact Ledger */}
              <div className="glass-panel rounded-3xl overflow-hidden border-indigo-500/10">
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-3">
                    <CheckCircle2 color="#6366f1" size={18} />
                    Claims Verification
                  </h3>
                  <Fingerprint className="text-slate-700" size={20} />
                </div>
                <div className="divide-y divide-white/5">
                  {result.factualChecks.map((check, i) => (
                    <div key={i} className="px-8 py-6 hover:bg-white/[0.01] transition-colors group">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-indigo-100 font-bold leading-tight decoration-indigo-500/30 group-hover:underline underline-offset-4">{check.claim}</h4>
                          <span className={cn(
                            "grow-0 shrink-0 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border",
                            check.status === 'Verified' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : check.status === 'False' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          )}>
                            {check.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">{check.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 px-2 flex items-center gap-3">
                  Verification Benchmarks <div className="h-[1px] grow bg-slate-900" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.trustedSources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="glass-panel p-5 rounded-2xl hover:bg-indigo-500/[0.03] hover:border-indigo-500/40 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={14} className="text-indigo-400" />
                      </div>
                      <div className="font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{source.name}</div>
                      <p className="text-slate-500 text-xs leading-relaxed">{source.reason}</p>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-3xl mx-auto px-6 pb-12 text-center text-[10px] font-mono text-slate-700 uppercase tracking-[0.3em]">
        Signal Strength: High Quality • VeriTrust AI • © 2026
      </footer>
    </div>
  );
}

