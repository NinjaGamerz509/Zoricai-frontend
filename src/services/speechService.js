let recognition = null;
let currentAudio = null;
let wakeRecognition = null;
let commandRecognition = null;
let wakeWordActive = false;
let restartTimer = null;

export const startListening = (onResult, onEnd) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition not supported');
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;
  recognition.onresult = (e) => onResult(e.results[0][0].transcript);
  recognition.onend = () => { if (onEnd) onEnd(); };
  recognition.onerror = (e) => { console.error('Speech error:', e); if (onEnd) onEnd(); };
  recognition.start();
};

export const stopListening = () => {
  if (recognition) { recognition.stop(); recognition = null; }
};

export const startWakeWordListener = (onWake, onCommand, onEnd) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
  if (wakeWordActive) return;
  wakeWordActive = true;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let isListeningForCommand = false;
  let restartCount = 0;

  const listenForWake = () => {
    if (!wakeWordActive || isListeningForCommand) return;
    if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
    try { if (wakeRecognition) { try { wakeRecognition.stop(); } catch {} wakeRecognition = null; } } catch {}

    wakeRecognition = new SR();
    wakeRecognition.lang = 'en-IN';
    wakeRecognition.continuous = true;
    wakeRecognition.interimResults = true;
    wakeRecognition.maxAlternatives = 3;

    wakeRecognition.onstart = () => {
      restartCount = 0;
      console.log('🎤 Wake word listening...');
    };

    wakeRecognition.onresult = (event) => {
      if (isListeningForCommand) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (
          transcript.includes('zoric') ||
          transcript.includes('zorik') ||
          transcript.includes('zoriq') ||
          transcript.includes('zorich') ||
          transcript.includes('joric') ||
          transcript.includes('joriq')
        ) {
          isListeningForCommand = true;
          try { wakeRecognition.stop(); } catch {}
          onWake && onWake();
          playWakeGreeting(() => {
            isListeningForCommand = false;
            listenForCommand();
          });
          return;
        }
      }
    };

    wakeRecognition.onend = () => {
      if (!wakeWordActive || isListeningForCommand) return;
      restartCount++;
      const delay = restartCount < 3 ? 100 : 300;
      restartTimer = setTimeout(listenForWake, delay);
    };

    wakeRecognition.onerror = (e) => {
      if (!wakeWordActive || isListeningForCommand) return;
      const delay = e.error === 'network' ? 2000 : e.error === 'not-allowed' ? 5000 : 500;
      restartTimer = setTimeout(listenForWake, delay);
    };

    try { wakeRecognition.start(); } catch (e) {
      restartTimer = setTimeout(listenForWake, 1000);
    }
  };

  // Store listenForWake so playAudio can resume it
  startWakeWordListener._listenForWake = listenForWake;

  const listenForCommand = () => {
    if (!wakeWordActive) return;
    commandRecognition = new SR();
    commandRecognition.lang = 'en-IN';
    commandRecognition.continuous = false;
    commandRecognition.interimResults = false;
    commandRecognition.maxAlternatives = 1;

    const commandTimeout = setTimeout(() => {
      try { commandRecognition.stop(); } catch {}
      isListeningForCommand = false;
      onEnd && onEnd();
      if (wakeWordActive) listenForWake();
    }, 8000);

    commandRecognition.onresult = (e) => {
      clearTimeout(commandTimeout);
      const transcript = e.results[0][0].transcript;
      onCommand && onCommand(transcript);
    };
    commandRecognition.onend = () => {
      clearTimeout(commandTimeout);
      isListeningForCommand = false;
      onEnd && onEnd();
      if (wakeWordActive) restartTimer = setTimeout(listenForWake, 500);
    };
    commandRecognition.onerror = () => {
      clearTimeout(commandTimeout);
      isListeningForCommand = false;
      onEnd && onEnd();
      if (wakeWordActive) restartTimer = setTimeout(listenForWake, 500);
    };
    try { commandRecognition.start(); } catch (e) {
      isListeningForCommand = false;
      if (wakeWordActive) listenForWake();
    }
  };

  listenForWake();
};

const playWakeGreeting = (onDone) => {
  window.speechSynthesis.cancel();
  const greetings = [
    'Haan boss, kya madad kar sakta hoon?',
    'Haan, main yahaan hoon. Batao kya chahiye?',
    'Ji boss, boliye!',
    'Ready hoon boss, kya kaam hai?',
  ];
  const text = greetings[Math.floor(Math.random() * greetings.length)];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 1.25;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
  if (hindiVoice) utterance.voice = hindiVoice;
  utterance.onend = () => { if (onDone) onDone(); };
  utterance.onerror = () => { if (onDone) onDone(); };
  window.speechSynthesis.speak(utterance);
};

export const stopWakeWordListener = () => {
  wakeWordActive = false;
  if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
  window.speechSynthesis.cancel();
  if (wakeRecognition) { try { wakeRecognition.stop(); } catch {} wakeRecognition = null; }
  if (commandRecognition) { try { commandRecognition.stop(); } catch {} commandRecognition = null; }
};

export const playAudio = (audioBlob, onEnd) => {
  stopAudio();

  // Mic off — AI bolne se pehle
  if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
  if (wakeRecognition) { try { wakeRecognition.stop(); } catch {} wakeRecognition = null; }
  console.log('🔇 Mic off — AI bol raha hai');

  const url = URL.createObjectURL(audioBlob);
  currentAudio = new Audio(url);

  currentAudio.onended = () => {
    URL.revokeObjectURL(url);
    // Mic wapas on — AI khatam
    if (wakeWordActive && startWakeWordListener._listenForWake) {
      console.log('🎤 Mic on — AI khatam');
      restartTimer = setTimeout(startWakeWordListener._listenForWake, 500);
    }
    if (onEnd) onEnd();
  };

  currentAudio.onerror = () => {
    if (wakeWordActive && startWakeWordListener._listenForWake) {
      restartTimer = setTimeout(startWakeWordListener._listenForWake, 500);
    }
    if (onEnd) onEnd();
  };

  currentAudio.play().catch(console.error);
  return currentAudio;
};

export const stopAudio = () => {
  window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};
