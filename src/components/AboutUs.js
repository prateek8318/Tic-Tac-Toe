import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Users, Zap, Trophy, Code, Heart } from 'lucide-react';
import './AboutUs.css';

function About() {
  const features = [
    {
      icon: Gamepad2,
      title: 'Multiple Games',
      description: 'Enjoy Tic-Tac-Toe, Memory Game, and Rock Paper Scissors in one place'
    },
    {
      icon: Zap,
      title: 'Modern Design',
      description: 'Beautiful animations, gradients, and glassmorphism effects'
    },
    {
      icon: Trophy,
      title: 'Score Tracking',
      description: 'Track your wins and progress across all games'
    },
    {
      icon: Users,
      title: 'User Friendly',
      description: 'Intuitive interface with smooth interactions'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="about-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="about-container">
        <motion.div 
          className="about-header"
          variants={itemVariants}
        >
          <h1 className="about-title">
            <Gamepad2 size={40} />
            About Game Hub
          </h1>
          <p className="about-subtitle">
            Your ultimate destination for classic games with modern twist
          </p>
        </motion.div>

        <motion.div 
          className="about-content"
          variants={itemVariants}
        >
          <div className="about-description">
            <h2>Welcome to the Future of Gaming!</h2>
            <p>
              Game Hub brings together three classic games - Tic-Tac-Toe, Memory Game, and Rock Paper Scissors - 
              with stunning modern design, smooth animations, and engaging sound effects. Whether you're looking to 
              challenge your memory, test your strategy, or enjoy quick fun, we've got you covered.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="feature-card"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="feature-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div 
          className="tech-stack"
          variants={itemVariants}
        >
          <h2 className="tech-title">
            <Code size={24} />
            Built With Modern Technology
          </h2>
          <div className="tech-list">
            <div className="tech-item">
              <span className="tech-name">React</span>
              <span className="tech-desc">Interactive UI Components</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">Framer Motion</span>
              <span className="tech-desc">Smooth Animations</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">Tailwind CSS</span>
              <span className="tech-desc">Modern Styling</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">Web Audio API</span>
              <span className="tech-desc">Dynamic Sound Effects</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="about-footer"
          variants={itemVariants}
        >
          <div className="footer-content">
            <h3 className="footer-title">
              <Heart size={20} />
              Made with Passion
            </h3>
            <p>
              This project is a labor of love, combining classic gaming nostalgia with 
              modern web technologies to create an unforgettable gaming experience.
            </p>
            <div className="footer-stats">
              <div className="stat">
                <span className="stat-number">3</span>
                <span className="stat-label">Games</span>
              </div>
              <div className="stat">
                <span className="stat-number">∞</span>
                <span className="stat-label">Fun</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Responsive</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default About;
