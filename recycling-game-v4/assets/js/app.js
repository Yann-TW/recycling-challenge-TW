(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const screens = {landing:$('landingScreen'),game:$('gameScreen'),end:$('endScreen')};
  const regionButtons=[...document.querySelectorAll('.region-option')];
  const bins=[...document.querySelectorAll('.bin')];
  const modal=$('modal'), modalCard=modal.querySelector('.modal-card');
  let selectedRegion='',roundItems=[],currentIndex=0,score=0,correct=0,streak=0,bestStreak=0,fastBonuses=0,comboBonuses=0;
  let timerId=null,advanceId=null,itemStartedAt=0,answerLocked=false,lastFocusedElement=null;

  function clearTimers(){ if(timerId)cancelAnimationFrame(timerId); clearTimeout(advanceId); timerId=null;advanceId=null; }
  function showScreen(name){ clearTimers();Object.values(screens).forEach(s=>s.classList.remove('active'));screens[name].classList.add('active');window.scrollTo({top:0,behavior:'smooth'}); }
  function shuffle(a){const copy=[...a];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
  function labelFor(c){return({recyclable:'Recyclable',food:'Food waste',residual:'Non-recyclable'})[c]||c;}
  function updateStatus(){$('scoreDisplay').textContent=score;$('streakDisplay').textContent=streak;}

  regionButtons.forEach(button=>button.addEventListener('click',()=>{
    selectedRegion=button.dataset.region;
    regionButtons.forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
    $('startButton').disabled=false;$('startButton').textContent=`START FOR ${selectedRegion}`;
  }));

  function startGame(){
    if(!selectedRegion)return;
    const groups=['recyclable','food','residual'].map(category=>shuffle(ITEM_POOL.filter(item=>item.category===category)));
    roundItems=shuffle([...groups[0].slice(0,7),...groups[1].slice(0,7),...groups[2].slice(0,6)]);
    currentIndex=score=correct=streak=bestStreak=fastBonuses=comboBonuses=0;
    $('regionDisplay').textContent=selectedRegion;showScreen('game');renderItem();
  }

  function renderItem(){
    clearTimers();answerLocked=false;
    $('feedback').className='feedback';$('feedback').textContent='';
    bins.forEach(bin=>{bin.disabled=false;bin.classList.remove('correct-choice','wrong-choice');});
    const item=roundItems[currentIndex];
    $('itemNumber').textContent=currentIndex+1;$('itemName').textContent=item.name;$('itemIcon').textContent=item.icon;$('itemDescription').textContent=item.description;
    $('roundProgress').style.width=`${((currentIndex+1)/roundItems.length)*100}%`;updateStatus();startTimer();
  }

  function startTimer(){
    const duration=5000;itemStartedAt=performance.now();
    const frame=now=>{
      if(answerLocked)return;
      const remaining=Math.max(0,duration-(now-itemStartedAt));const ratio=remaining/duration;
      $('timerBar').style.width=`${ratio*100}%`;$('timerBar').classList.toggle('warning',remaining<1800);$('timerText').textContent=(remaining/1000).toFixed(1);
      if(remaining<=0){processTimeout();return;}timerId=requestAnimationFrame(frame);
    };
    timerId=requestAnimationFrame(frame);
  }

  function lockChoices(selected){
    bins.forEach(bin=>{bin.disabled=true;if(bin.dataset.bin===roundItems[currentIndex].category)bin.classList.add('correct-choice');else if(bin.dataset.bin===selected)bin.classList.add('wrong-choice');});
    if(timerId)cancelAnimationFrame(timerId);timerId=null;$('timerBar').style.width='0%';$('timerText').textContent='0.0';
  }

  function processAnswer(category){
    if(answerLocked||!roundItems[currentIndex])return;answerLocked=true;lockChoices(category);
    const item=roundItems[currentIndex],elapsed=performance.now()-itemStartedAt;let text='';
    if(category===item.category){score++;correct++;streak++;bestStreak=Math.max(bestStreak,streak);text='Correct · +1';
      if(elapsed<2000){score++;fastBonuses++;text+=' · Fast +1';}
      if(streak%5===0){score+=2;comboBonuses++;text+=` · ${streak}-streak +2`;}
      $('feedback').className='feedback good';
    }else{score--;streak=0;text=`Incorrect · ${item.name} goes in ${labelFor(item.category)} · −1`;$('feedback').className='feedback bad';}
    $('feedback').textContent=text;updateStatus();advanceId=setTimeout(nextItem,1050);
  }

  function processTimeout(){
    if(answerLocked||!roundItems[currentIndex])return;answerLocked=true;lockChoices('');score--;streak=0;
    const item=roundItems[currentIndex];$('feedback').className='feedback bad';$('feedback').textContent=`Time expired · ${item.name} goes in ${labelFor(item.category)} · −1`;updateStatus();advanceId=setTimeout(nextItem,1250);
  }
  function nextItem(){currentIndex++;currentIndex>=roundItems.length?finishGame():renderItem();}
  function finishGame(){
    clearTimers();const perfect=correct===20?5:0;score+=perfect;const accuracy=Math.round(correct/20*100);
    $('finalRegion').textContent=selectedRegion;$('shareRegion').textContent=selectedRegion;$('correctCount').textContent=correct;$('finalScore').textContent=score;$('bestStreak').textContent=bestStreak;$('accuracyDisplay').textContent=`${accuracy}%`;
    if(correct===20){$('endBadge').textContent='Perfect game';$('endMessage').textContent=`Outstanding. ${selectedRegion} receives your maximum performance.`;}
    else if(correct>=16){$('endBadge').textContent='Excellent result';$('endMessage').textContent=`Strong sorting. You added ${score} points for ${selectedRegion}.`;}
    else if(correct>=11){$('endBadge').textContent='Solid performance';$('endMessage').textContent=`You added ${score} points for ${selectedRegion}. Replay to move higher.`;}
    else{$('endBadge').textContent='Challenge complete';$('endMessage').textContent=`You represented ${selectedRegion}. Replay and strengthen your score.`;}
    $('bonusSummary').textContent=`Fast-answer points +${fastBonuses}  ·  Combo points +${comboBonuses*2}  ·  Perfect-game points +${perfect}`;showScreen('end');
  }

  async function copyScore(){
    const text=`Tradeweb Recycling Challenge\nRegion: ${selectedRegion}\nScore: ${score}\nCorrect: ${correct}/20\nAccuracy: ${Math.round(correct/20*100)}%\nBest streak: ${bestStreak}`;
    try{await navigator.clipboard.writeText(text);const b=$('copyScoreButton'),old=b.textContent;b.textContent='COPIED';setTimeout(()=>b.textContent=old,1400);}catch(e){window.prompt('Copy your score:',text);}
  }
  function openModal(){lastFocusedElement=document.activeElement;modal.hidden=false;document.body.classList.add('modal-open');modalCard.focus();}
  function closeModal(){if(modal.hidden)return;modal.hidden=true;document.body.classList.remove('modal-open');if(lastFocusedElement&&lastFocusedElement.focus)lastFocusedElement.focus();}

  bins.forEach(bin=>bin.addEventListener('click',()=>processAnswer(bin.dataset.bin)));
  $('startButton').addEventListener('click',startGame);$('playAgainButton').addEventListener('click',()=>showScreen('landing'));$('copyScoreButton').addEventListener('click',copyScore);
  $('howToButton').addEventListener('click',openModal);$('closeModalButton').addEventListener('click',closeModal);$('modalDoneButton').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
  document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();showScreen('landing');});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!modal.hidden){closeModal();return;}
    if(!screens.game.classList.contains('active')||answerLocked||!modal.hidden)return;
    const map={'1':'recyclable','2':'food','3':'residual','a':'recyclable','b':'food','c':'residual'};const category=map[e.key.toLowerCase()];if(category)processAnswer(category);
  });
  window.addEventListener('beforeunload',clearTimers);
})();
