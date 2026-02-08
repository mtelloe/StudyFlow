import React from 'react';
import { ToolType } from '../types';
// Corrected import path for constants.tsx to ensure esm.sh resolves it
import { APP_NAME, ICONS } from '../constants.tsx';

interface NavbarProps {
  activeTool: ToolType | 'inputs';
  onSelectTool: (tool: ToolType | 'inputs') => void;
  hasInputs: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeTool, onSelectTool, hasInputs }) => {
  const tools: { id: ToolType; name: string; icon: React.ReactNode; }[] = [
    { id: 'plan', name: 'Plan de Estudio', icon: ICONS.PLAN },
    { id: 'analyze', name: 'Analizar Material', icon: ICONS.ANALYZE },
    { id: 'flashcards', name: 'Flashcards', icon: ICONS.FLASHCARDS },
    { id: 'quiz', name: 'Cuestionario', icon: ICONS.QUIZ },
    { id: 'chat', name: 'Asistente de Estudio', icon: ICONS.CHAT },
    { id: 'progress', name: 'Progreso', icon: ICONS.PROGRESS },
  ];

  return (
    <nav className="bg-dark-bg-900 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              className="flex-shrink-0 text-gold-accent text-2xl font-extrabold focus:outline-none"
              onClick={() => onSelectTool('inputs')}
            >
              {APP_NAME}
            </button>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className={`
                    ${activeTool === tool.id
                      ? 'bg-gold-accent text-dark-bg-950'
                      : 'text-gray-300 hover:bg-dark-bg-700 hover:text-gold-accent'
                    }
                    px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2
                    ${!hasInputs && tool.id !== 'inputs' && tool.id !== 'chat' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={!hasInputs && tool.id !== 'inputs' && tool.id !== 'chat'}
                >
                  {tool.icon}
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <button
              onClick={() => onSelectTool(activeTool === 'inputs' ? 'plan' : 'inputs')} 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-bg-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-accent"
            >
              <span className="sr-only">Open main menu</span>
              {activeTool !== 'inputs' ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. For simplicity, just toggles the 'inputs' screen content */}
      {activeTool === 'inputs' && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`
                  ${activeTool === tool.id
                    ? 'bg-gold-accent text-dark-bg-950'
                    : 'text-gray-300 hover:bg-dark-bg-700 hover:text-gold-accent'
                  }
                  block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 w-full
                  ${!hasInputs && tool.id !== 'inputs' && tool.id !== 'chat' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={!hasInputs && tool.id !== 'inputs' && tool.id !== 'chat'}
              >
                {tool.icon}
                {tool.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;