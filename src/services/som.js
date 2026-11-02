
export const SND={on:true};let AC=null;

export const tone=(f,t,d,ty='triangle')=>{const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(.12,AC.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+t+d);o.connect(g);g.connect(AC.destination);o.start(AC.currentTime+t);o.stop(AC.currentTime+t+d)};

export const sfx=k=>{if(!SND.on)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();
 ({place:[[440,0,.08]],tap:[[600,0,.05]],ok:[[523,0,.15],[659,.15,.15],[784,.3,.3]],soft:[[330,0,.22,'sine']],up:[[523,0,.14],[659,.14,.14],[784,.28,.14],[1047,.42,.4]]})[k].forEach(a=>tone(a[0],a[1],a[2],a[3]));
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&navigator.vibrate)navigator.vibrate(k==='up'?[60,40,60]:25);}catch(e){}};

