/* Presentation only: no workspace, history or storage mutations. */
const editorialMotion=(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const animations=new Set();
  let observer,activeCard,tiltFrame=0,scrollFrame=0,point;
  const enabled=()=>!reduce.matches&&!document.body.classList.contains('reduce')&&!document.body.classList.contains('focus-background');
  let motionAllowed=enabled();
  function resetTilt(){
    cancelAnimationFrame(tiltFrame);tiltFrame=0;
    if(activeCard){activeCard.classList.remove('is-tilting');['--tilt-x','--tilt-y','--shine-x','--shine-y'].forEach(k=>activeCard.style.removeProperty(k));}
    activeCard=null;
  }
  function updateScroll(){
    scrollFrame=0;
    const max=document.documentElement.scrollHeight-innerHeight;
    const progress=max>0?Math.max(0,Math.min(1,scrollY/max)):0;
    document.querySelector('.reading-progress')?.style.setProperty('--page-progress',String(progress));
    document.querySelector('.store-header')?.classList.toggle('is-scrolled',scrollY>12);
  }
  function queueScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);}
  function refresh(){
    motionAllowed=enabled();
    observer?.disconnect();resetTilt();
    animations.forEach(a=>a.cancel());animations.clear();queueScroll();
    if(!enabled()||!('IntersectionObserver' in window))return;
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        observer.unobserve(entry.target);
        if(!enabled()||!entry.target.animate)continue;
        const animation=entry.target.animate([{transform:'translateY(12px)'},{transform:'translateY(0)'}],{duration:460,easing:'cubic-bezier(.2,.8,.2,1)'});
        animations.add(animation);animation.onfinish=()=>animations.delete(animation);
      }
    },{threshold:.08});
    document.querySelectorAll('.store-section,.recent-stories,.insight-card,.pagehead,.scene-card').forEach(el=>observer.observe(el));
  }
  document.addEventListener('pointermove',e=>{
    if(!fine.matches||e.pointerType==='touch'||!enabled()){resetTilt();return;}
    const card=e.target.closest?.('.showcase-card');
    if(!card||card.closest('.showcase-list')){resetTilt();return;}
    if(activeCard!==card){resetTilt();activeCard=card;}
    point={x:e.clientX,y:e.clientY};
    if(tiltFrame)return;
    tiltFrame=requestAnimationFrame(()=>{
      tiltFrame=0;if(!activeCard?.isConnected||!enabled()){resetTilt();return;}
      const rect=activeCard.getBoundingClientRect();
      const x=Math.max(0,Math.min(1,(point.x-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(point.y-rect.top)/rect.height));
      activeCard.style.setProperty('--tilt-x',((.5-y)*3).toFixed(2)+'deg');
      activeCard.style.setProperty('--tilt-y',((x-.5)*3).toFixed(2)+'deg');
      activeCard.style.setProperty('--shine-x',(x*100).toFixed(1)+'%');
      activeCard.style.setProperty('--shine-y',(y*100).toFixed(1)+'%');
      activeCard.classList.add('is-tilting');
    });
  },{passive:true});
  document.addEventListener('pointerout',e=>{if(activeCard&&!activeCard.contains(e.relatedTarget))resetTilt();},{passive:true});
  document.addEventListener('focusin',resetTilt);
  window.addEventListener('blur',resetTilt);
  window.addEventListener('scroll',()=>{resetTilt();queueScroll();},{passive:true});
  window.addEventListener('resize',queueScroll,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resetTilt();animations.forEach(a=>a.cancel());animations.clear();}});
  reduce.addEventListener('change',refresh);fine.addEventListener('change',resetTilt);
  new MutationObserver(()=>{if(enabled()!==motionAllowed)refresh();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  return {refresh};
})();
