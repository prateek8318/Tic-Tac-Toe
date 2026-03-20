import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'
import GameHub from './components/game/GameHub';
import About from './components/AboutUs';
import Contact from './components/contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App min-h-screen flex flex-col">
      <Router>
        <Navbar/>
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