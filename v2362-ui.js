(() => {
  'use strict';
  const VERSION = '2.36.3';
  const DATE_MODE_KEY = 'hensai_v236_date_mode';
  const SNAP_A = 'hensai_v2362_compare_a';
  const SNAP_B = 'hensai_v2362_compare_b';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const num = v => Math.round(Number(v) || 0);
  const yen = v => new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(num(v));
  const nfmt = v => new Intl.NumberFormat('ja-JP').format(num(v));
  const clamp = (n,a=0,b=1) => Math.max(a,Math.min(b,n));
  const clone = v => JSON.parse(JSON.stringify(v));

  function updateVersionText(){
    document.title = document.title.replace(/Ver\s*(?:2\.36\.\d+|1\.3\.\d+)/g, `Ver${VERSION}`);
    $$('.splashVersion,.printBrandSub').forEach(el => {
      if(/(?:2\.36\.\d+|1\.3\.\d+)/.test(el.textContent)){
        el.textContent = el.textContent.replace(/(?:2\.36\.\d+|1\.3\.\d+)/g, VERSION);
      }
    });
  }

  function currentDateMode(){ return localStorage.getItem(DATE_MODE_KEY)==='western' ? 'western' : 'japanese'; }
  function setDateMode(mode){ localStorage.setItem(DATE_MODE_KEY,mode); refreshAllDates(); }
  function parseDateText(text){
    const t = String(text||'').replace(/\s/g,'');
    let m = t.match(/令和(元|\d+)年(\d+)月(\d+)日/);
    if(m){ return {y:2018+(m[1]==='元'?1:Number(m[1])),m:Number(m[2]),d:Number(m[3])}; }
    m = t.match(/平成(元|\d+)年(\d+)月(\d+)日/);
    if(m){ return {y:1988+(m[1]==='元'?1:Number(m[1])),m:Number(m[2]),d:Number(m[3])}; }
    m = t.match(/(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/);
    if(m){ return {y:Number(m[1]),m:Number(m[2]),d:Number(m[3])}; }
    return null;
  }
  function isoOf(d){ return d ? `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}` : ''; }
  function displayDate(iso, mode=currentDateMode()){
    if(!iso) return '-';
    const [y,m,d]=iso.split('-').map(Number);
    if(mode==='western') return `${y}/${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}`;
    const era = y>=2019?'令和':'平成'; const ey=y>=2019?y-2018:y-1988;
    return `${era}${ey===1?'元':ey}年${m}月${d}日`;
  }
  function decorateDateNode(node){
    if(!node || node.dataset.v2362DateDone==='1') return;
    const parsed = parseDateText(node.textContent);
    if(!parsed) return;
    node.dataset.v2362DateDone='1'; node.dataset.dateIso=isoOf(parsed);
    node.dataset.bonus = (node.textContent.includes('ボーナス') || !!$('.bonusDot',node)) ? '1' : '0';
  }
  function writeDateNode(node){
    const iso=node.dataset.dateIso; if(!iso) return;
    const bonus=node.dataset.bonus==='1'; const text=displayDate(iso);
    if(node.classList.contains('scheduleDate')){
      node.innerHTML = `${text}${bonus?'<span class="scheduleBonus">● ボーナス</span>':''}`;
    } else {
      node.innerHTML = `${bonus?'<span class="bonusDot"></span>':''}${text}`;
    }
  }
  function refreshAllDates(){
    $$('td[data-label="返済日"], .scheduleDate, .compareDatePair').forEach(node=>{
      if(node.classList.contains('compareDatePair')){
        const a=node.dataset.aDate||'', b=node.dataset.bDate||'';
        node.innerHTML=`<span>A ${displayDate(a)}</span><span>B ${displayDate(b)}</span>`;
      } else { decorateDateNode(node); writeDateNode(node); }
    });
    $$('.dateModeSwitch').forEach(sw=>$$('button',sw).forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===currentDateMode())));
  }
  function makeDateSwitch(){
    const el=document.createElement('div');el.className='dateModeSwitch';el.setAttribute('aria-label','返済日の表示形式');
    el.innerHTML='<button type="button" data-mode="japanese">和暦</button><button type="button" data-mode="western">西暦</button>';
    el.addEventListener('click',e=>{const b=e.target.closest('button[data-mode]');if(b)setDateMode(b.dataset.mode);});
    return el;
  }
  function decorateSchedule(card){
    if(!card) return;
    $$('td[data-label="返済日"], .scheduleDate',card).forEach(decorateDateNode);
    const head=$('.scheduleHead',card);
    if(head && !$('.dateModeSwitch',head)){
      head.append(makeDateSwitch());
      const note=document.createElement('div');note.className='scheduleDensityNote';note.textContent='一覧性を優先したコンパクト表示です。横へスワイプすると右側の列を確認できます。';
      const scroll=$('.tableScroll',card); if(scroll) scroll.before(note);
    }
  }

  function addResultOrbit(hero){
    if(!hero || $('.resultOrbitDecor',hero)) return;
    const decor=document.createElement('div');decor.className='resultOrbitDecor';decor.setAttribute('aria-hidden','true');
    decor.innerHTML='<i class="ring one"></i><i class="ring two"></i><i class="ring three"></i><i class="trail"></i><b class="orb"></b>';
    hero.prepend(decor);
  }

  /* Calculation mirror for the new comparison matrix/detail table. */
  function toMoney(value,unit){ return (parseFloat(value)||0)*(unit==='万円'?10000:1); }
  function monthlyPrincipalYen(data){
    const raw=parseFloat(data?.monthlyPrincipal)||0;
    if(raw<=0)return 0;
    if(data?.monthlyPrincipalUnit==='円')return Math.floor(raw);
    const legacyUnit=data?.monthlyPrincipalUnit||(data?.unit==='万円'&&raw<1000?'万円':'円');
    return Math.floor(legacyUnit==='万円'?raw*10000:raw);
  }
  function remainderAdjustMode(data){return data?.remainderAdjust==='first'?'first':'last';}
  function monthlyPrincipalRemainder(data){
    const P=toMoney(data.principal,data.unit), n=parseInt(data.count,10)||0, monthly=monthlyPrincipalYen(data);
    if(P<=0||n<=0||monthly<=0)return null;
    const adjusted=P-monthly*Math.max(0,n-1);
    if(Math.abs(adjusted-monthly)>P)return 0;
    return adjusted>0?Math.floor(adjusted):0;
  }
  function key(date){ return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
  function nthWeekday(year,month,weekday,occ){ const first=new Date(year,month,1); const offset=(weekday-first.getDay()+7)%7; return new Date(year,month,1+offset+(occ-1)*7); }
  function vernal(y){ return Math.floor(20.8431+.242194*(y-1980)-Math.floor((y-1980)/4)); }
  function autumn(y){ return Math.floor(23.2488+.242194*(y-1980)-Math.floor((y-1980)/4)); }
  const holidayCache=new Map();
  function holidays(year){
    if(holidayCache.has(year)) return holidayCache.get(year);
    const set=new Set(), add=(m,d)=>set.add(key(new Date(year,m,d))), addDate=d=>set.add(key(d));
    add(0,1);addDate(nthWeekday(year,0,1,2));add(1,11);if(year>=2020)add(1,23);add(2,vernal(year));add(3,29);add(4,3);add(4,4);add(4,5);if(year>=2016)add(7,11);add(10,3);add(10,23);
    if(year>=2000){addDate(nthWeekday(year,6,1,3));addDate(nthWeekday(year,8,1,3));addDate(nthWeekday(year,9,1,2));}else{add(6,20);add(8,15);add(9,10);}
    if(year===2020){set.delete(key(nthWeekday(year,6,1,3)));add(6,23);set.delete(key(nthWeekday(year,9,1,2)));add(6,24);set.delete(key(new Date(year,7,11)));add(7,10);}
    if(year===2021){set.delete(key(nthWeekday(year,6,1,3)));add(6,22);set.delete(key(nthWeekday(year,9,1,2)));add(6,23);set.delete(key(new Date(year,7,11)));add(7,8);}
    if(year===2019){add(4,1);add(9,22);}
    for(let round=0;round<4;round++){
      for(let month=0;month<12;month++){
        const last=new Date(year,month+1,0).getDate();
        for(let day=2;day<last;day++){const cur=new Date(year,month,day),prev=new Date(year,month,day-1),next=new Date(year,month,day+1);if(!set.has(key(cur))&&set.has(key(prev))&&set.has(key(next)))set.add(key(cur));}
      }
      for(const dayKey of [...set]){const h=new Date(dayKey+'T00:00:00');if(h.getDay()!==0)continue;const sub=new Date(h);do{sub.setDate(sub.getDate()+1);}while(set.has(key(sub)));set.add(key(sub));}
    }
    holidayCache.set(year,set); return set;
  }
  function isHoliday(d){ return d.getDay()===0||d.getDay()===6||holidays(d.getFullYear()).has(key(d)); }
  function nextBiz(d){ const out=new Date(d);while(isHoliday(out))out.setDate(out.getDate()+1);return out; }
  function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
  function due(y,m,day){return new Date(y,m,Math.min(day,daysInMonth(y,m)));}
  function firstRaw(exec,day){ const e=new Date(exec+'T00:00:00'),same=due(e.getFullYear(),e.getMonth(),day);return e<same?same:due(e.getFullYear(),e.getMonth()+1,day); }
  function nthDue(exec,day,index){ const raw=firstRaw(exec,day);return nextBiz(due(raw.getFullYear(),raw.getMonth()+index-1,day)); }
  function daysIncl(a,b){return Math.round((b-a)/86400000)+1;}
  function annuity(P,r,n){if(r===0)return P/n;const f=Math.pow(1+r,n);return P*r*f/(f-1);}
  function calculate(data){
    try{
      const P=toMoney(data.principal,data.unit), rate=(parseFloat(data.rate)||0)/100, n=data.method==='eg'?(parseInt(data.count,10)||0):(parseInt(data.years,10)||0)*12, day=Math.max(1,Math.min(31,parseInt(data.repayDay,10)||17));
      if(!P||!n||!data.execDate)return null; const r=rate/12,first=nextBiz(firstRaw(data.execDate,day)),firstDays=daysIncl(new Date(data.execDate+'T00:00:00'),first),firstInterest=Math.floor(P*rate/365*firstDays),dates=Array.from({length:n},(_,i)=>nthDue(data.execDate,day,i+1));
      let bal=P,totalInterest=0,totalPay=0,regularPayment=0;const rows=[];
      if(data.method==='eg'){
        const monthly=monthlyPrincipalYen(data);if(monthly<=0)return null;
        const adjustedPrincipal=monthlyPrincipalRemainder(data);if(!adjustedPrincipal)return null;
        const adjustMode=remainderAdjustMode(data);
        for(let i=1;i<=n;i++){const interest=(i===1)?firstInterest:Math.floor(bal*r),adjusted=adjustMode==='first'?i===1:i===n,principal=Math.min(adjusted?adjustedPrincipal:monthly,bal),pay=principal+interest;bal=Math.max(0,bal-principal);totalInterest+=interest;totalPay+=pay;rows.push({i,date:dates[i-1],pay,principal,interest,bal,adjusted});} regularPayment=rows[0]?.pay||0;
      }else{
        let bonusAmount=0,bonusIndexes=[];
        if(data.bonus){bonusAmount=Math.floor(toMoney(data.bonusAmount,data.unit));const b1=parseInt(data.bonusMonth1,10),b2=parseInt(data.bonusMonth2,10);bonusIndexes=dates.map((d,i)=>d&&[b1,b2].includes(d.getMonth()+1)?i+1:0).filter(Boolean);}
        const pvBonus=bonusIndexes.reduce((sum,index)=>sum+bonusAmount/Math.pow(1+r,index),0);regularPayment=Math.floor(annuity(P-pvBonus,r,n));
        for(let i=1;i<=n;i++){
          const bonus=bonusIndexes.includes(i),scheduled=regularPayment+(bonus?bonusAmount:0);let interest,principal,pay;
          if(i===n){interest=i===1?firstInterest:Math.floor(bal*r);principal=bal;pay=principal+interest;}
          else if(i===1){interest=firstInterest;principal=Math.min(scheduled-Math.floor(P*r),bal);pay=principal+interest;}
          else{interest=Math.floor(bal*r);principal=Math.min(scheduled-interest,bal);pay=principal+interest;}
          bal=Math.max(0,bal-principal);totalInterest+=interest;totalPay+=pay;rows.push({i,date:dates[i-1],pay,principal,interest,bal,bonus});
        }
      }
      return {P,rate,n,rows,totalInterest,totalPay,regularPayment,first,firstDays};
    }catch(_){return null;}
  }
  function readJSON(key, fallback=null){try{return JSON.parse(localStorage.getItem(key)||'')}catch(_){return fallback;}}
  function readSession(key){try{return JSON.parse(sessionStorage.getItem(key)||'')}catch(_){return null;}}
  function formatScenario(d){if(!d)return '-';const term=d.method==='eg'?`${d.count}回`:`${d.years}年・${Number(d.years||0)*12}回`;return `${nfmt(d.principal)}${d.unit} / ${Number(d.rate||0).toFixed(2)}% / ${term}`;}
  function getCompareData(){
    const a=readSession(SNAP_A)||readJSON('hensai_v236_current');
    const hist=readJSON('hensai_v236_history',[]);
    const b=readSession(SNAP_B)||(Array.isArray(hist)&&hist[0]?hist[0].data:null);
    if(!a||!b)return null;const ra=calculate(a),rb=calculate(b);if(!ra||!rb)return null;return {a,b,ra,rb};
  }
  function compareRows(data){
    const {a,b,ra,rb}=data; const rows=[
      ['条件',formatScenario(a),formatScenario(b),'condition'],
      ['毎月返済額',yen(ra.regularPayment),yen(rb.regularPayment),'emphasis'],
      ['総返済額',yen(ra.totalPay),yen(rb.totalPay),''],
      ['利息総額',yen(ra.totalInterest),yen(rb.totalInterest),''],
      ['返済回数',`${ra.n}回`,`${rb.n}回`,'']
    ];
    return rows.map(([label,av,bv,cls])=>`<div class="cmLabel">${label}</div><div class="cmValue ${cls}">${av}</div><div class="cmValue ${cls}">${bv}</div>`).join('');
  }
  function decorateCompare(view){
    const top=$('.compareTop',view);if(!top||top.dataset.v2362Done==='1')return;
    if($('.compareDeltaHero',top)){top.dataset.v2362Done='1';return;}
    const data=getCompareData();if(!data)return;
    top.dataset.v2362Done='1';
    const matrix=document.createElement('div');matrix.className='compareMatrix';matrix.innerHTML=`<div class="cmHead"></div><div class="cmHead">PATTERN A</div><div class="cmHead">PATTERN B</div>${compareRows(data)}`;
    const deltaTotal=data.rb.totalPay-data.ra.totalPay,deltaMonthly=data.rb.regularPayment-data.ra.regularPayment;
    const insight=document.createElement('div');insight.className='compareDelta';insight.innerHTML=`<b>差額</b>　BはAより <strong>月々 ${deltaMonthly>=0?'+':''}${yen(deltaMonthly)}</strong> ／ <strong>総額 ${deltaTotal>=0?'+':''}${yen(deltaTotal)}</strong>`;
    const heading=$('.compareHeading',top); if(heading){heading.after(insight);heading.after(matrix);} else top.prepend(matrix,insight);
  }
  function metricName(metric){return ({pay:'返済額',principal:'元金',interest:'利息',bal:'残高'})[metric]||'返済額';}
  function pairDate(a,b){ return `<td class="compareDatePair" data-a-date="${a?isoOf({y:a.getFullYear(),m:a.getMonth()+1,d:a.getDate()}):''}" data-b-date="${b?isoOf({y:b.getFullYear(),m:b.getMonth()+1,d:b.getDate()}):''}"><span>A ${a?displayDate(isoOf({y:a.getFullYear(),m:a.getMonth()+1,d:a.getDate()})):'-'}</span><span>B ${b?displayDate(isoOf({y:b.getFullYear(),m:b.getMonth()+1,d:b.getDate()})):'-'}</span></td>`; }
  function renderCompareDense(card,data,metric='pay'){
    const {ra,rb}=data;const count=Math.max(ra.rows.length,rb.rows.length);
    const body=Array.from({length:count},(_,i)=>{
      const a=ra.rows[i],b=rb.rows[i],av=a?a[metric]:0,bv=b?b[metric]:0,delta=bv-av;
      const cl=delta>0?'deltaPlus':delta<0?'deltaMinus':'same';
      return `<tr><td>${i+1}</td>${pairDate(a?.date,b?.date)}<td>${a?yen(av):'-'}</td><td>${b?yen(bv):'-'}</td><td class="${cl}">${a&&b?`${delta>0?'+':''}${yen(delta)}`:'-'}</td></tr>`;
    }).join('');
    $('.compareDenseWrap',card).innerHTML=`<table class="compareDenseTable"><thead><tr><th>回</th><th>返済日<br>A / B</th><th>A ${metricName(metric)}</th><th>B ${metricName(metric)}</th><th>差額</th></tr></thead><tbody>${body}</tbody></table>`;
    $$('.compareMetricTabs button',card).forEach(btn=>btn.classList.toggle('active',btn.dataset.metric===metric));
    refreshAllDates();
  }
  function decorateCompareSchedules(view){
    const legacy=$('.compareSchedules',view);if(!legacy||legacy.dataset.v2362Done==='1')return;
    const data=getCompareData();if(!data)return;legacy.dataset.v2362Done='1';
    const card=document.createElement('section');card.className='card compareDenseCard';card.innerHTML='<div class="compareDenseHead"><div><h2>返済予定表を比較</h2><p>同じ回数ごとにA/Bを並べて確認できます。</p></div></div><div class="compareMetricTabs"><button type="button" data-metric="pay" class="active">返済額</button><button type="button" data-metric="principal">元金</button><button type="button" data-metric="interest">利息</button><button type="button" data-metric="bal">残高</button></div><div class="compareDenseWrap"></div>';
    const head=$('.compareDenseHead',card);head.append(makeDateSwitch());
    $('.compareMetricTabs',card).addEventListener('click',e=>{const b=e.target.closest('button[data-metric]');if(b)renderCompareDense(card,data,b.dataset.metric);});
    legacy.before(card);renderCompareDense(card,data,'pay');
  }
  function captureWizard(){
    const next=$('#wizardNext');if(!next||next.textContent.trim()!=='試算する')return;
    const title=$('#wizardTitle')?.textContent||'';
    const selectedUnit=$('#unitSeg .selected')?.dataset.unit || '万円';
    const d={
      principal:$('#wPrincipal')?.value||'',unit:selectedUnit,rate:$('#wRate')?.value||'',method:$('#wEG')?.classList.contains('selected')?'eg':'ep',
      years:$('#wYears')?.value||'10',count:$('#wCount')?.value||'120',monthlyPrincipal:$('#wMonthlyPrincipal')?.value||'',monthlyPrincipalUnit:'円',remainderAdjust:$('#remainderAdjustSeg .selected')?.dataset.remainderAdjust||'last',repayDay:$('#wRepayDay')?.value||'17',execDate:$('#wExecDate')?.value||'',
      bonus:$('#wBonusYes')?.classList.contains('selected')||false,bonusMonth1:$('#wBonusMonth1')?.value||'6',bonusMonth2:$('#wBonusMonth2')?.value||'12',bonusAmount:$('#wBonusAmount')?.value||''
    };
    if(title.includes('パターンA'))sessionStorage.setItem(SNAP_A,JSON.stringify(d));
    if(title.includes('パターンB')||title.includes('比較する条件'))sessionStorage.setItem(SNAP_B,JSON.stringify(d));
  }
  function initAmbientEcho(){
    if($('#ambientEcho')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const canvas=document.createElement('canvas');canvas.id='ambientEcho';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
    const ctx=canvas.getContext('2d');let w=0,h=0,dpr=1,last=0;
    const rand=n=>{const x=Math.sin(n*78.233)*43758.5453;return x-Math.floor(x)};
    let p=[];
    function reset(){dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);p=Array.from({length:260},(_,i)=>({x:rand(i+1)*w,y:h*(.12+rand(i+800)*.76),r:.23+rand(i+1200)*.62,s:.05+rand(i+1600)*.16,phase:rand(i+2000)*Math.PI*2,a:.20+rand(i+2400)*.58}));}
    function tick(now){requestAnimationFrame(tick);if(now-last<48)return;last=now;ctx.clearRect(0,0,w,h);const light=document.documentElement.dataset.theme==='light';ctx.save();ctx.globalCompositeOperation=light?'source-over':'lighter';
      for(let l=0;l<3;l++){const y=h*(.20+l*.24)+Math.sin(now*.00020+l)*h*.022;ctx.beginPath();ctx.moveTo(-24,y);ctx.bezierCurveTo(w*.26,y-h*.05,w*.61,y+h*.055,w+28,y-h*.018);ctx.strokeStyle=light?`rgba(26,112,207,${.052+l*.013})`:`rgba(92,179,255,${.055+l*.014})`;ctx.lineWidth=.8+l*.22;ctx.stroke();}
      for(const q of p){q.x+=q.s;if(q.x>w+10){q.x=-10;q.y=h*(.12+rand(q.phase+now*.0003)*.76)}const y=q.y+Math.sin(now*.00045+q.phase)*3.2;const pulse=.72+.28*Math.sin(now*.00085+q.phase);const a=q.a*pulse*(light?.48:.72);const rgb=light?'20,105,208':'138,214,255';ctx.beginPath();ctx.fillStyle=`rgba(${rgb},${a*.11})`;ctx.arc(q.x,y,q.r*5.8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.fillStyle=`rgba(${rgb},${a})`;ctx.arc(q.x,y,q.r,0,Math.PI*2);ctx.fill();}
    ctx.restore();}
    addEventListener('resize',reset,{passive:true});reset();requestAnimationFrame(tick);
  }
  function process(){
    updateVersionText();
    $$('.resultHero').forEach(addResultOrbit);
    $$('.scheduleCard').forEach(decorateSchedule);
    const cv=$('#compareView');if(cv&&!cv.hidden){decorateCompare(cv);decorateCompareSchedules(cv);}
    refreshAllDates();
  }
  let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;process();});});
  function init(){
    document.addEventListener('click',e=>{if(e.target.closest('#wizardNext'))captureWizard();if(e.target.closest('#closeCompare'))setTimeout(()=>{sessionStorage.removeItem(SNAP_A);sessionStorage.removeItem(SNAP_B);},0);},true);
    observer.observe(document.body,{childList:true,subtree:true});initAmbientEcho();process();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
