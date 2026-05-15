import useStore from '../context/store';
import '../styles/orb.css';

export default function OrbButtons({ onListen, onAnswer, onStop, isListening, isAnswering }) {
  const orbState = useStore(s => s.orbState);

  return (
    <div className="orb-buttons">
      <button
        className={`orb-btn orb-btn-listen ${orbState === 'listening' ? 'active' : ''}`}
        onClick={onListen}
        disabled={orbState === 'thinking' || orbState === 'speaking'}
      >
        <span>🎤</span> LISTEN
      </button>
      <button
        className={`orb-btn orb-btn-answer ${orbState === 'speaking' ? 'active' : ''}`}
        onClick={onAnswer}
        disabled={orbState === 'listening' || orbState === 'thinking'}
      >
        <span>💬</span> ANSWER
      </button>
      <button
        className={`orb-btn orb-btn-stop ${orbState === 'idle' ? '' : 'active'}`}
        onClick={onStop}
        disabled={orbState === 'idle'}
      >
        <span>⏹</span> STOP
      </button>
    </div>
  );
}
