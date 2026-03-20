# 🎮 Game Hub - Multi-Game Platform

A modern, interactive web application featuring multiple classic games built with React, Tailwind CSS, and Framer Motion. This platform offers an engaging gaming experience with beautiful animations, sound effects, and responsive design.

## 🎯 Features

### Games Included
- **🎯 Tic-Tac-Toe** - Classic strategy game with AI opponent
- **✂️ Rock Paper Scissors** - Hand gesture game with animated battles
- **🧠 Memory Game** - Card matching game to test your memory

### Key Features
- 🎨 **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- ✨ **Smooth Animations** - Engaging transitions using Framer Motion
- 🎊 **Winner Celebrations** - Confetti effects for victories
- 🔊 **Sound Effects** - Interactive audio feedback
- 📊 **Score Tracking** - Persistent score board for all games
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🌙 **Dark Mode Support** - Eye-friendly dark theme option

## 🚀 Tech Stack

- **Frontend**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.14
- **Animations**: Framer Motion 12.38.0
- **Icons**: Lucide React 0.577.0
- **Routing**: React Router DOM 6.27.0
- **Effects**: Canvas Confetti 1.9.4
- **Email**: EmailJS Browser 4.4.1
- **Testing**: Jest & React Testing Library

## 📁 Project Structure

```
src/
├── components/
│   ├── game/                 # Game components
│   │   ├── TicTacToeGame.js  # Tic-Tac-Toe logic
│   │   ├── RockPaperScissors.js # RPS game logic
│   │   ├── MemoryGame.js     # Memory card game
│   │   ├── GameHub.js        # Main game selector
│   │   └── ...
│   ├── ui/                   # Reusable UI components
│   ├── Navbar.js             # Navigation bar
│   ├── Footer.js             # Footer component
│   └── AboutUs.js            # About page
├── hooks/
│   ├── useGameLogic.js       # Custom game logic hook
│   └── useSound.js           # Sound management hook
└── utils/                    # Utility functions
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tic-tac-toe.git
   cd tic-tac-toe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

### Tic-Tac-Toe
1. Choose your symbol (X or O)
2. Click on any empty cell to make your move
3. Get 3 in a row (horizontal, vertical, or diagonal) to win
4. Play against AI or with friends

### Rock Paper Scissors
1. Choose your move: Rock, Paper, or Scissors
2. Watch the animated battle
3. Rock beats Scissors, Scissors beats Paper, Paper beats Rock
4. First to 5 wins wins the match

### Memory Game
1. Click cards to flip them over
2. Remember the positions of matching pairs
3. Match all pairs to win
4. Timer tracks your completion speed

## 🌟 Advanced Features

### Custom Hooks
- **useGameLogic** - Centralized game state management
- **useSound** - Audio effect management with mute options

### Animations & Effects
- Smooth page transitions
- Card flip animations
- Winner celebration confetti
- Hover effects and micro-interactions

### Responsive Design
- Mobile-first approach
- Touch-friendly controls
- Adaptive layouts for all screen sizes

## 📧 Contact Features

The application includes a contact form powered by EmailJS for user feedback and inquiries.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📦 Build for Production

Create an optimized production build:
```bash
npm run build
```

The build files will be in the `build/` directory, ready for deployment.

## 🚀 Deployment

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy!

### Vercel
1. Import your project from GitHub
2. Vercel will auto-detect React settings
3. Deploy with one click

### Other Platforms
The build output can be deployed to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for beautiful animations
- All contributors and users of this project

## 📞 Support

If you have any questions or feedback, feel free to:
- Open an issue on GitHub
- Use the contact form in the application
- Reach out via email

---

**Built with ❤️ using React and modern web technologies**
