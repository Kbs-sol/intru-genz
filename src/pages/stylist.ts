import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

export function stylistPage(opts: {
    razorpayKeyId?: string;
    googleClientId?: string;
    products: Product[];
    legalPages: LegalPage[];
    useMagicCheckout?: boolean;
    storeSettings?: Record<string, string>;
}): string {
    const body = `
<style>
  .stylist-container {
    max-width: 800px;
    margin: 40px auto 80px;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 200px);
    min-height: 500px;
  }
  .stylist-header {
    text-align: center;
    margin-bottom: 32px;
  }
  .stylist-header h1 {
    font-family: var(--head);
    font-size: clamp(28px, 5vw, 42px);
    text-transform: uppercase;
    letter-spacing: -0.04em;
    margin-bottom: 8px;
  }
  .stylist-header p {
    color: var(--g400);
    font-size: 14px;
    font-weight: 500;
  }
  .chat-box {
    flex: 1;
    background: var(--wh);
    border: 1.5px solid var(--g100);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
  }
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
  }
  .chat-msg {
    max-width: 80%;
    padding: 14px 18px;
    font-size: 14px;
    line-height: 1.6;
    border-radius: 12px;
    position: relative;
    animation: fadeIn 0.3s ease;
  }
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
    border-bottom-left-radius: 2px;
    border: 1px solid rgba(0,0,0,.05);
  }
  .chat-input-area {
    padding: 16px 24px 24px;
    border-top: 1px solid var(--g100);
    display: flex;
    gap: 12px;
  }
  .chat-input {
    flex: 1;
    padding: 14px 20px;
    border: 1.5px solid var(--g200);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: all 0.2s;
  }
  .chat-input:focus {
    border-color: var(--bk);
    background: var(--wh);
  }
  .chat-send {
    padding: 0 24px;
    background: var(--bk);
    color: var(--wh);
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .chat-send:hover {
    background: var(--g600);
    transform: translateY(-1px);
  }
  .chat-typing {
    display: flex;
    gap: 4px;
    padding: 4px 0;
  }
  .typing-dot {
    width: 6px;
    height: 6px;
    background: var(--g300);
    border-radius: 50%;
    animation: typing-bounce 1s infinite alternate;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing-bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

  /* Product Card in Chat */
  .ai-pcard {
    background: var(--wh);
    border: 1px solid var(--g100);
    border-radius: 8px;
    overflow: hidden;
    margin-top: 8px;
    text-decoration: none;
    color: inherit;
    display: block;
    transition: transform 0.2s;
  }
  .ai-pcard:hover { transform: translateY(-2px); }
  .ai-pimg { aspect-ratio: 3/4; overflow: hidden; background: var(--g50); }
  .ai-pimg img { width: 100%; height: 100%; object-fit: cover; }
  .ai-pinfo { padding: 12px; }
  .ai-pname { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
  .ai-pprice { font-size: 13px; font-weight: 700; color: var(--bk); }
</style>

<div class="stylist-container">
  <header class="stylist-header">
    <h1>AI Stylist</h1>
    <p>Your personal gateway to the INTRU universe. Ask about styles, sizing, or drops.</p>
  </header>

  <div class="chat-box">
    <div class="chat-messages" id="chatMsgs">
      <div class="chat-msg bot">Yo! I'm your INTRU Stylist. Looking for something specific or just browsing the latest drops? I'm here to help you dial in your fit.</div>
    </div>
    <div class="chat-input-area">
      <input type="text" class="chat-input" id="chatInput" placeholder="Message your stylist..." onkeydown="if(event.key==='Enter')sendStylistMsg()">
      <button class="chat-send" onclick="sendStylistMsg()">Send</button>
    </div>
  </div>
</div>

<script>
  var stylistMsgs = JSON.parse(localStorage.getItem('ai_chat') || '[]');
  
  function renderMsgs() {
    var b = document.getElementById('chatMsgs');
    var h = '<div class="chat-msg bot">Yo! I\\'m your INTRU Stylist. Looking for something specific or just browsing the latest drops? I\\'m here to help you dial in your fit.</div>';
    stylistMsgs.forEach(function(m) {
      var content = formatMsg(m.content);
      h += '<div class="chat-msg ' + (m.role === 'user' ? 'user' : 'bot') + '">' + content + '</div>';
    });
    b.innerHTML = h;
    b.scrollTop = b.scrollHeight;
  }

  function formatMsg(txt) {
    // Convert [PRODUCT:slug] to card
    return txt.replace(/\\[PRODUCT:([a-z0-9-]+)\\]/g, function(match, slug) {
      var p = window.STORE_PRODUCTS ? window.STORE_PRODUCTS.find(x => x.slug === slug) : null;
      if (!p) return '<a href="/product/' + slug + '" class="ai-pcard-link">View Product: ' + slug + '</a>';
      return '<a href="/product/' + p.slug + '" class="ai-pcard">' +
             '<div class="ai-pimg"><img src="' + p.images[0] + '" alt="' + p.name + '"></div>' +
             '<div class="ai-pinfo">' +
             '<div class="ai-pname">' + p.name + '</div>' +
             '<div class="ai-pprice">Rs.' + p.price.toLocaleString(\'en-IN\') + '</div>' +
             '</div></a>';
    });
  }

  function sendStylistMsg() {
    var inp = document.getElementById('chatInput');
    var txt = inp.value.trim();
    if (!txt) return;
    
    inp.value = '';
    stylistMsgs.push({ role: 'user', content: txt });
    renderMsgs();
    
    var b = document.getElementById('chatMsgs');
    var typing = document.createElement('div');
    typing.className = 'chat-msg bot';
    typing.id = 'chatTyping';
    typing.innerHTML = '<div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    b.appendChild(typing);
    b.scrollTop = b.scrollHeight;

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
        toast(d.error || 'Stylist is busy', 'err');
      }
    })
    .catch(() => {
      var el = document.getElementById('chatTyping');
      if (el) el.remove();
      toast('Network error', 'err');
    });
  }

  // Initial render
  setTimeout(renderMsgs, 100);
</script>
`;

    return shell(
        'AI Stylist — INTRU.IN',
        'Get personalized streetwear recommendations and styling tips from our AI Assistant.',
        body,
        opts
    );
}
