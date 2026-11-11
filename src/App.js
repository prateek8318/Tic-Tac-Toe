import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/app/AppShell';
import { StatsProvider } from './context/StatsContext';
import Home from './pages/Home';
import Play from './pages/Play';
import Stats from './pages/Stats';
import About from './components/AboutUs';
import Contact from './components/contact';
import { load, save } from './lib/storage';

const initialTheme = () => {
  const stored = load('arcade-theme-v2', null);
  if (stored) return stored;
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

function App() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#090b12' : '#f5f6fb');
    save('arcade-theme-v2', theme);
  }, [theme]);

  return (
    <StatsProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<AppShell theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />}>
            <Route index element={<Home />} />
            <Route path="play/:gameId" element={<Play />} />
            <Route path="stats" element={<Stats />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="board" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StatsProvider>
  );
}

export default App;
