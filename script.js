const CASES = [
  {id:'CIV/2024/0841',title:'Property Dispute vs. Mehta Bros',type:'Civil',client:'Rajesh Kumar',status:'Hearing',win:'74'},
  {id:'CRM/2024/0317',title:'State v. Accused Sec. 420',type:'Criminal',client:'Priya Nair',status:'Active',win:'58'},
  {id:'FAM/2024/0156',title:'Divorce Petition – Mutual Consent',type:'Family',client:'Anita Verma',status:'Pending',win:'82'},
  {id:'LAB/2024/0499',title:'Wrongful Termination – ABC Corp',type:'Labour',client:'Suresh Pillai',status:'Active',win:'61'},
  {id:'CRM/2025/0012',title:'Cyber Fraud Complaint',type:'Criminal',client:'Meera Iyer',status:'Active',win:'69'},
  {id:'CIV/2023/0722',title:'Land Acquisition Appeal',type:'Civil',client:'Farmers Union',status:'Closed',win:'91'},
];

// ── LOGIN ──
function selectRole(el,role){document.querySelectorAll('.role-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');document.getElementById('loginBtn').textContent='Sign In as '+role}
function doLogin(){const lp=document.getElementById('loginPage');lp.style.opacity='0';lp.style.transition='opacity .35s';setTimeout(()=>{lp.style.display='none';initCharts()},350)}

// ── NAV ──
function showPage(page,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  if(el){document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));el.classList.add('active')}
  const titles={dashboard:'Dashboard',cases:'Case Management',hearings:'Hearing Schedule',documents:'Document Repository',analytics:'Analytics & Insights',predict:'Win Probability Predictor',lawyers:'Find Lawyers (AI)',clients:'Client Registry',settings:'Settings'};
  document.getElementById('pageTitle').textContent=titles[page]||page;
  if(page==='analytics')setTimeout(initCharts,100);
}

// ── SEARCH ──
function doSearch(q){
  const res=document.getElementById('searchResults');
  if(!q||q.length<2){res.classList.remove('open');return}
  const matches=CASES.filter(c=>c.title.toLowerCase().includes(q.toLowerCase())||c.id.toLowerCase().includes(q.toLowerCase())||c.client.toLowerCase().includes(q.toLowerCase()));
  if(!matches.length){res.innerHTML='<div style="padding:12px 14px;font-size:13px;color:var(--text-muted)">No results found</div>';res.classList.add('open');return}
  res.innerHTML=matches.map(c=>`<div class="search-result-item" onclick="openDrawer('${c.id}','${c.title}','${c.type}','${c.client}','${c.win}')"><span class="sri-id">${c.id}</span><span class="sri-title">${c.title}</span><span class="sri-type tag tag-${c.type.toLowerCase()}">${c.type}</span></div>`).join('');
  res.classList.add('open');
}
function closeSearch(){document.getElementById('searchResults').classList.remove('open')}

// ── TABS ──
function filterTab(el){document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active')}

// ── MODAL ──
function openNewCaseModal(){document.getElementById('newCaseModal').classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
function submitCase(){closeModal('newCaseModal');showToast('Case registered successfully!')}

// ── DRAWER ──
function openDrawer(id,title,type,client,win){
  document.getElementById('drawerCaseId').textContent=id;
  document.getElementById('drawerTitle').textContent=title||id;
  document.getElementById('drawerType').textContent=type||'Civil';
  document.getElementById('drawerClient').textContent=client||'—';
  document.getElementById('drawerWin').textContent=win?'AI Win Probability: '+win+'%':'';
  document.getElementById('drawerBackdrop').classList.add('open');
  document.getElementById('caseDrawer').classList.add('open');
  loadDrawerAI(title,type,win);
}
function closeDrawer(){document.getElementById('drawerBackdrop').classList.remove('open');document.getElementById('caseDrawer').classList.remove('open')}

async function loadDrawerAI(title,type,win){
  const el=document.getElementById('drawerWinAnalysis');
  el.innerHTML='<div style="color:rgba(255,255,255,.4);font-size:12px">⚡ Analysing case with AI…</div>';
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:'You are JurisAI, an Indian legal case assistant. Give a brief 3-sentence win probability analysis in plain text. Mention the win probability percentage given, 1-2 key strengths, and 1 risk. Be concise and practical.',messages:[{role:'user',content:`Case: "${title}", Type: ${type}, AI Win Probability: ${win}%. Give a brief strategic analysis.`}]})});
    const d=await r.json();
    el.innerHTML=`<div style="font-size:12.5px;line-height:1.65;color:rgba(255,255,255,.82)">${d.content[0].text}</div>`;
  }catch(e){el.innerHTML=`<div style="color:rgba(255,255,255,.5);font-size:12px">Win probability: ${win}% based on case type and evidence patterns.</div>`}
}

// ── WIN PREDICTOR ──
async function runPrediction(){
  const type=document.getElementById('pred-type').value;
  const court=document.getElementById('pred-court').value;
  const evidence=document.getElementById('pred-evidence').value;
  const hearings=document.getElementById('pred-hearings').value;
  const summary=document.getElementById('pred-summary').value;
  if(!type||!court||!evidence){showToast('Please fill in all required fields');return}
  const card=document.getElementById('winProbContent');
  card.innerHTML=`<div class="wpc-loading"><div class="wpc-spinner"></div><br>Analysing case with AI…</div>`;
  document.getElementById('lawyerSuggestContent').innerHTML=`<div style="text-align:center;padding:16px"><span class="lawyer-spinner"></span>Finding matched lawyers…</div>`;
  try{
    const prompt=`You are an Indian legal AI. A lawyer wants to predict the win probability for this case.
Case Type: ${type}
Court: ${court}
Evidence: ${evidence}
Hearings: ${hearings}
${summary?'Summary: '+summary:''}

Respond ONLY with JSON (no markdown, no backticks):
{
  "probability": <integer 0-100>,
  "verdict": "<2 sentence overall assessment>",
  "factors": ["<positive factor 1>","<positive factor 2>","<risk factor>"],
  "lawyers": [
    {"name":"<Indian advocate name>","specialization":"<area>","experience":"<X years>","wins":"<X%> win rate","match":"<XX%>","initials":"<2 letters>","color":"blue"},
    {"name":"<Indian advocate name>","specialization":"<area>","experience":"<X years>","wins":"<X%> win rate","match":"<XX%>","initials":"<2 letters>","color":"green"},
    {"name":"<Indian advocate name>","specialization":"<area>","experience":"<X years>","wins":"<X%> win rate","match":"<XX%>","initials":"<2 letters>","color":"purple"}
  ]
}`;
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})});
    const d=await r.json();
    let text=d.content[0].text.replace(/```json|```/g,'').trim();
    const data=JSON.parse(text);
    renderWinProb(data);
    renderLawyerSuggest(data.lawyers);
  }catch(e){
    card.innerHTML=`<div style="color:rgba(255,255,255,.5);font-size:13px;text-align:center;padding:20px 0">Could not complete prediction. Please try again.</div>`;
    document.getElementById('lawyerSuggestContent').innerHTML=`<div style="text-align:center;padding:16px;color:var(--text-muted)">Run prediction to see lawyer matches.</div>`;
  }
}

function renderWinProb(data){
  const pct=data.probability;
  const color=pct>=70?'#6ec97a':pct>=50?'#e8c97a':'#e87a7a';
  document.getElementById('winProbContent').innerHTML=`
    <div class="wpc-score-row"><div class="wpc-score" style="color:${color}">${pct}</div><div class="wpc-pct">%</div></div>
    <div class="wpc-verdict">${data.verdict}</div>
    <div class="wpc-bar-wrap"><div class="wpc-bar" style="width:${pct}%;background:linear-gradient(90deg,${color}88,${color})"></div></div>
    <div class="wpc-factors">${data.factors.map((f,i)=>`<div class="wpc-factor"><div class="wpc-factor-dot" style="background:${i<2?'#6ec97a':'#e87a7a'}"></div>${f}</div>`).join('')}</div>`;
}

function renderLawyerSuggest(lawyers){
  const colorMap={blue:'la-blue',green:'la-green',purple:'la-purple',amber:'la-amber'};
  document.getElementById('lawyerSuggestContent').innerHTML=lawyers.map(l=>`
    <div class="lawyer-card">
      <div class="lawyer-avatar ${colorMap[l.color]||'la-blue'}">${l.initials}</div>
      <div class="lawyer-info">
        <div class="lname">${l.name}</div>
        <div class="lspec">${l.specialization}</div>
        <div class="lstats"><span class="lstat"><strong>${l.experience}</strong></span><span class="lstat">·</span><span class="lstat"><strong>${l.wins}</strong></span></div>
      </div>
      <div class="lawyer-match"><div class="match-pct">${l.match}</div><div class="match-label">Match</div></div>
    </div>`).join('');
}

// ── FIND LAWYERS ──
async function findLawyers(){
  const type=document.getElementById('lawyer-type').value;
  const city=document.getElementById('lawyer-city').value;
  const exp=document.getElementById('lawyer-exp').value;
  const el=document.getElementById('lawyerResults');
  el.innerHTML=`<div style="text-align:center;padding:40px;color:var(--text-muted)"><span class="lawyer-spinner"></span>Finding AI-matched lawyers…</div>`;
  try{
    const prompt=`Generate a list of 6 realistic Indian advocate profiles for ${city||'Chennai'} specializing in ${type||'general'} law with ${exp||'any'} experience. Return ONLY JSON array (no markdown):
[{"name":"<name>","specialization":"<specific area>","experience":"<X> years","wins":"<XX>% win rate","cases":"<XX> cases handled","court":"<primary court>","match":"<XX>%","initials":"<2 letters>","color":"blue|green|purple|amber","fee":"₹<X>K–<Y>K per hearing"}]`;
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})});
    const d=await r.json();
    let text=d.content[0].text.replace(/```json|```/g,'').trim();
    const lawyers=JSON.parse(text);
    const colorMap={blue:'la-blue',green:'la-green',purple:'la-purple',amber:'la-amber'};
    el.innerHTML=`<div class="panel"><div class="panel-header"><div class="panel-title">AI-Matched Advocates (${lawyers.length})</div><div style="font-size:12px;color:var(--text-light)">Ranked by match score</div></div><div style="padding:4px 20px">${lawyers.map(l=>`
      <div class="lawyer-card">
        <div class="lawyer-avatar ${colorMap[l.color]||'la-blue'}">${l.initials}</div>
        <div class="lawyer-info">
          <div class="lname">${l.name}</div>
          <div class="lspec">${l.specialization}</div>
          <div class="lstats"><span class="lstat"><strong>${l.experience}</strong></span><span class="lstat">·</span><span class="lstat">${l.wins}</span><span class="lstat">·</span><span class="lstat">${l.cases}</span></div>
          <div style="font-size:11px;color:var(--text-light);margin-top:3px">${l.court} · ${l.fee}</div>
        </div>
        <div class="lawyer-match"><div class="match-pct">${l.match}</div><div class="match-label">Match</div></div>
      </div>`).join('')}</div></div>`;
  }catch(e){el.innerHTML=`<div style="text-align:center;padding:40px;color:var(--text-muted)">Could not fetch results. Please try again.</div>`}
}

// ── CHAT ──
let chatOpen=false;
function toggleChat(){chatOpen=!chatOpen;document.getElementById('chatPanel').classList.toggle('open',chatOpen)}
function openChat(){chatOpen=true;document.getElementById('chatPanel').classList.add('open')}

const chatHistory=[];

async function sendChat(){
  const input=document.getElementById('chatInput');
  const msg=input.value.trim();
  if(!msg)return;
  input.value='';
  addChatMsg('user',msg);
  document.getElementById('chatSuggestions').style.display='none';
  addTyping();
  chatHistory.push({role:'user',content:msg});
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:'You are JurisAI, an expert Indian legal assistant built into JurisDesk, a legal case tracking platform. You help advocates with case strategy, Indian law (IPC, CPC, CrPC, IEA, etc.), precedents, hearing prep, and document drafting. Be concise, practical, and professional. Format responses clearly.',messages:chatHistory})});
    const d=await r.json();
    const reply=d.content.map(c=>c.text||'').join('');
    removeTyping();
    addChatMsg('bot',reply);
    chatHistory.push({role:'assistant',content:reply});
  }catch(e){removeTyping();addChatMsg('bot','I\'m having trouble connecting. Please try again in a moment.')}
}

function sendSuggestion(el){document.getElementById('chatInput').value=el.textContent;sendChat()}

function addChatMsg(role,text){
  const msgs=document.getElementById('chatMessages');
  const now=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const div=document.createElement('div');
  div.className=`chat-msg ${role} fade-up`;
  div.innerHTML=`<div class="msg-bubble">${text.replace(/\n/g,'<br>')}</div><div class="msg-time">${now}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}

function addTyping(){
  const msgs=document.getElementById('chatMessages');
  const div=document.createElement('div');
  div.className='chat-msg bot';div.id='typingIndicator';
  div.innerHTML='<div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function removeTyping(){const t=document.getElementById('typingIndicator');if(t)t.remove()}

// ── CHARTS ──
let chartsInited=false;
function initCharts(){
  if(chartsInited)return;chartsInited=true;
  const navy='#0f1c2e',gold='#c9a84c',cream='#f5f0e8';
  const defaults={plugins:{legend:{display:false}},scales:{x:{grid:{color:'#e8e0d0'},ticks:{color:'#8a9ab0',font:{size:11}}},y:{grid:{color:'#e8e0d0'},ticks:{color:'#8a9ab0',font:{size:11}}}}};

  new Chart(document.getElementById('chartType'),{type:'doughnut',data:{labels:['Civil','Criminal','Family','Labour','Consumer'],datasets:[{data:[8,6,4,4,2],backgroundColor:['#1a4a7a','#8a2020','#5a2080','#206020','#802060'],borderWidth:0,hoverOffset:4}]},options:{plugins:{legend:{display:true,position:'right',labels:{font:{size:11},color:'#5a6a80',boxWidth:12}}},cutout:'65%'}});

  new Chart(document.getElementById('chartMonthly'),{type:'bar',data:{labels:['Jan','Feb','Mar','Apr','May'],datasets:[{label:'Filings',data:[4,7,5,9,6],backgroundColor:navy,borderRadius:6,borderSkipped:false}]},options:{...defaults,plugins:{legend:{display:false}}}});

  new Chart(document.getElementById('chartWinRate'),{type:'bar',data:{labels:['Civil','Criminal','Family','Labour','Consumer'],datasets:[{data:[76,58,84,65,72],backgroundColor:[gold,gold,gold,gold,gold],borderRadius:6,borderSkipped:false}]},options:{...defaults,plugins:{legend:{display:false}},scales:{...defaults.scales,y:{...defaults.scales.y,max:100}}}});

  new Chart(document.getElementById('chartStatus'),{type:'doughnut',data:{labels:['Active','Hearing','Pending','Closed'],datasets:[{data:[10,3,4,7],backgroundColor:['#1a4a7a','#9a6e10','#5a3a9a','#1a6b3c'],borderWidth:0}]},options:{plugins:{legend:{display:true,position:'right',labels:{font:{size:11},color:'#5a6a80',boxWidth:12}}},cutout:'60%'}});
}

// ── TOAST ──
let toastTimer;
function showToast(msg){const t=document.getElementById('toast');document.getElementById('toastMsg').textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}