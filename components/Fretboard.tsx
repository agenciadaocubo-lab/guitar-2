
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
  const fretCount = endFret - startFret + 1;
  const frets = Array.from({ length: fretCount }, (_, i) => startFret + i);

  return (
    <div className="overflow-x-auto pb-4 scrollbar-hide">
      <div className="inline-block min-w-full bg-slate-950 p-8 rounded-2xl shadow-inner border border-slate-800 relative">
        <div className="relative flex">
          {/* Fret Markers */}
          <div className="absolute top-[-30px] flex w-full justify-between px-1">
            {frets.map((f) => (
              <div key={f} className="text-[9px] text-slate-600 font-black uppercase w-12 text-center">
                {f === 0 ? 'Nut' : f}
              </div>
            ))}
          </div>

          <div className="flex flex-col w-full">
            {strings.map((s) => (
              <div key={s} className="relative h-12 flex items-center group">
                {/* The String Line */}
                <div 
                  className="absolute w-full bg-slate-700 shadow-sm"
                  style={{ height: `${1 + (s-1)*0.3}px`, opacity: 0.9 }}
                ></div>

                {/* Frets Containers */}
                <div className="flex w-full justify-between">
                  {frets.map((f) => {
                    const noteAtFret = notes.find(n => n.string === s && n.fret === f);
                    return (
                      <div 
                        key={f} 
                        className={`relative w-12 h-12 flex items-center justify-center border-r border-slate-800/80 last:border-r-0 ${f === 0 ? 'border-r-4 border-slate-600' : ''}`}
                      >
                        {noteAtFret && (
                          <div 
                            className={`
                              z-10 w-10 h-10 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-black shadow-2xl transform transition-all duration-300 hover:scale-125 cursor-default ring-2 ring-slate-950 px-1 text-center leading-tight
                              ${noteAtFret.isRoot ? `${rootColorClass} text-slate-950` : 'bg-slate-700 text-slate-200'}
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
      <div className="mt-6 flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest justify-center">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${rootColorClass} shadow-lg shadow-current/20`}></div>
          <span>Tônica (Root)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-700"></div>
          <span>Intervalos</span>
        </div>
      </div>
    </div>
  );
};

export default Fretboard;
