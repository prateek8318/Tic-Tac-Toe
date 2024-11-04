import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'
import Board from './components/Board';
import About from './components/AboutUs';
import Signin from './components/Signin';
import Signup from './components/Signup';
import Contact from './components/contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Router>
    <Navbar/>
    <Routes>
          <Route path="/about" element={<About/>} /> 
          <Route path="board" element={<Board/>} /> 
          <Route path="signin" element={<Signin/>} /> 
          <Route path="signup" element={<Signup/>} /> 
          <Route path='/contact' element={<Contact/>}/>
          </Routes>
      
      <Footer/>
      </Router>
      </div>
  );
}

export default App;