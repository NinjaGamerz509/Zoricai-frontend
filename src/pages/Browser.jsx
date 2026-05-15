import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

// ── Human-like AI cursor with trail ─────────────────────────────────────────
function AiCursor({ x, y, clicking, scrolling }) {
  return (
    <motion.div
      animate={{ x, y, scale: clicking ? 0.7 : 1 }}
      transition={{ type: 'spring', stiffness: 80, damping: 12 }}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 99 }}
    >
      {/* Cursor arrow */}
      <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
        <path d="M2 2L2 18L6 14L9 20L11 19L8 13L14 13L2 2Z"
          fill="#00d4ff" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
      </svg>
      {/* Click ripple */}
      {clicking && (
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute', top: -8, left: -8,
            width: 24, height: 24, borderRadius: '50%',
            border: '2px solid #00d4ff',
          }}
        />
      )}
      {/* Scroll indicator */}
      {scrolling && (
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
          style={{
            position: 'absolute', top: 20, left: 4,
            color: '#00d4ff', fontSize: 10,
            fontFamily: 'Share Tech Mono',
            textShadow: '0 0 6px #00d4ff',
          }}
        >↓↓</motion.div>
      )}
    </motion.div>
  );
}

// ── Activity log item ────────────────────────────────────────────────────────
function ActivityItem({ item }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', gap: 7, padding: '4px 0',
        borderBottom: '1px solid rgba(0,212,255,0.05)',
      }}
    >
      <span style={{ fontSize: 10, flexShrink: 0 }}>{item.icon}</span>
      <span style={{
        fontFamily: 'Share Tech Mono', fontSize: 10, lineHeight: 1.5,
        color: item.type === 'done' ? '#00ff88'
             : item.type === 'error' ? '#ff4444'
             : item.type === 'click' ? '#ffaa00'
             : item.type === 'scroll' ? '#a0d8ef'
             : '#00d4ff',
      }}>{item.text}</span>
    </motion.div>
  );
}

// ── Mini iframe preview panel ────────────────────────────────────────────────
function MiniPreview({ url, cursorX, cursorY, clicking, scrolling, isLoading }) {
  const iframeRef = useRef(null);

  return (
    <div style={{
      background: 'rgba(4,4,10,0.95)',
      border: '1px solid rgba(0,212,255,0.25)',
      borderRadius: 10, overflow: 'hidden',
      position: 'relative', height: 260,
      boxShadow: '0 0 20px rgba(0,212,255,0.08)',
    }}>
      {/* Mini browser chrome */}
      <div style={{
        background: 'rgba(0,212,255,0.08)',
        borderBottom: '1px solid rgba(0,212,255,0.15)',
        padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {['#ff5f57','#ffbd2e','#28ca41'].map((c,i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: 3,
          padding: '2px 7px', fontFamily: 'Share Tech Mono', fontSize: 8, color: '#8888aa',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{url || 'about:blank'}</div>
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              border: '1.5px solid rgba(0,212,255,0.2)',
              borderTop: '1.5px solid #00d4ff', flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Iframe container with AI cursor overlay */}
      <div style={{ position: 'relative', height: 'calc(100% - 26px)', overflow: 'hidden' }}>
        {url ? (
          <>
            <iframe
              ref={iframeRef}
              src={url}
              style={{
                width: '300%', height: '300%',
                transform: 'scale(0.333)', transformOrigin: '0 0',
                border: 'none', pointerEvents: 'none',
                filter: 'brightness(0.9) saturate(0.8)',
              }}
              sandbox="allow-same-origin allow-scripts"
              title="AI Browser Preview"
            />
            {/* Overlay to block interactions */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }} />
          </>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: '#333344',
            fontFamily: 'Share Tech Mono', fontSize: 9,
          }}>// No page loaded</div>
        )}

        {/* AI Cursor overlay */}
        {url && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
            <AiCursor x={cursorX} y={cursorY} clicking={clicking} scrolling={scrolling} />
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 30,
              background: 'rgba(4,4,10,0.7)',
              backdropFilter: 'blur(2px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                border: '2px solid rgba(0,212,255,0.15)',
                borderTop: '2px solid #00d4ff',
              }}
            />
            <span style={{ color: '#00d4ff', fontFamily: 'Share Tech Mono', fontSize: 9 }}>
              AI READING...
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── History card ─────────────────────────────────────────────────────────────
function HistoryCard({ item, onClick }) {
  return (
    <motion.div whileHover={{ borderColor: 'rgba(0,212,255,0.5)', x: 2 }}
      onClick={() => onClick(item)}
      style={{
        background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: 7, padding: '7px 9px', cursor: 'pointer', marginBottom: 5,
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
        {item.favicon && (
          <img src={item.favicon} width={11} height={11} style={{ borderRadius: 2 }}
            onError={e => e.target.style.display = 'none'} />
        )}
        <span style={{ color: '#00d4ff', fontFamily: 'Share Tech Mono', fontSize: 9,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title?.slice(0, 22) || item.url}
        </span>
      </div>
      <div style={{ color: '#444455', fontFamily: 'Share Tech Mono', fontSize: 8,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.url}
      </div>
    </motion.div>
  );
}

// ── Main Browser Page ────────────────────────────────────────────────────────
export default function BrowserPage() {
  const [url, setUrl] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askLoading, setAskLoading] = useState(false);

  // AI cursor state
  const [cursorX, setCursorX] = useState(30);
  const [cursorY, setCursorY] = useState(40);
  const [clicking, setClicking] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  // Activity log
  const [activityLog, setActivityLog] = useState([]);
  const [aiActive, setAiActive] = useState(false);
  const activityRef = useRef(null);

  const addActivity = (text, type = 'action', icon = '▶') => {
    setActivityLog(prev => [...prev.slice(-30), { text, type, icon, id: Date.now() + Math.random() }]);
    setTimeout(() => {
      if (activityRef.current) activityRef.current.scrollTop = activityRef.current.scrollHeight;
    }, 80);
  };

  // Simulate human-like AI behavior
  const simulateHumanBehavior = async (targetUrl) => {
    setAiActive(true);
    setActivityLog([]);

    // Step 1: Move to address bar and type
    addActivity('Address bar mein URL type kar raha hoon...', 'action', '⌨️');
    setCursorX(80); setCursorY(12);
    await sleep(500);

    // Click address bar
    setClicking(true);
    addActivity('Address bar click kiya!', 'click', '🖱️');
    await sleep(300);
    setClicking(false);
    await sleep(400);

    // Step 2: Move to go button
    setCursorX(185); setCursorY(12);
    await sleep(600);
    setClicking(true);
    addActivity('GO button press kar raha hoon...', 'click', '🖱️');
    await sleep(300);
    setClicking(false);

    // Step 3: Wait for page
    addActivity('Page load ho raha hai...', 'action', '⏳');
    await sleep(800);

    // Step 4: Scroll through page
    const scrollSteps = [
      { x: 110, y: 60, text: 'Title padh raha hoon...', icon: '📄', type: 'action' },
      { x: 80, y: 90, text: 'Content scan kar raha hoon...', icon: '🔍', type: 'scroll', scroll: true },
      { x: 130, y: 120, text: 'Important sections dhundh raha hoon...', icon: '📝', type: 'action' },
      { x: 70, y: 150, text: 'Data extract kar raha hoon...', icon: '⚡', type: 'scroll', scroll: true },
      { x: 100, y: 180, text: 'Links note kar raha hoon...', icon: '🔗', type: 'action' },
      { x: 90, y: 200, text: 'Summary bana raha hoon...', icon: '🤖', type: 'action' },
    ];

    for (const step of scrollSteps) {
      setCursorX(step.x); setCursorY(step.y);
      if (step.scroll) {
        setScrolling(true);
        await sleep(400);
        setScrolling(false);
      }
      addActivity(step.text, step.type, step.icon);
      await sleep(700);
    }
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const fetchPage = async (fetchUrl) => {
    const target = (fetchUrl || url).trim();
    if (!target) return;

    let fullUrl = target;
    if (!fullUrl.startsWith('http')) fullUrl = 'https://' + fullUrl;

    setLoading(true);
    setExpanded(false);
    setAnswer('');
    setCurrentPage(null);
    setIframeUrl(fullUrl); // Show iframe immediately
    setUrl(fullUrl);

    simulateHumanBehavior(fullUrl);

    try {
      const res = await api.post('/browser/fetch', { url: fullUrl });
      if (res.data.success) {
        setCurrentPage(res.data);
        setHistory(prev => [res.data, ...prev.filter(h => h.url !== res.data.url)].slice(0, 8));
        addActivity(`"${res.data.title?.slice(0, 25)}" — complete! `, 'done', '✅');
        // Reset cursor to center after done
        setCursorX(110); setCursorY(100);
      }
    } catch (err) {
      addActivity('Fetch failed: ' + (err.response?.data?.message || err.message), 'error', '❌');
      setCurrentPage({
        title: 'Error', url: fullUrl, error: true,
        summary: err.response?.data?.message || 'Page fetch nahi ho paya',
        content: '', links: [],
      });
    } finally {
      setLoading(false);
      setAiActive(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim() || !currentPage?.content) return;
    setAskLoading(true);
    setAnswer('');
    addActivity(`Question: "${question.slice(0, 28)}..."`, 'action', '❓');
    try {
      const res = await api.post('/browser/analyze', {
        content: currentPage.content,
        question: question.trim(),
        title: currentPage.title,
      });
      setAnswer(res.data.answer);
      addActivity('Answer ready!', 'done', '💡');
    } catch {
      setAnswer('Error: Question process nahi ho paya');
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50 }}>
      <Navbar />
      <Sidebar />

      <div style={{ marginLeft: 240, padding: '14px', display: 'flex', gap: 12, height: 'calc(100vh - 64px)' }}>

        {/* ── LEFT: AI Live Panel ── */}
        <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

          <div style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#555566', letterSpacing: 2 }}>
            🤖 AI SCREEN
          </div>

          {/* Real iframe preview */}
          <MiniPreview
            url={iframeUrl}
            cursorX={cursorX}
            cursorY={cursorY}
            clicking={clicking}
            scrolling={scrolling}
            isLoading={loading}
          />

          {/* Activity log */}
          <div style={{
            flex: 1, background: 'rgba(4,4,10,0.95)',
            border: '1px solid rgba(0,212,255,0.13)',
            borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              padding: '6px 9px', borderBottom: '1px solid rgba(0,212,255,0.08)',
              background: 'rgba(0,212,255,0.04)', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {aiActive && (
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: '#00d4ff', flexShrink: 0 }}
                />
              )}
              <span style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', letterSpacing: 2 }}>
                AI ACTIVITY
              </span>
            </div>
            <div ref={activityRef} style={{ flex: 1, overflowY: 'auto', padding: '7px 9px' }}>
              {activityLog.length === 0 && (
                <div style={{ color: '#333344', fontFamily: 'Share Tech Mono', fontSize: 8, textAlign: 'center', marginTop: 12 }}>
                  // Waiting...
                </div>
              )}
              {activityLog.map(item => <ActivityItem key={item.id} item={item} />)}
            </div>
          </div>

          {/* History */}
          <div style={{
            background: 'rgba(4,4,10,0.95)', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: 8, padding: '9px', maxHeight: 140, overflowY: 'auto',
          }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', letterSpacing: 2, marginBottom: 7 }}>
              HISTORY
            </div>
            {history.length === 0
              ? <div style={{ color: '#333344', fontFamily: 'Share Tech Mono', fontSize: 8 }}>// Empty</div>
              : history.map((item, i) => (
                  <HistoryCard key={i} item={item} onClick={p => { setCurrentPage(p); setUrl(p.url); setIframeUrl(p.url); }} />
                ))
            }
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, overflow: 'hidden' }}>

          {/* Address bar */}
          <div style={{
            background: 'rgba(11,11,18,0.97)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 10, padding: '8px 13px',
            display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: loading ? '#ffaa00' : currentPage ? '#00ff88' : '#555566',
              boxShadow: loading ? '0 0 6px #ffaa00' : currentPage ? '0 0 6px #00ff88' : 'none',
              flexShrink: 0,
            }} />
            {currentPage?.favicon && !loading && (
              <img src={currentPage.favicon} width={14} height={14} style={{ borderRadius: 2, flexShrink: 0 }}
                onError={e => e.target.style.display = 'none'} />
            )}
            <input
              value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchPage()}
              placeholder="URL daalo... (e.g. cricbuzz.com)"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#e0e0e0', fontFamily: 'Share Tech Mono', fontSize: 12, caretColor: '#00d4ff',
              }}
            />
            <button onClick={() => fetchPage()} disabled={loading} style={{
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: 6, padding: '5px 12px', color: '#00d4ff',
              fontFamily: 'Orbitron', fontSize: 8, letterSpacing: 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>{loading ? 'LOADING...' : 'GO →'}</button>
          </div>

          {/* Page content */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 11 }}>

            {/* Empty state */}
            {!currentPage && !loading && (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 12,
                background: 'rgba(11,11,18,0.95)', border: '1px solid rgba(0,212,255,0.09)',
                borderRadius: 12, minHeight: 300,
              }}>
                <div style={{ fontSize: 36 }}>🌐</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#555566', letterSpacing: 3 }}>ZORIC BROWSER</div>
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#444455' }}>
                  URL daalo — ZORIC live padhega
                </div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                  {['cricbuzz.com', 'github.com', 'wikipedia.org', 'dev.to'].map(site => (
                    <button key={site} onClick={() => { setUrl(site); fetchPage(site); }} style={{
                      background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
                      borderRadius: 20, padding: '4px 11px', color: '#8888aa',
                      fontFamily: 'Share Tech Mono', fontSize: 9, cursor: 'pointer',
                    }}>{site}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && !currentPage && (
              <div style={{
                background: 'rgba(11,11,18,0.95)', border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 12, padding: '30px', textAlign: 'center',
              }}>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ color: '#00d4ff', fontFamily: 'Orbitron', fontSize: 11, letterSpacing: 2 }}
                >
                  ZORIC IS READING THE PAGE...
                </motion.div>
              </div>
            )}

            {/* Page result */}
            {currentPage && (
              <>
                {/* Page header */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => !currentPage.error && setExpanded(true)}
                  whileHover={!currentPage.error ? { borderColor: 'rgba(0,212,255,0.5)' } : {}}
                  style={{
                    background: 'rgba(11,11,18,0.97)',
                    border: `1px solid ${currentPage.error ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,255,0.2)'}`,
                    borderRadius: 10, padding: '13px 16px',
                    cursor: currentPage.error ? 'default' : 'pointer', flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    {currentPage.favicon && (
                      <img src={currentPage.favicon} width={15} height={15} style={{ borderRadius: 2 }}
                        onError={e => e.target.style.display = 'none'} />
                    )}
                    <span style={{ color: currentPage.error ? '#ff4444' : '#00d4ff', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 15 }}>
                      {currentPage.title}
                    </span>
                    {!currentPage.error && (
                      <span style={{ marginLeft: 'auto', color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 8 }}>
                        CLICK TO EXPAND ▼
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 8, marginTop: 3 }}>
                    {currentPage.url}
                  </div>
                </motion.div>

                {/* AI Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{
                    background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
                    borderRadius: 10, padding: '13px 16px',
                  }}
                >
                  <div style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#00d4ff', letterSpacing: 2, marginBottom: 9 }}>
                    ⚡ ZORIC SUMMARY
                  </div>
                  <div style={{ color: '#d0f0ff', fontFamily: 'Rajdhani', fontSize: 14, lineHeight: 1.7, fontWeight: 500 }}>
                    {currentPage.summary}
                  </div>
                </motion.div>

                {/* Ask question */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  style={{
                    background: 'rgba(11,11,18,0.97)', border: '1px solid rgba(123,47,255,0.22)',
                    borderRadius: 10, padding: '13px 15px',
                  }}
                >
                  <div style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#7b2fff', letterSpacing: 2, marginBottom: 9 }}>
                    🤖 IS PAGE KE BAARE MEIN PUCHO
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={question} onChange={e => setQuestion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && askQuestion()}
                      placeholder="Kuch bhi pucho is page ke baare mein..."
                      style={{
                        flex: 1, background: 'rgba(123,47,255,0.06)',
                        border: '1px solid rgba(123,47,255,0.18)',
                        borderRadius: 7, padding: '7px 11px',
                        color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 13,
                        outline: 'none', caretColor: '#7b2fff',
                      }}
                    />
                    <button onClick={askQuestion} disabled={askLoading || !question.trim()} style={{
                      background: 'rgba(123,47,255,0.14)', border: '1px solid rgba(123,47,255,0.38)',
                      borderRadius: 7, padding: '7px 13px', color: '#7b2fff',
                      fontFamily: 'Orbitron', fontSize: 8, letterSpacing: 1, cursor: 'pointer',
                    }}>{askLoading ? '...' : 'ASK →'}</button>
                  </div>
                  <AnimatePresence>
                    {answer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{
                          marginTop: 10, padding: '10px 12px',
                          background: 'rgba(123,47,255,0.06)', border: '1px solid rgba(123,47,255,0.2)',
                          borderRadius: 7, color: '#d0c0ff', fontFamily: 'Rajdhani', fontSize: 13,
                          lineHeight: 1.7, fontWeight: 500,
                        }}
                      >
                        {answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded modal ── */}
      <AnimatePresence>
        {expanded && currentPage && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setExpanded(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 400 }}
            />
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              style={{
                position: 'fixed', top: '4%', left: '50%', transform: 'translateX(-50%)',
                width: '80vw', maxHeight: '90vh',
                background: 'rgba(6,6,14,0.99)', border: '1px solid rgba(0,212,255,0.45)',
                borderRadius: 16, boxShadow: '0 0 80px rgba(0,212,255,0.2)',
                zIndex: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}
            >
              <div style={{
                padding: '11px 17px', borderBottom: '1px solid rgba(0,212,255,0.12)',
                background: 'rgba(0,212,255,0.04)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0,
              }}>
                {currentPage.favicon && (
                  <img src={currentPage.favicon} width={15} height={15} style={{ borderRadius: 2 }}
                    onError={e => e.target.style.display = 'none'} />
                )}
                <span style={{ color: '#00d4ff', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13 }}>{currentPage.title}</span>
                <span style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 8, flex: 1 }}>{currentPage.url}</span>
                <button onClick={() => setExpanded(false)} style={{
                  background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                  borderRadius: 6, padding: '3px 9px', color: '#ff4444',
                  fontFamily: 'Orbitron', fontSize: 7, cursor: 'pointer', letterSpacing: 1,
                }}>✕ CLOSE</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', letterSpacing: 2, marginBottom: 10 }}>PAGE CONTENT</div>
                  <div style={{ color: '#c0d8e8', fontFamily: 'Rajdhani', fontSize: 13, lineHeight: 1.85, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                    {currentPage.content?.slice(0, 4000)}
                    {currentPage.content?.length > 4000 && <span style={{ color: '#444455' }}>{'\n\n'}... [truncated]</span>}
                  </div>
                </div>
                {currentPage.links?.length > 0 && (
                  <div style={{ width: 200, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', letterSpacing: 2, marginBottom: 9 }}>
                      LINKS ({currentPage.links.length})
                    </div>
                    {currentPage.links.slice(0, 14).map((link, i) => (
                      <div key={i}
                        onClick={() => { setExpanded(false); setUrl(link.url); fetchPage(link.url); }}
                        style={{
                          padding: '5px 7px', borderRadius: 6,
                          background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.08)',
                          marginBottom: 5, cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.08)'}
                      >
                        <div style={{ color: '#00d4ff', fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 600 }}>{link.text}</div>
                        <div style={{ color: '#444455', fontFamily: 'Share Tech Mono', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
