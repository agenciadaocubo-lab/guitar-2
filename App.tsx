
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Difficulty, LessonContent, UserProgress, UserSettings } from './types';
import { CURRICULUM } from './constants';
import { generateLessonContent } from './services/geminiService';
import Fretboard from './components/Fretboard';
import Ladder from './components/Ladder';
import { Music, GraduationCap, Trophy, ChevronRight, Settings2, Loader2, Sparkles, Layout, X, Plus, Minus, BookOpen, Menu, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

const THEMES = {
  [Difficulty.BEGINNER]: {
    primary: 'emerald',
    bg: 'bg-slate-950',
    card: 'bg-slate-900',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    button: 'bg-emerald-500 hover:bg-emerald-600',
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'emerald',
  },
  [Difficulty.INTERMEDIATE]: {
    primary: 'amber',
    bg: 'bg-slate-950',
    card: 'bg-slate-900',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    button: 'bg-amber-500 hover:bg-amber-600',
    gradient: 'from-amber-500 to-orange-600',
    accent: 'amber',
  },
  [Difficulty.ADVANCED]: {
    primary: 'purple',
    bg: 'bg-slate-950',
    card: 'bg-slate-900',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    button: 'bg-purple-500 hover:bg-purple-600',
    gradient: 'from-purple-600 to-indigo-700',
    accent: 'purple',
  }
};

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const metronomeIntervalRef = useRef<number | null>(null);

  const [progress, setProgress] = useState<UserProgress>({
    difficulty: Difficulty.BEGINNER,
    completedStepIds: [],
  });
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('guitar_master_settings');
    return saved ? JSON.parse(saved) : {
      defaultBpm: 80,
      overriddenBpms: {}
    };
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string>(CURRICULUM[Difficulty.BEGINNER][0].id);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = THEMES[difficulty];

  useEffect(() => {
    localStorage.setItem('guitar_master_settings', JSON.stringify(settings));
  }, [settings]);

  // Fix: Removed hasApiKey check as per instructions to assume the key is present.
  const loadLesson = useCallback(async (id: string, diff: Difficulty) => {
    setLoading(true);
    setError(null);
    try {
      const step = CURRICULUM[diff].find(s => s.id === id);
      if (step) {
        const content = await generateLessonContent(diff, step.title, id);
        setLesson(content);
      }
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar aula. Verifique sua conexão ou cota da API.");
    } finally {
      setLoading(false);
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    loadLesson(activeStepId, difficulty);
  }, [activeStepId, difficulty, loadLesson]);

  const currentBpm = useMemo(() => {
    if (!lesson) return settings.defaultBpm;
    return settings.overriddenBpms[lesson.id] || lesson.suggestedBpm || settings.defaultBpm;
  }, [lesson, settings, activeStepId]);

  // Metronome Sound Engine Logic
  useEffect(() => {
    if (isMetronomeActive) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTick = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.06);
      };

      const intervalMs = 60000 / currentBpm;
      metronomeIntervalRef.current = window.setInterval(playTick, intervalMs);
      
      return () => {
        if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
        audioCtx.close();
      };
    }
  }, [isMetronomeActive, currentBpm]);

  const handleComplete = () => {
    if (!lesson) return;
    
    const newCompleted = [...progress.completedStepIds];
    if (!newCompleted.includes(lesson.id)) {
      newCompleted.push(lesson.id);
      setProgress(prev => ({ ...prev, completedStepIds: newCompleted }));
    }

    const currentSteps = CURRICULUM[difficulty];
    const currentIndex = currentSteps.findIndex(s => s.id === lesson.id);
    if (currentIndex < currentSteps.length - 1) {
      setActiveStepId(currentSteps[currentIndex + 1].id);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDifficultyChange = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    setActiveStepId(CURRICULUM[newDiff][0].id);
  };

  const updateDefaultBpm = (val: number) => {
    setSettings(prev => ({ ...prev, defaultBpm: Math.max(40, Math.min(240, val)) }));
  };

  const updateLessonBpm = (val: number) => {
    if (!lesson) return;
    setSettings(prev => ({
      ...prev,
      overriddenBpms: { ...prev.overriddenBpms, [lesson.id]: Math.max(40, Math.min(240, val)) }
    }));
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-500 bg-slate-950 text-slate-100`}>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
           <div className={`p-1.5 rounded-lg ${theme.button}`}>
             <Music className="w-5 h-5 text-slate-950" />
           </div>
           <span className="font-black text-lg">Guitar Master</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400">
            <Settings2 className="w-6 h-6" />
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400">
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Settings2 className={`w-5 h-5 ${theme.text}`} /> Configurações
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-3 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Metrônomo Geral</label>
                <div className="flex items-center gap-6">
                  <button onClick={() => updateDefaultBpm(settings.defaultBpm - 5)} className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center border border-slate-700 active:scale-95 transition-all">
                    <Minus className="w-6 h-6 text-slate-300" />
                  </button>
                  <div className="flex-grow text-center">
                    <span className="text-5xl font-black text-slate-100 leading-none">{settings.defaultBpm}</span>
                    <span className="block text-[10px] font-bold text-slate-500 mt-2 uppercase">BPM</span>
                  </div>
                  <button onClick={() => updateDefaultBpm(settings.defaultBpm + 5)} className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center border border-slate-700 active:scale-95 transition-all">
                    <Plus className="w-6 h-6 text-slate-300" />
                  </button>
                </div>
                <input 
                  type="range" min="40" max="240" step="1" 
                  value={settings.defaultBpm} 
                  onChange={(e) => updateDefaultBpm(parseInt(e.target.value))}
                  className={`w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-8 accent-${theme.primary}-500`}
                />
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Som do Metrônomo</h3>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Clique de Referência</p>
                </div>
                <button 
                  onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black transition-all active:scale-95 ${isMetronomeActive ? theme.button + ' text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                >
                  {isMetronomeActive ? (
                    <><Volume2 className="w-5 h-5" /> ON</>
                  ) : (
                    <><VolumeX className="w-5 h-5" /> OFF</>
                  )}
                </button>
              </div>

              {lesson && (
                <div className={`p-5 rounded-2xl border bg-slate-950 ${theme.border}`}>
                  <label className={`text-[10px] font-bold uppercase tracking-widest block mb-4 ${theme.text}`}>Ajuste da Aula</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-slate-100">{currentBpm} BPM</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Sugerido: {lesson.suggestedBpm} BPM</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateLessonBpm(currentBpm - 2)} className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:scale-95">
                        <Minus className={`w-5 h-5 ${theme.text}`} />
                      </button>
                      <button onClick={() => updateLessonBpm(currentBpm + 2)} className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center active:scale-95">
                        <Plus className={`w-5 h-5 ${theme.text}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-900/50 border-t border-slate-800">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className={`w-full py-5 text-slate-950 font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all ${theme.button}`}
              >
                PRATICAR AGORA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:inset-auto md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 bg-slate-950 hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${theme.button}`}>
                <Music className="w-6 h-6 text-slate-950" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-100">Guitar Master</h1>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 hover:text-slate-100">
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
          
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Dificuldade</label>
          <div className="flex flex-col gap-1.5 p-1 bg-slate-900 rounded-xl">
            {Object.values(Difficulty).map(d => {
              const dTheme = THEMES[d];
              const isActive = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  className={`
                    w-full py-2.5 px-4 text-[11px] font-black rounded-lg transition-all flex items-center justify-between
                    ${isActive ? `${dTheme.button} text-slate-950 shadow-lg` : 'text-slate-500 hover:text-slate-100 hover:bg-slate-800'}
                  `}
                >
                  {d}
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:hidden p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
           <span className="font-black text-lg">Menu de Aulas</span>
           <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400">
             <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          <div className="md:hidden mb-8">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Mudar Nível</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Difficulty).map(d => (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  className={`py-3 text-[10px] font-black rounded-xl border border-slate-800 ${difficulty === d ? THEMES[d].button + ' text-slate-950' : 'text-slate-500 bg-slate-900'}`}
                >
                  {d.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
              <Layout className="w-4 h-4" /> Sua Trilha
            </h2>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 ${theme.text}`}>
              {progress.completedStepIds.filter(id => id.startsWith(difficulty === Difficulty.BEGINNER ? 'b' : difficulty === Difficulty.INTERMEDIATE ? 'i' : 'a')).length}/5
            </span>
          </div>
          <Ladder 
            difficulty={difficulty} 
            completedStepIds={progress.completedStepIds} 
            activeStepId={activeStepId}
            onSelectStep={setActiveStepId}
            themeColor={theme.primary}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col bg-slate-950 overflow-x-hidden">
        {loading ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="relative">
              <Loader2 className={`w-14 h-14 animate-spin text-${theme.primary}-500`} />
              <Sparkles className="w-6 h-6 text-blue-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h2 className="mt-6 text-lg font-black text-slate-100">Criando sua aula...</h2>
            <p className="text-slate-500 max-w-[200px] mt-2 text-xs font-medium">O mestre está preparando os diagramas e a tablatura para você.</p>
          </div>
        ) : error ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
            <div className="p-4 bg-red-950/40 text-red-500 rounded-3xl mb-6 border border-red-900/50">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-100">Algo falhou...</h2>
            <p className="text-slate-500 mt-2 mb-8 text-sm">{error}</p>
            <button 
              onClick={() => loadLesson(activeStepId, difficulty)}
              className={`px-8 py-4 text-slate-950 font-black rounded-2xl transition-all active:scale-95 ${theme.button}`}
            >
              TENTAR NOVAMENTE
            </button>
          </div>
        ) : lesson ? (
          <div className="p-5 md:p-10 max-w-4xl mx-auto w-full animate-in slide-in-from-bottom-6 duration-500 pb-24">
            {/* Lesson Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className={`flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.2em] mb-3 ${theme.text}`}>
                  <GraduationCap className="w-4 h-4" /> Passo Ativo
                </div>
                <h1 className="text-2xl md:text-5xl font-black text-slate-100 leading-tight">
                  {lesson.title}
                </h1>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-5 py-4 rounded-[2rem] shadow-lg hover:border-slate-700 transition-all active:scale-95 group shrink-0"
              >
                <div className="text-left">
                  <span className="block text-[10px] font-black text-slate-500 uppercase leading-none mb-1">Ritmo</span>
                  <span className="text-xl font-black text-slate-100">{currentBpm} BPM</span>
                </div>
                <div className={`p-2.5 bg-slate-800 rounded-2xl transition-colors group-hover:bg-slate-700`}>
                  <Settings2 className={`w-5 h-5 text-slate-400 group-hover:${theme.text}`} />
                </div>
              </button>
            </header>

            {/* Theory */}
            <section className="bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-800 mb-8 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${theme.button.split(' ')[0]}`}></div>
              <h2 className="text-lg font-black text-slate-100 mb-4 flex items-center gap-3">
                <BookOpen className={`w-5 h-5 ${theme.text}`} /> 
                1. Conceito
              </h2>
              <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed whitespace-pre-wrap font-medium text-sm md:text-base">
                {lesson.theory}
              </div>
            </section>

            {/* Fretboard */}
            <section className="bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-800 mb-8 overflow-hidden">
              <h2 className="text-lg font-black text-slate-100 mb-4 flex items-center gap-3">
                <Layout className={`w-5 h-5 ${theme.text}`} />
                2. Mapeamento
              </h2>
              <p className="text-[11px] md:text-sm text-slate-500 mb-6 font-medium">
                Diagrama técnico do braço da guitarra para memorização visual.
              </p>
              <Fretboard notes={lesson.fretboardNotes} range={lesson.fretboardRange as [number, number]} rootColorClass={`${theme.button.split(' ')[0]}`} />
            </section>

            {/* Practice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
              <section className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 flex flex-col">
                <h2 className="text-lg font-black text-slate-100 mb-4 flex items-center gap-3">
                  <Music className={`w-5 h-5 ${theme.text}`} />
                  3. Tablatura
                </h2>
                <div className="flex-grow">
                   <div className="bg-black/80 p-5 rounded-2xl font-mono text-[10px] md:text-sm overflow-x-auto whitespace-pre border border-slate-800 mb-6 text-slate-200 shadow-inner custom-tab">
                    {lesson.scaleTab}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mt-auto">
                  <Sparkles className={`w-4 h-4 ${theme.text}`} />
                  <span>Meta: <strong className={theme.text}>{currentBpm} BPM</strong></span>
                </div>
              </section>

              <section className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 flex flex-col">
                <h2 className="text-lg font-black text-slate-100 mb-4 flex items-center gap-3">
                  <Layout className={`w-5 h-5 ${theme.text}`} />
                  4. Harmonia
                </h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {lesson.progression.chords.map((chord, i) => (
                    <div key={i} className={`px-4 py-2 font-black text-base border-2 rounded-xl bg-slate-950 ${theme.text} border-slate-800 shadow-sm active:scale-95 transition-all`}>
                      {chord}
                    </div>
                  ))}
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                   <p className="text-[11px] md:text-sm text-slate-500 leading-relaxed font-medium italic">
                    {lesson.progression.explanation}
                  </p>
                </div>
              </section>
            </div>

            {/* Challenge */}
            <section className={`bg-gradient-to-br ${theme.gradient} p-8 md:p-12 rounded-[3rem] text-slate-950 shadow-2xl mb-12 relative overflow-hidden transition-all duration-700`}>
               <Trophy className="absolute -right-10 -bottom-10 w-48 md:w-64 h-48 md:h-64 text-black/10 rotate-12" />
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 bg-slate-950 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
                   <Trophy className="w-3 h-3 text-amber-500" /> Desafio do Mestre
                 </div>
                 <h2 className="text-2xl md:text-3xl font-black mb-6 leading-tight">
                   {lesson.challenge}
                 </h2>
                 <button 
                  onClick={handleComplete}
                  className={`w-full max-w-sm bg-slate-950 text-slate-100 font-black py-5 rounded-2xl shadow-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-3 group text-lg`}
                 >
                   MARCAR COMO CONCLUÍDO <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </button>
               </div>
            </section>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
             <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800">
               <Music className="w-8 h-8 text-slate-700" />
             </div>
            <h2 className="text-lg font-bold text-slate-400">Tudo pronto!</h2>
            <p className="text-slate-600 mt-2 max-w-xs text-sm">Abra o menu e selecione o primeiro degrau para iniciar sua jornada.</p>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden mt-8 px-8 py-3 bg-slate-900 text-slate-300 font-black rounded-xl border border-slate-800 active:scale-95"
            >
              VER AULAS
            </button>
          </div>
        )}

        <footer className="mt-auto p-8 text-center text-slate-700 text-[8px] border-t border-slate-900 font-black uppercase tracking-[0.2em]">
          <p>© 2024 Guitar Master | Coach IA Avançado</p>
        </footer>
      </main>

      <style>{`
        .custom-tab {
          line-height: 1.1;
          letter-spacing: 0.04em;
          min-width: fit-content;
        }
        @media (max-width: 768px) {
          .custom-tab {
            font-size: 10px;
          }
        }
        input[type=range]::-webkit-slider-thumb {
          width: 24px;
          height: 24px;
        }
      `}</style>
    </div>
  );
};

export default App;
