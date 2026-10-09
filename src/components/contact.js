import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, User, CheckCircle } from 'lucide-react';
import './Contact.css';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      const subject = encodeURIComponent(`Game Hub message from ${formData.name.trim()}`);
      const body = encodeURIComponent(`${formData.message.trim()}\n\nFrom: ${formData.name.trim()} (${formData.email.trim()})`);
      window.location.href = `mailto:pk8041401@gmail.com?subject=${subject}&body=${body}`;
      setSubmitted(true);
    }
  };

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
      className="contact-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="contact-container">
        <motion.div 
          className="contact-header"
          variants={itemVariants}
        >
          <h1 className="contact-title">
            <MessageSquare size={40} />
            Let's talk <span>games.</span>
          </h1>
          <p className="contact-subtitle">
            Found a bug, have a game idea, or just want to say hi? Drop a note and we’ll open it in your email app.
          </p>
        </motion.div>

        <div className="contact-content">
          <motion.div 
            className="contact-info"
            variants={itemVariants}
          >
            <div className="info-card">
                <div className="contact-card-intro"><span className="contact-orb"><MessageSquare size={22}/></span><strong>Good games get better together.</strong><p>Feedback and wild ideas are always welcome.</p></div>
                <a className="info-item" href="mailto:pk8041401@gmail.com?subject=Hello%20Game%20Hub">
                <div className="info-icon">
                  <Mail size={20} />
                </div>
                <div className="info-text">
                  <span className="info-label">Email</span>
                  <span className="info-value">pk8041401@gmail.com</span>
                </div>
                </a>
              
                <a className="info-item" href="tel:+917388437791">
                <div className="info-icon">
                  <Phone size={20} />
                </div>
                <div className="info-text">
                  <span className="info-label">Phone</span>
                  <span className="info-value">+91 7388437791</span>
                </div>
                </a>
              
                <div className="info-item">
                <div className="info-icon">
                  <MapPin size={20} />
                </div>
                <div className="info-text">
                  <span className="info-label">Location</span>
                  <span className="info-value">India</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="contact-form-section"
            variants={itemVariants}
          >
            {submitted && (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle size={24} />
                <span>Email draft is ready. Review it in your email app and press send.</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">
                  <User size={16} />
                  Your Name
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your name"
                  required
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="your.email@example.com"
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">
                  <MessageSquare size={16} />
                  Your Message
                </label>
                <textarea
                  name="message"
                  id="contact-message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Tell us what's on your mind..."
                  rows="5"
                  required
                />
                {errors.message && <span className="error-message">{errors.message}</span>}
              </div>

              <motion.button
                type="submit"
                className="submit-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={18} />
                Open email draft
              </motion.button>
            </form>
            <p className="contact-privacy">Your message stays in your email app until you choose to send it.</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default ContactForm;
