import React from 'react';

export const GEMINI_PRO_MODEL = 'gemini-3-pro-preview';
export const GEMINI_FLASH_MODEL = 'gemini-3-flash-preview';

export const APP_NAME = "StudyFlow";

// Icons (using basic SVG for simplicity)
export const ICONS = {
  PLAN: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25m0 0v2.25m0-4.5h.375c.621 0 1.125.504 1.125 1.125V11.25m0 0h-.375c-.621 0-1.125.504-1.125 1.125v3.75c0 .621.504 1.125 1.125 1.125H20.25c.621 0 1.125-.504 1.125-1.125V6.75c0-.621-.504-1.125-1.125-1.125H8.25m0-4.5h7.5c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504 1.125-1.125 1.125h-7.5c-.621 0-1.125-.504-1.125-1.125V2.25c0-.621.504-1.125 1.125-1.125zM12 20.25h.008v.008H12v-.008z" />
    </svg>
  ),
  ANALYZE: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3-3m0 0 3 3m-3-3v6m-2.25-4.5h9" />
    </svg>
  ),
  FLASHCARDS: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.006 0-2.016.203-2.973.607C3.045 4.756 3 4.912 3 5.068V19.125c0 .668.455 1.232 1.007 1.332.895.16 1.746.247 2.593.247 2.752 0 5.49-.606 7.923-1.757l.003-.002A9.95 9.95 0 0 0 21 12.375V7.875c0-.668-.455-1.232-1.007-1.332-.895-.16-1.746-.247-2.593-.247C15.937 6 13.906 6.18 12 6.042Z" />
    </svg>
  ),
  QUIZ: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  CHAT: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H16.5M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.71 20.5H4.5c-.212 0-.398-.074-.546-.196-.147-.122-.244-.28-.275-.46l-.75-3.0a.375.375 0 01.369-.555h1.114c.053 0 .105.011.153.032l.836.313c1.024.382 2.09-.547 1.759-1.676-.207-.655-.184-1.32.016-1.948l.2-.641a8.966 8.966 0 00-1.34-8.865A8.25 8.25 0 0112 3.75c4.97 0 9 3.694 9 8.25z" />
    </svg>
  ),
  PROGRESS: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 14.25V19.5m0 0h5.625m-5.625 0L6 16.125M11.25 4.5l-.75 1.516V21M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 4.5l-.75 1.516V21M18 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM17.25 4.5L16.5 6.016V21" />
    </svg>
  ),
};