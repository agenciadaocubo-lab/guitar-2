
import React from 'react';
import { CURRICULUM } from '../constants';
import { Difficulty } from '../types';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';

interface LadderProps {
  difficulty: Difficulty;
  completedStepIds: string[];
  activeStepId: string;
  onSelectStep: (id: string) => void;
  themeColor?: string;
}

const Ladder: React.FC<LadderProps> = ({ difficulty, completedStepIds, activeStepId, onSelectStep, themeColor = 'amber' }) => {
  const steps = CURRICULUM[difficulty];

  const activeBorderClass = `border-${themeColor}-500 bg-slate-800 shadow-xl scale-[1.03] md:scale-105`;
  const activeTitleClass = `text-slate-100`;
  const activeDotClass = `bg-${themeColor}-500`;
  const playIconClass = `text-${themeColor}-400`;

  return (
    <div className="flex flex-col gap-2.5 py-4">
      {steps.map((step, index) => {
        const isCompleted = completedStepIds.includes(step.id);
        const isPreviousCompleted = index === 0 || completedStepIds.includes(steps[index - 1].id);
        const isLocked = !isPreviousCompleted && !isCompleted;
        const isActive = activeStepId === step.id;

        return (
          <div 
            key={step.id}
            onClick={() => !isLocked && onSelectStep(step.id)}
            className={`
              flex items-center gap-3 p-3.5 md:p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98]
              ${isActive ? activeBorderClass : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700'}
              ${isLocked ? 'opacity-30 grayscale cursor-not-allowed border-dashed' : ''}
            `}
          >
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
              ) : isLocked ? (
                <Lock className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
              ) : (
                <PlayCircle className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? playIconClass : 'text-slate-500'}`} />
              )}
            </div>
            
            <div className="flex-grow">
              <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-tighter block mb-0.5">
                Passo {index + 1}
              </span>
              <h3 className={`font-bold text-xs md:text-sm leading-tight ${isActive ? activeTitleClass : 'text-slate-400'}`}>
                {step.title}
              </h3>
            </div>

            {isActive && (
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeDotClass}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Ladder;
