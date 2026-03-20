import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

function Footer() {
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <motion.footer 
      className="footer"
      initial="hidden"
      animate="visible"
      variants={footerVariants}
    >
      <div className="footer-container">
        <div className="footer-grid">
          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="footer-brand">
              <span className="footer-icon">🎮</span>
              <h3 className="footer-title">Game Hub</h3>
            </div>
            <p className="footer-description">
              Experience multiple games with modern design, animations, and sound effects. 
              Play Tic-Tac-Toe, Memory Game, Rock Paper Scissors and enjoy hours of fun!
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="social-link"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/board" className="footer-link">Home</a></li>
              <li><a href="/about" className="footer-link">About</a></li>
              <li><a href="/contact" className="footer-link">Contact</a></li>
            </ul>
          </motion.div>

          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="footer-heading">Contact Info</h4>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={16} />
                <span>pk8041401@gmail.com</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+91 7388437791</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>India</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="footer-divider"></div>
          <p className="footer-copyright">
            {new Date().getFullYear()} Game Hub. All rights reserved. 
            Made with ❤️ using React & Tailwind CSS
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;