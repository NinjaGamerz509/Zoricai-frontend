import useStore from '../context/store';

export default function ActiveTaskBar() {
  const { agents, agentsActive } = useStore();

  const getStatusColor = (status) => {
    if (status === 'done') return '#00ff88';
    if (status === 'working') return '#00d4ff';
    return '#8888aa';
  };

  const completedCount = agents.filter(a => a.status === 'done').length;
  const progress = agents.length > 0 ? (completedCount / agents.length) * 100 : 0;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(10,10,15,0.95)',
      borderTop: '1px solid rgba(0,212,255,0.2)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: agentsActive ? '#00d4ff' : '#8888aa',
          boxShadow: agentsActive ? '0 0 10px #00d4ff' : 'none',
          animation: agentsActive ? 'pulse-cyan 1s infinite' : 'none'
        }} />
        <span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#00d4ff', letterSpacing: 2 }}>
          ACTIVE TASK
        </span>
      </div>

      {/* Agents */}
      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
        {agentsActive && agents.map(agent => (
          <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: getStatusColor(agent.status),
              boxShadow: `0 0 6px ${getStatusColor(agent.status)}`
            }} />
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: getStatusColor(agent.status) }}>
              {agent.name}: {agent.task}
            </span>
          </div>
        ))}
        {!agentsActive && (
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#8888aa' }}>
            // SYSTEM IDLE — AWAITING COMMAND
          </span>
        )}
      </div>

      {/* Progress bar */}
      {agentsActive && (
        <div style={{ width: 200, height: 3, background: 'rgba(0,212,255,0.1)', borderRadius: 2 }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00d4ff, #7b2fff)',
            borderRadius: 2,
            transition: 'width 0.3s ease',
            boxShadow: '0 0 8px #00d4ff'
          }} />
        </div>
      )}

      {/* Right */}
      <span style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#8888aa', letterSpacing: 1 }}>
        MODEL: ZORIC V4.2 ✦
      </span>
    </div>
  );
}
