import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

export function stylistPage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
}): string {
  const body = `
<style>
  /* Phase 3: Immersive Layout - Hide global nav and footer */
  #nb, .ftr, .ftrbt { display: none !important; }
  body { background: var(--bk); margin: 0; padding: 0; overflow: hidden; }

  .adv-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh; /* Full viewport height */
    max-width: 640px;
    margin: 0 auto;
    background: var(--g50);
    position: relative;
    box-shadow: 0 0 40px rgba(0,0,0,0.5);
    font-family: var(--sans);
  }

  .adv-header {
    padding: 16px 24px;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }
  .adv-profile {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .adv-avatar {
    width: 38px; height: 38px;
    background: var(--bk); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--wh); font-size: 14px;
  }
  .adv-info h1 {
    font-family: var(--head); font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--bk); margin: 0; line-height: 1.2;
  }
  .adv-info p {
    font-size: 10px; font-weight: 700; color: var(--green); margin: 0; letter-spacing: 0.5px; text-transform: uppercase; display: flex; align-items: center; gap: 4px;
  }
  .adv-info p::before {
    content: ''; display: inline-block; width: 6px; height: 6px; background: var(--green); border-radius: 50%; animation: pulse-green 2s infinite;
  }
  @keyframes pulse-green { 0%{box-shadow: 0 0 0 0 rgba(22,163,74,0.4)} 70%{box-shadow: 0 0 0 4px rgba(22,163,74,0)} 100%{box-shadow: 0 0 0 0 rgba(22,163,74,0)} }
  
  .adv-close {
    color: var(--g400); font-size: 20px; text-decoration: none; padding: 4px; transition: color 0.2s;
  }
  .adv-close:hover { color: var(--bk); }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
    background: var(--wh);
  }

  .chat-msg {
    max-width: 85%;
    padding: 14px 18px;
    font-size: 14px;
    line-height: 1.6;
    border-radius: 12px;
    position: relative;
    animation: fadeIn 0.3s ease;
  }
  .chat-msg b { font-weight: 800; color: var(--bk); }
  .chat-msg i { color: var(--g600); }
  
  .chat-msg.user {
    align-self: flex-end;
    background: var(--bk);
    color: var(--wh);
    border-bottom-right-radius: 2px;
  }
  .chat-msg.bot {
    align-self: flex-start;
    background: var(--g50);
    color: var(--bk);
    border-top-left-radius: 2px;
    border: 1px solid rgba(0,0,0,.05);
  }

  /* Quick Reply Chips */
  .quick-chips {
    padding: 12px 24px;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    background: var(--wh);
    border-top: 1px solid rgba(0,0,0,0.03);
  }
  .quick-chips::-webkit-scrollbar { display: none; }
  .q-chip {
    white-space: nowrap;
    padding: 8px 16px;
    background: var(--wh);
    border: 1px solid var(--g200);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: var(--bk);
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  .q-chip:hover {
    border-color: var(--bk);
    background: var(--g50);
  }

  .chat-input-area {
    padding: 16px 24px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    gap: 12px;
    border-top: 1px solid rgba(0,0,0,0.05);
  }
  .chat-input {
    flex: 1;
    padding: 16px 20px;
    background: var(--g50);
    border: 1.5px solid transparent;
    border-radius: 24px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: all 0.2s;
  }
  .chat-input:focus {
    background: var(--wh);
    border-color: var(--bk);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  .chat-send {
    width: 52px;
    height: 52px;
    background: var(--bk);
    color: var(--wh);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .chat-send:hover {
    background: var(--g600);
    transform: scale(1.05);
  }

  /* Premium Product Card in Chat */
  .ai-pcard {
    background: var(--wh);
    border: 1px solid var(--g100);
    border-radius: 8px;
    overflow: hidden;
    margin-top: 12px;
    text-decoration: none;
    color: inherit;
    display: block;
    transition: all 0.3s var(--eo);
    box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  }
  .ai-pcard:hover { 
    transform: translateY(-4px); 
    border-color: var(--bk);
    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  }
  .ai-pimg { width: 100%; height: 260px; background: var(--g50); position: relative; }
  .ai-pimg img { width: 100%; height: 100%; object-fit: cover; }
  .ai-pbadge {
    position: absolute;
    top: 12px; left: 12px;
    background: var(--bk); color: var(--wh);
    font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
    padding: 4px 8px; border-radius: 2px;
  }
  .ai-pinfo { padding: 16px; }
  .ai-pname { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-family: var(--head); }
  .ai-pprice { font-size: 14px; font-weight: 700; color: var(--g500); margin-bottom: 16px; }
  .ai-pbtn { 
    width: 100%;
    font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; 
    background: var(--bk); color: var(--wh); padding: 14px; border: none; text-align: center;
    transition: background 0.2s;
    border-radius: 4px;
  }
  .ai-pcard:hover .ai-pbtn { background: var(--g600); }
  
  .chat-typing { display: flex; gap: 4px; padding: 4px 0; }
  .typing-dot { width: 6px; height: 6px; background: var(--g300); border-radius: 50%; animation: typing-bounce 1.2s infinite alternate; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing-bounce { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }

  .chat-options {
    background: var(--wh);
    text-align: center;
    padding: 0 0 16px 0;
  }
  .chat-clear {
    font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--g400); background: none; border: none; cursor: pointer; letter-spacing: 1px; transition: color 0.2s; font-family: inherit;
  }
  .chat-clear:hover { color: var(--red); }
</style>

<div class="adv-wrapper">
  <div class="adv-header">
    <div class="adv-profile">
      <div class="adv-avatar"><i class="fas fa-bolt"></i></div>
      <div class="adv-info">
        <h1>INTRU ADVISOR</h1>
        <p>Online &bull; Accessing Vault</p>
      </div>
    </div>
    <a href="/" class="adv-close" aria-label="Close Advisor"><i class="fas fa-times"></i></a>
  </div>

  <div class="chat-messages" id="chatMsgs"></div>

  <div class="quick-chips" id="quickChips">
    <button class="q-chip" onclick="sendStylistMsg('What is selling out fast?')">🔥 Trending Drops</button>
    <button class="q-chip" onclick="sendStylistMsg('Show me oversized tees')">👕 Oversized Tees</button>
    <button class="q-chip" onclick="sendStylistMsg('Do you have anything in Black?')">🖤 Black Fits</button>
  </div>

  <div class="chat-input-area">
    <input type="text" class="chat-input" id="chatInput" placeholder="Tell me your vibe..." onkeydown="if(event.key==='Enter')sendStylistMsg()">
    <button class="chat-send" onclick="sendStylistMsg()"><i class="fas fa-arrow-up"></i></button>
  </div>
  
  <div class="chat-options">
    <button class="chat-clear" onclick="clearStylistChat()">Reset Session</button>
  </div>
</div>

<script>
  var stylistMsgs = JSON.parse(localStorage.getItem('ai_chat') || '[]');
  
  function renderMsgs() {
    var b = document.getElementById('chatMsgs');
    var h = '<div class="chat-msg bot">I have access to the vault. Tell me your vibe, and I\\'ll see what limited stock we have left.</div>';
    stylistMsgs.forEach(function(m) {
      if (m.role === 'system') return;
      var content = formatMsg(m.content);
      h += '<div class="chat-msg ' + (m.role === 'user' ? 'user' : 'bot') + '">' + content + '</div>';
    });
    b.innerHTML = h;
    b.scrollTop = b.scrollHeight;
  }

  function clearStylistChat() {
    stylistMsgs = [];
    localStorage.removeItem('ai_chat');
    renderMsgs();
    
    // Show quick chips again when session expands
    var qchips = document.getElementById('quickChips');
    if (qchips) qchips.style.display = 'flex';
  }

  function formatMsg(txt) {
    txt = txt.replace(/[*]{2}(.*?)[*]{2}/g, '<b>$1</b>');
    txt = txt.replace(/_(.*?)_/g, '<i>$1</i>');

    return txt.replace(/\\[PRODUCT:([a-z0-9-]+)\\]/g, function(match, slug) {
      var p = window.STORE_PRODUCTS ? window.STORE_PRODUCTS.find(x => x.slug === slug) : null;
      if (!p) return '<a href="/product/' + slug + '" style="color:var(--bk);font-weight:700;text-decoration:underline">View Product: ' + slug + '</a>';
      return '<a href="/product/' + p.slug + '" class="ai-pcard">' +
             '<div class="ai-pimg">' +
             '<span class="ai-pbadge">Fast Selling</span>' +
             '<img src="' + p.images[0] + '" alt="' + p.name + '">' +
             '</div>' +
             '<div class="ai-pinfo">' +
             '<div class="ai-pname">' + p.name + '</div>' +
             '<div class="ai-pprice">Rs.' + p.price.toLocaleString(\'en-IN\') + '</div>' +
             '<div class="ai-pbtn">Secure Now</div>' +
             '</div></a>';
    });
  }

  function sendStylistMsg(textParam) {
    var inp = document.getElementById('chatInput');
    // textParam may be an event object if directly responding to click without wrapping
    var txt = (typeof textParam === 'string' ? textParam : '') || inp.value.trim();
    if (!txt) return;
    
    inp.value = '';
    
    // Hide quick chips to reduce clutter after interaction
    var qchips = document.getElementById('quickChips');
    if (qchips) qchips.style.display = 'none';

    stylistMsgs.push({ role: 'user', content: txt });
    renderMsgs();
    
    var b = document.getElementById('chatMsgs');
    var typing = document.createElement('div');
    typing.className = 'chat-msg bot';
    typing.id = 'chatTyping';
    typing.innerHTML = '<div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    b.appendChild(typing);
    b.scrollTop = b.scrollHeight;

    // Simulate "Checking the vault" delay for psychological effect
    setTimeout(function() {
      fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: stylistMsgs })
      })
      .then(r => r.json())
      .then(d => {
        var el = document.getElementById('chatTyping');
        if (el) el.remove();
        if (d.content) {
          stylistMsgs.push({ role: 'assistant', content: d.content });
          localStorage.setItem('ai_chat', JSON.stringify(stylistMsgs));
          renderMsgs();
        } else {
          toast(d.error || 'Advisor is busy', 'err');
        }
      })
      .catch(() => {
        var el = document.getElementById('chatTyping');
        if (el) el.remove();
        toast('Network error', 'err');
      });
    }, 800);
  }

  // Initial render
  setTimeout(function() {
    renderMsgs();
    if (stylistMsgs.length > 0) {
      var qchips = document.getElementById('quickChips');
      if (qchips) qchips.style.display = 'none';
    }
  }, 100);
</script>
`;

  return shell(
    'AI Stylist — INTRU.IN',
    'Get personalized streetwear recommendations and styling tips from our AI Assistant.',
    body,
    { ...opts, useMagicCheckout: !!opts.useMagicCheckout }
  );
}
