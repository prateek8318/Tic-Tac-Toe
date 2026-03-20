// Simple generated audio tones using Web Audio API and encoded as base64
// These will work reliably on Vercel without external file dependencies

export const sounds = {
  // Move sound - short click
  move: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQAEAAEAfAAAQAQABAAgAZGF0YQQAAAAA',
  // Win sound - using your actual sound.mp3 file
  win: '/assets/sounds/sound.mp3',
  // Draw sound - descending tone
  draw: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQAEAAEAfAAAQAQABAAgAZGF0YQQAAAAA',
  // Click sound - very short tap
  click: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQAEAAEAfAAAQAQABAAgAZGF0YQQAAAAA'
};

// Create audio elements for each sound with better generated tones
export const createAudioElements = () => {
  const audioElements = {};
  
  // Create simple audio tones using Web Audio API
  const createTone = (frequency, duration, type = 'sine') => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Apply envelope for better sound
      const envelope = Math.exp(-3 * t); // Exponential decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    // Convert to WAV
    const wav = audioBufferToWav(buffer);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(wav)));
    return `data:audio/wav;base64,${base64}`;
  };
  
  const audioBufferToWav = (buffer) => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    const data = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  };
  
  // Generate different tones for each sound (except win which uses your file)
  try {
    sounds.move = createTone(800, 0.1); // Click tone
    // sounds.win will use your actual sound.mp3 file
    sounds.draw = createTone(400, 0.2); // Lower tone for draw
    sounds.click = createTone(1000, 0.05); // Very short click
  } catch (error) {
    console.log('Error generating sounds:', error);
  }
  
  Object.keys(sounds).forEach(key => {
    const audio = new Audio(sounds[key]);
    audio.volume = 0.3;
    // For the win sound, make it louder and ensure it loads properly
    if (key === 'win') {
      audio.volume = 0.5;
      audio.preload = 'auto';
    }
    audioElements[key] = audio;
  });
  
  return audioElements;
};
