import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Button from './components/Button';
import Input from './components/Input';
import Textarea from './components/Textarea';
import LoadingSpinner from './components/LoadingSpinner';
import {
  generateStudyPlan,
  analyzeMaterial,
  generateFlashcards,
  generateQuiz,
  startChatSession,
  sendChatMessage,
} from './services/geminiService';
import { StudyPlanEntry, Flashcard, QuizQuestion, ChatMessage, ToolType } from './types';
import { Chat } from '@google/genai';
// Corrected import path for constants.tsx to ensure esm.sh resolves it
import { ICONS } from './constants.tsx';

const StudyFlow: React.FC = () => {
  const [subject, setSubject] = useState<string>('');
  const [examDate, setExamDate] = useState<string>(''); // YYYY-MM-DD
  const [weeklyHours, setWeeklyHours] = useState<number | ''>('');
  const [notesContent, setNotesContent] = useState<string>('');

  const [studyPlan, setStudyPlan] = useState<StudyPlanEntry[] | null>(null);
  const [keyConcepts, setKeyConcepts] = useState<string[] | null>(null);
  const [subtopics, setSubtopics] = useState<string[] | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatSessionRef = useRef<Chat | null>(null); // Use ref for chat session to maintain instance

  const [activeTool, setActiveTool] = useState<ToolType | 'inputs'>('inputs');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasInitialInputs = subject !== '' && examDate !== '' && weeklyHours !== '' && notesContent !== '';

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExamDate(e.target.value);
  };

  const calculateDaysRemaining = useCallback((): number | null => {
    if (examDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      const exam = new Date(examDate);
      exam.setHours(0, 0, 0, 0); // Normalize to start of day
      const diffTime = exam.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : 0;
    }
    return null;
  }, [examDate]);

  const daysRemaining = calculateDaysRemaining();

  const handleGenerateStudyPlan = useCallback(async () => {
    if (!subject || !examDate || weeklyHours === '' || !notesContent) {
      setError("Por favor, rellena todos los campos de entrada y pega tus apuntes.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const plan = await generateStudyPlan(subject, examDate, Number(weeklyHours), notesContent);
      setStudyPlan(plan);
      setActiveTool('plan');
    } catch (err) {
      setError(`Error al generar el plan de estudio: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [subject, examDate, weeklyHours, notesContent]);

  const handleAnalyzeMaterial = useCallback(async () => {
    if (!notesContent) {
      setError("Por favor, pega tus apuntes para analizar el material.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { keyConcepts: concepts, subtopics: topics } = await analyzeMaterial(notesContent);
      setKeyConcepts(concepts);
      setSubtopics(topics);
      setActiveTool('analyze');
    } catch (err) {
      setError(`Error al analizar el material: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [notesContent]);

  const handleGenerateFlashcards = useCallback(async () => {
    if (!notesContent) {
      setError("Por favor, pega tus apuntes para generar flashcards.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cards = await generateFlashcards(notesContent);
      setFlashcards(cards);
      setActiveTool('flashcards');
    } catch (err) {
      setError(`Error al generar flashcards: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [notesContent]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!notesContent) {
      setError("Por favor, pega tus apuntes para generar el cuestionario.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const quiz = await generateQuiz(notesContent);
      // Initialize userAnswerIndex and isCorrect for tracking user's answers
      setQuizQuestions(quiz.map(q => ({ ...q, userAnswerIndex: undefined, isCorrect: undefined })));
      setActiveTool('quiz');
    } catch (err) {
      setError(`Error al generar el cuestionario: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [notesContent]);

  const handleQuizAnswer = useCallback((questionIndex: number, optionIndex: number) => {
    setQuizQuestions(prevQuestions => {
      if (!prevQuestions) return null;
      const updatedQuestions = [...prevQuestions];
      const question = updatedQuestions[questionIndex];
      question.userAnswerIndex = optionIndex;
      question.isCorrect = optionIndex === question.correctAnswerIndex;
      return updatedQuestions;
    });
  }, []);

  const handleStartChat = useCallback(async () => {
    if (!chatSessionRef.current) {
      setLoading(true);
      setError(null);
      try {
        const session = await startChatSession();
        chatSessionRef.current = session;
        setChatMessages([{ role: 'model', content: "¡Hola! ¿En qué puedo ayudarte con tus estudios?" }]);
        setActiveTool('chat');
      } catch (err) {
        setError(`Error al iniciar el asistente de estudio: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setActiveTool('chat');
    }
  }, []); // Empty dependency array means this function is created once

  const handleSendChatMessage = useCallback(async (message: string) => {
    if (!chatSessionRef.current || !message.trim()) return;

    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, newUserMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(chatSessionRef.current, message);
      // Fix: Directly access the 'text' property from the response object.
      const modelContent = response.text;
      setChatMessages(prev => [...prev, { role: 'model', content: modelContent }]);
    } catch (err) {
      setError(`Error al enviar mensaje: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array as chatSessionRef is stable

  // Effect to handle initial chat session creation when switching to chat for the first time
  useEffect(() => {
    if (activeTool === 'chat' && !chatSessionRef.current && !loading) {
      handleStartChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]); // Only run when activeTool changes to 'chat' and session not started

  // Cleanup chat session on unmount
  useEffect(() => {
    const chatSession = chatSessionRef.current;
    return () => {
      // Current @google/genai Chat type does not have an explicit close method.
      // If one becomes available in the future, it should be called here.
      if (chatSession) {
        console.log("Chat session reference cleaned up.");
        // chatSession.close(); // Placeholder if a close method existed
      }
    };
  }, []);

  // Render components for each tool
  const renderToolContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      );
    }

    switch (activeTool) {
      case 'inputs':
        return (
          <div className="bg-dark-bg-800 p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gold-accent mb-6 text-center">Configura tu Estudio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="subject"
                label="Materia de Estudio"
                placeholder="Ej: Historia Universal, Álgebra Lineal"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Input
                id="examDate"
                label="Fecha del Examen"
                type="date"
                value={examDate}
                onChange={handleDateChange}
              />
              <Input
                id="weeklyHours"
                label="Horas Disponibles por Semana"
                type="number"
                placeholder="Ej: 10"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                min="0"
              />
            </div>
            <Textarea
              id="notesContent"
              label="Pega tus Apuntes o Contenido a Estudiar"
              placeholder="Copia y pega aquí todo el texto relevante para tus estudios..."
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              className="mt-4"
            />
            <div className="flex justify-center mt-6">
              <Button onClick={() => setActiveTool('plan')} disabled={!hasInitialInputs} size="lg">
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>¡Listo! Ir a Herramientas</span>
                </span>
              </Button>
            </div>
          </div>
        );
      case 'plan':
        return (
          <div className="bg-dark-bg-800 p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gold-accent mb-4 flex items-center gap-2">
              {ICONS.PLAN} Plan de Estudio Personalizado
            </h2>
            <p className="text-gray-400 mb-6">Genera un plan día por día basado en tus inputs.</p>
            {!studyPlan ? (
              <div className="text-center">
                <Button onClick={handleGenerateStudyPlan} disabled={loading || !hasInitialInputs} size="lg">
                  Generar Plan de Estudio
                </Button>
                {!hasInitialInputs && <p className="text-red-300 mt-2">Por favor, completa los campos de entrada primero.</p>}
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-4">Tu Plan para "{subject}"</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-dark-bg-700">
                    <thead className="bg-dark-bg-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Día</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tema</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actividades</th>
                      </tr>
                    </thead>
                    <tbody className="bg-dark-bg-800 divide-y divide-dark-bg-700">
                      {studyPlan.map((entry) => (
                        <tr key={entry.day} className="hover:bg-dark-bg-700 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{entry.day}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{entry.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{entry.topic}</td>
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-300">
                            <ul className="list-disc list-inside space-y-1">
                              {entry.activities.map((activity, idx) => (
                                <li key={idx}>{activity}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-center mt-6">
                  <Button onClick={handleGenerateStudyPlan} variant="secondary" disabled={loading} size="md">
                    Regenerar Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      case 'analyze':
        return (
          <div className="bg-dark-bg-800 p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gold-accent mb-4 flex items-center gap-2">
              {ICONS.ANALYZE} Analizador de Materiales
            </h2>
            <p className="text-gray-400 mb-6">Pega tus apuntes y la IA extraerá conceptos clave y subtemas.</p>
            <Textarea
              id="notesContentAnalyzer"
              label="Tus Apuntes"
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Pega aquí el texto a analizar..."
              className="mb-4"
            />
            <div className="text-center">
              <Button onClick={handleAnalyzeMaterial} disabled={loading || !notesContent} size="lg">
                Analizar Material
              </Button>
            </div>
            {keyConcepts && subtopics && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-3">Conceptos Clave:</h3>
                  {keyConcepts.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      {keyConcepts.map((concept, index) => (
                        <li key={index}>{concept}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No se encontraron conceptos clave.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-3">Subtemas:</h3>
                  {subtopics.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      {subtopics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No se encontraron subtemas.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'flashcards':
        return (
          <div className="bg-dark-bg-800 p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gold-accent mb-4 flex items-center gap-2">
              {ICONS.FLASHCARDS} Generador de Flashcards
            </h2>
            <p className="text-gray-400 mb-6">Crea tarjetas de estudio automáticas desde tus apuntes.</p>
            <Textarea
              id="notesContentFlashcards"
              label="Tus Apuntes"
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Pega aquí el texto para generar flashcards..."
              className="mb-4"
            />
            <div className="text-center">
              <Button onClick={handleGenerateFlashcards} disabled={loading || !notesContent} size="lg">
                Generar Flashcards
              </Button>
            </div>
            {flashcards && flashcards.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flashcards.map((card, index) => (
                  <div key={index} className="bg-dark-bg-700 p-5 rounded-lg border border-dark-bg-700 shadow-md">
                    <p className="text-gold-accent font-semibold mb-2">Q: {card.question}</p>
                    <p className="text-gray-300">A: {card.answer}</p>
                  </div>
                ))}
              </div>
            )}
            {flashcards && flashcards.length === 0 && (
              <p className="text-center text-gray-400 mt-6">No se pudieron generar flashcards. Intenta con un texto diferente.</p>
            )}
          </div>
        );
      case 'quiz':
        return (
          <div className="bg-dark-bg-800 p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gold-accent mb-4 flex items-center gap-2">
              {ICONS.QUIZ} Cuestionario
            </h2>
            <p className="text-gray-400 mb-6">Genera un cuestionario de 10 preguntas tipo test basado en tus materiales.</p>
            <Textarea
              id="notesContentQuiz"
              label="Tus Apuntes"
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Pega aquí el texto para generar el cuestionario..."
              className="mb-4"
            />
            <div className="text-center">
              <Button onClick={handleGenerateQuiz} disabled={loading || !notesContent} size="lg">
                Generar Cuestionario
              </Button>
            </div>
            {quizQuestions && quizQuestions.length > 0 && (
              <div className="mt-8 space-y-8">
                {quizQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-dark-bg-700 p-5 rounded-lg shadow-md border border-dark-bg-700">
                    <p className="text-gold-accent font-semibold text-lg mb-4">{qIndex + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option, oIndex) => (
                        <button
                          key={oIndex}
                          onClick={() => handleQuizAnswer(qIndex, oIndex)}
                          className={`
                            block w-full text-left p-3 rounded-md transition-colors duration-200
                            ${q.userAnswerIndex === undefined
                              ? 'bg-dark-bg-800 hover:bg-dark-bg-600 text-gray-200'
                              : oIndex === q.correctAnswerIndex && q.userAnswerIndex !== undefined
                                ? 'bg-green-700 text-white'
                                : oIndex === q.userAnswerIndex && q.userAnswerIndex !== q.correctAnswerIndex
                                  ? 'bg-red-700 text-white'
                                  : 'bg-dark-bg-800 text-gray-200 opacity-70 cursor-not-allowed'
                            }
                          `}
                          disabled={q.userAnswerIndex !== undefined}
                        >
                          {String.fromCharCode(65 + oIndex)}. {option}
                        </button>
                      ))}
                    </div>
                    {q.userAnswerIndex !== undefined && (
                      <div className="mt-4 p-3 bg-dark-bg-900 rounded-md text-sm text-gray-300 border border-dark-bg-700">
                        <strong className={q.isCorrect ? 'text-green-400' : 'text-red-400'}>
                          {q.isCorrect ? 'Correcto: ' : 'Incorrecto: '}
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {quizQuestions && quizQuestions.length === 0 && (
              <p className="text-center text-gray-400 mt-6">No se pudieron generar preguntas. Intenta con un texto diferente.</p>
            )}
          </div>
        );
      case 'chat':
        return (
          <div className="bg-dark-bg-800 p-6 rounded-lg shadow-xl mb-8 flex flex-col h-[70vh]">
            <h2 className="text-2xl font-bold text-gold-accent mb-4 flex items-center gap-2">
              {ICONS.CHAT} Asistente de Estudio
            </h2>
            <p className="text-gray-400 mb-6">Haz preguntas sobre cualquier tema relacionado con tus estudios.</p>
            <div className="flex-grow overflow-y-auto pr-4 mb-4 custom-scrollbar">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-gold-accent text-dark-bg-950' : 'bg-dark-bg-700 text-gray-100'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                 <div className="flex justify-start mb-4">
                 <div className="p-3 rounded-lg bg-dark-bg-700 text-gray-100">
                   <LoadingSpinner />
                 </div>
               </div>
              )}
            </div>
            <div className="flex">
              <Input
                id="chatInput"
                placeholder="Escribe tu pregunta aquí..."
                className="flex-grow mr-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    handleSendChatMessage(target.value);
                    target.value = '';
                  }
                }}
              />
              <Button onClick={() => {
                const chatInput = document.getElementById('chatInput') as HTMLInputElement;
                handleSendChatMessage(chatInput.value);
                chatInput.value = '';
              }} disabled={loading} size="md">
                Enviar
              </Button>
            </div>
          </div>
        );
      case 'progress':
        const totalQuizQuestions = quizQuestions?.length || 0;
        const answeredQuizQuestions = quizQuestions?.filter(q => q.userAnswerIndex !== undefined).length || 0;
        const correctQuizAnswers = quizQuestions?.filter(q => q.isCorrect).length || 0;
        const quizCompletionPercentage = totalQuizQuestions > 0 ? (answeredQuizQuestions / totalQuizQuestions) * 100 : 0;
        const quizCorrectPercentage = answeredQuizQuestions > 0 ? (correctQuizAnswers / answeredQuizQuestions) * 100 : 0;

        return (
          <div className="bg-dark-bg-800 p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gold-accent mb-4 flex items-center gap-2">
              {ICONS.PROGRESS} Seguimiento de Progreso
            </h2>
            <p className="text-gray-400 mb-6">Panel con estadísticas de tu estudio actual.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-dark-bg-700 p-5 rounded-lg shadow-md border border-dark-bg-700 text-center">
                <p className="text-gold-accent text-4xl font-bold">{daysRemaining !== null ? daysRemaining : '--'}</p>
                <p className="text-gray-300 text-lg mt-2">Días restantes para el examen</p>
              </div>
              <div className="bg-dark-bg-700 p-5 rounded-lg shadow-md border border-dark-bg-700 text-center">
                <p className="text-gold-accent text-4xl font-bold">{studyPlan?.length || 0}</p>
                <p className="text-gray-300 text-lg mt-2">Días en Plan de Estudio</p>
              </div>
              <div className="bg-dark-bg-700 p-5 rounded-lg shadow-md border border-dark-bg-700 text-center">
                <p className="text-gold-accent text-4xl font-bold">{flashcards?.length || 0}</p>
                <p className="text-gray-300 text-lg mt-2">Flashcards Generadas</p>
              </div>
              <div className="bg-dark-bg-700 p-5 rounded-lg shadow-md border border-dark-bg-700 text-center col-span-1 md:col-span-2 lg:col-span-3">
                <p className="text-gold-accent text-3xl font-bold mb-4">Progreso del Cuestionario</p>
                <div className="w-full bg-dark-bg-900 rounded-full h-4 mb-2">
                  <div
                    className="bg-gold-accent h-4 rounded-full"
                    style={{ width: `${quizCompletionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-gray-300 text-lg">{answeredQuizQuestions} de {totalQuizQuestions} preguntas respondidas ({quizCompletionPercentage.toFixed(0)}%)</p>
                {answeredQuizQuestions > 0 && (
                  <p className="text-gray-300 text-lg mt-1">
                    Respuestas correctas: <span className="font-bold text-green-400">{correctQuizAnswers}</span> ({(quizCorrectPercentage).toFixed(0)}%)
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg-950 text-gray-100 font-sans flex flex-col">
      <Navbar activeTool={activeTool} onSelectTool={setActiveTool} hasInputs={hasInitialInputs} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderToolContent()}
      </main>
      <footer className="bg-dark-bg-900 text-gray-400 text-center p-4 mt-8">
        <p>&copy; {new Date().getFullYear()} StudyFlow. Herramienta de estudio inteligente.</p>
        <p className="text-sm mt-1">Powered by Google Gemini API.</p>
      </footer>
    </div>
  );
};

export default StudyFlow;