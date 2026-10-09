import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'
import GameHub from './components/game/GameHub';
import About from './components/AboutUs';
import Contact from './components/contact';
import Footer from './components/Footer';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('arcade-theme') || 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('arcade-theme', theme);
  }, [theme]);
  return (
    <div className="App min-h-screen flex flex-col" data-theme={theme}>
      <Router>
        <Navbar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <main className="flex-grow">
          <Routes>
                <Route path="/" element={<GameHub/>} />
                <Route path="/about" element={<About/>} /> 
                <Route path="/board" element={<GameHub/>} /> 
                <Route path='/contact' element={<Contact/>}/>
                </Routes>
        </main>
        <Footer/>
      </Router>
    </div>
  );
}

export default App;
