/* ================================================================
   intru-core.js — static JS extracted from inline shell blocks
   [v23 PERF] Previously ~14 KB of static JS was repeated inline in
   every HTML response. Extracting here lets Cloudflare's edge cache
   serve it with a 1-year immutable header (versioned filename when
   contents change) and the browser skips re-parsing it on every nav.
   
   Contents:
   1. CLARITY_EVENT_ALIAS + META_EVENT_ALIAS + window.track() unified
      analytics bridge (GA4 + Clarity + Meta Pixel + server beacon).
   2. UTM first-touch capture + _getStoredUtm() helper.
   3. _genEventId() UUID helper.
   4. Image lightbox (openLightbox / closeLightbox / lbNav + keyboard).
   5. A11y normaliser (role=button on [onclick] div/span) + Instagram
      WebView error swallow.
   
   DOES NOT contain anything per-request. All page-specific config
   (STORE_PRODUCTS, S, PM, Razorpay key, Google client ID, store
   settings) still ships inline so it's always fresh.
   ================================================================ */

/* ====== UNIFIED ANALYTICS BRIDGE ====== */
var CLARITY_EVENT_ALIAS={
  'purchase':'Purchase',
  'login':'Login',
  'contact':'Contact us',
  'contact_us':'Contact us'
};
var META_EVENT_ALIAS={
  'page_view':'PageView',
  'view_item':'ViewContent',
  'view_content':'ViewContent',
  'add_to_cart':'AddToCart',
  'begin_checkout':'InitiateCheckout',
  'initiate_checkout':'InitiateCheckout',
  'purchase':'Purchase',
  'add_payment_info':'AddPaymentInfo',
  'add_to_wishlist':'AddToWishlist',
  'search':'Search',
  'lead':'Lead',
  'identify':'Lead',
  'contact':'Contact',
  'contact_us':'Contact',
  'complete_registration':'CompleteRegistration',
  'sign_up':'CompleteRegistration',
  'login':'Contact',
  'subscribe':'Subscribe',
  'view_category':'ViewContent'
};
function _genEventId(){
  try{
    if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
  }catch(_){}
  return 'evt_'+Date.now()+'_'+Math.random().toString(36).slice(2,10);
}
/* UTM first-touch capture — 36% of Instagram traffic lands as (direct)/(none)
   because the in-app browser strips the referrer. Persist utm_* for 30 days. */
(function(){
  try{
    var q = new URLSearchParams(location.search || '');
    var src = q.get('utm_source'); var med = q.get('utm_medium');
    var camp = q.get('utm_campaign'); var ct = q.get('utm_content'); var tm = q.get('utm_term');
    if (src || med || camp) {
      var payload = {
        source: src || '', medium: med || '', campaign: camp || '',
        content: ct || '', term: tm || '',
        at: Date.now(), landing: location.pathname
      };
      localStorage.setItem('intru_utm', JSON.stringify(payload));
      if (typeof window.track === 'function') {
        setTimeout(function(){ window.track('utm_landing', payload); }, 50);
      }
    }
  }catch(_e){}
})();
function _getStoredUtm(){
  try{
    var raw = localStorage.getItem('intru_utm');
    if (!raw) return null;
    var p = JSON.parse(raw);
    if (Date.now() - (p.at||0) > 30*24*60*60*1000) { localStorage.removeItem('intru_utm'); return null; }
    return p;
  }catch(_e){ return null; }
}
window.track=function(name,params){
  try{params=params||{};
    var eventId=params.event_id||_genEventId();
    params.event_id=eventId;
    if(typeof window.gtag==='function'){window.gtag('event',name,params);}
    if(typeof window.clarity==='function'){
      var cName=CLARITY_EVENT_ALIAS[name]||name;
      window.clarity('event',cName);
      try{
        if(params.value!=null)window.clarity('set',cName+'_value',String(params.value));
        if(params.item_id)window.clarity('set','item_id',String(params.item_id));
      }catch(_e){}
    }
    if(typeof window.fbq==='function'){
      var metaName=META_EVENT_ALIAS[name]||'CustomEvent';
      var metaParams={};
      if(params.value!=null){metaParams.value=Number(params.value)||0;metaParams.currency=params.currency||'INR';}
      if(params.item_id)metaParams.content_ids=[String(params.item_id)];
      if(params.items && Array.isArray(params.items)){
        metaParams.content_ids=params.items.map(function(i){return String(i.item_id||i.id||'')}).filter(Boolean);
        metaParams.contents=params.items.map(function(i){return{id:String(i.item_id||i.id||''),quantity:Number(i.quantity)||1,item_price:Number(i.price||i.item_price)||0}});
        metaParams.num_items=params.items.reduce(function(s,i){return s+(Number(i.quantity)||1)},0);
      }
      if(name==='view_item'||name==='view_content')metaParams.content_type='product';
      if(name==='search'&&params.search_term)metaParams.search_string=params.search_term;
      if(metaName==='CustomEvent'){
        try{window.fbq('trackCustom',name,metaParams,{eventID:eventId});}catch(_e){}
      } else {
        try{window.fbq('track',metaName,metaParams,{eventID:eventId});}catch(_e){}
      }
    }
    /* Internal beacon → server funnel_events + Meta CAPI. Low-value events skipped. */
    var _SKIP_SERVER = {
      scroll_depth: 1, anchor_scroll: 1, engaged_session: 1,
      promo_shown: 1, combo_nudge_shown: 1,
      exit_intent_shown: 1, share: 1
    };
    if(navigator&&navigator.sendBeacon && !_SKIP_SERVER[name]){
      var _utm = _getStoredUtm();
      if (_utm) { params._utm = _utm; }
      var payload={event:name,meta:params,event_id:eventId,event_time:Math.floor(Date.now()/1000),url:location.href,user_agent:navigator.userAgent};
      if(window._intruConsentDeclined){payload.no_capi=1;}
      var b=new Blob([JSON.stringify(payload)],{type:'application/json'});
      navigator.sendBeacon('/api/analytics/event',b);
    }
  }catch(e){}
};

/* ====== IMAGE LIGHTBOX ====== */
(function(){
  var _lbImages=[], _lbIdx=0;
  window.openLightbox=function(images,idx){
    try{
      _lbImages=images||[]; _lbIdx=idx||0;
      var lb=document.getElementById('imgLightbox');
      var img=document.getElementById('lbImg');
      if(!lb||!img)return;
      img.src=_lbImages[_lbIdx]||'';
      lb.classList.add('open');
      document.body.style.overflow='hidden';
      var prev=document.getElementById('lbPrev'), next=document.getElementById('lbNext');
      if(prev) prev.style.display=_lbImages.length>1?'flex':'none';
      if(next) next.style.display=_lbImages.length>1?'flex':'none';
    }catch(e){}
  };
  window.closeLightbox=function(){
    try{
      var lb=document.getElementById('imgLightbox');
      if(lb)lb.classList.remove('open');
      document.body.style.overflow='';
    }catch(e){}
  };
  window.lbNav=function(dir){
    try{
      if(!_lbImages.length)return;
      _lbIdx=(_lbIdx+dir+_lbImages.length)%_lbImages.length;
      var img=document.getElementById('lbImg');
      if(img)img.src=_lbImages[_lbIdx];
    }catch(e){}
  };
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') window.closeLightbox();
    if(e.key==='ArrowLeft') window.lbNav(-1);
    if(e.key==='ArrowRight') window.lbNav(1);
  });
})();

/* ====== A11Y / CLARITY DEAD-CLICK NORMALISER ====== */
(function initA11yNormalizer(){
  if (typeof document === 'undefined') return;
  function normalize(){
    try {
      var nodes = document.querySelectorAll('[onclick]');
      for (var i=0; i<nodes.length; i++){
        var el = nodes[i];
        var tag = (el.tagName||'').toLowerCase();
        if (tag === 'button' || tag === 'a' || tag === 'input') continue;
        if (!el.getAttribute('role')) el.setAttribute('role', 'button');
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.dataset._kbdBound){
          el.dataset._kbdBound = '1';
          el.addEventListener('keydown', function(e){
            if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); e.target.click(); }
          });
        }
      }
    } catch(e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalize);
  else normalize();
  try {
    var mo = new MutationObserver(function(muts){
      for (var i=0;i<muts.length;i++){
        if (muts[i].addedNodes && muts[i].addedNodes.length){ normalize(); break; }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch(e){}
  /* Swallow InstagramApp / GoogleApp WebView-bridge errors (3.1% of sessions)
     so they don't spam Clarity's JS-error stat. */
  try {
    var _origErr = window.onerror;
    window.onerror = function(msg, src, line, col, err){
      var m = String(msg||'').toLowerCase();
      if (m.indexOf('java object is gone') !== -1
          || m.indexOf('java exception was raised') !== -1
          || m.indexOf('script error') !== -1 && !src) {
        return true;
      }
      if (typeof _origErr === 'function') return _origErr.apply(this, arguments);
      return false;
    };
    window.addEventListener('unhandledrejection', function(e){
      var m = String(e.reason && e.reason.message || e.reason || '').toLowerCase();
      if (m.indexOf('java object is gone') !== -1) { e.preventDefault && e.preventDefault(); }
    });
  } catch(e){}
})();
