import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Users, Phone } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen); 
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } }
  };

  const navItems = [
    { icon: Home, text: 'Home', href: '/board' },
    { icon: Users, text: 'About', href: '/about' },
    { icon: Phone, text: 'Contact', href: '/contact' }
  ];

  return (
    <motion.nav 
      className="navbar"
      initial="hidden"
      animate="visible"
      variants={menuVariants}
    >
      <div className="navbar-container">
        <div className="navbar-brand">
          <motion.a 
            href="/board" 
            className="brand-link"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="brand-icon">🎮</span>
            <span className="brand-text">Game Hub</span>
          </motion.a>
        </div>

        <div className="navbar-menu">
          <div className="desktop-menu">
            {navItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                className="menu-item"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <item.icon size={18} />
                <span>{item.text}</span>
              </motion.a>
            ))}
          </div>

          <motion.button
            className="mobile-menu-button"
            onClick={toggleMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? <X key="close" size={24} /> : <Menu key="menu" size={24} />}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {navItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                className="mobile-menu-item"
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon size={20} />
                <span>{item.text}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
