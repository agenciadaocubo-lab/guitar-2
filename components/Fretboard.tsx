
import React from 'react';
import { FretNote } from '../types';

interface FretboardProps {
  notes: FretNote[];
  range: [number, number];
  rootColorClass?: string;
}

const Fretboard: React.FC<FretboardProps> = ({ notes, range, rootColorClass = 'bg-amber-500' }) => {
  const strings = [1, 2, 3, 4, 5, 6];
  const [startFret, endFret] = range;
  const fretCount = Math.max(endFret - startFret + 1, 5); // Garante um tamanho mínimo visual
  const frets = Array.from({ length: fretCount }, (_, i) => startFret + i);

  return (
    <div className="overflow-x-auto pb-4 scrollbar-hide">
      <div className="inline-block min-w-full bg-slate-950 p-6 md:p-8 rounded-2xl shadow-inner border border-slate-800 relative">
        <div className="relative flex">
          {/* Fret Markers (Números dos trastes) */}
          <div className="absolute top-[-25px] flex w-full justify-between px-1">
            {frets.map((f) => (
              <div key={f} className="text-[8px] md:text-[9px] text-slate-600 font-black uppercase w-12 text-center">
                {f === 0 ? 'Nut' : f}
              </div>
            ))}
          </div>

          <div className="flex flex-col w-full">
            {strings.map((s) => (
              <div key={s} className="relative h-12 flex items-center group">
                {/* Linha da Corda */}
                <div 
                  className="absolute w-full bg-slate-700 shadow-sm"
                  style={{ height: `${1 + (s-1)*0.2}px`, opacity: 0.8 }}
                ></div>

                {/* Casas (Frets) */}
                <div className="flex w-full justify-between">
                  {frets.map((f) => {
                    const noteAtFret = notes.find(n => n.string === s && n.fret === f);
                    return (
                      <div 
                        key={f} 
                        className={`relative w-12 h-12 flex items-center justify-center border-r border-slate-800/50 last:border-r-0 ${f === 0 ? 'border-r-4 border-slate-500' : ''}`}
                      >
                        {noteAtFret && (
                          <div 
                            className={`
                              z-10 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[7px] md:text-[8px] font-black shadow-xl transform transition-all duration-300 hover:scale-110 cursor-default ring-1 ring-slate-900 px-0.5 text-center leading-tight
                              ${noteAtFret.isRoot ? `${rootColorClass} text-slate-950` : 'bg-slate-800 text-slate-200 border border-slate-700'}
                            `}
                          >
                            {noteAtFret.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${rootColorClass}`}></div>
          <span>Tônica</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
          <span>Grau - Nota</span>
        </div>
      </div>
    </div>
  );
};

export default Fretboard;
