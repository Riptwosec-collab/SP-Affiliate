// Device preference only: never enters workspace records, drafts or cloud sync.
const themeMedia=window.matchMedia('(prefers-color-scheme: dark)');
let themePreference=document.documentElement.dataset.themePreference||'light';
function themeSettingsHTML(card=true){return `<section class="${card?'card mb':'drawer-appearance'}"><h2>${uiText('theme_title')}</h2>${card?`<p class="sub">${uiText('theme_description')}</p>`:''}<div class="theme-options" role="group" aria-label="${uiText('theme_title')}">${['light','dark','system'].map(v=>btn(uiText('theme_'+v),'theme-select','small',`data-theme="${v}" aria-pressed="${themePreference===v}"`)).join('')}</div>${btn(uiText('focus_background'),'appearance','ghost small theme-flat',`aria-pressed="${focusBackground}"`)}</section>`;}
function refreshThemeControls(){
 const dark=document.documentElement.dataset.theme==='dark',toggle=$('#theme-toggle');
 if(toggle){toggle.innerHTML=dark?icon('sun'):'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.6 14A9 9 0 0 1 10 3.4 9 9 0 1 0 20.6 14Z"/></svg>';toggle.setAttribute('aria-label',uiText(dark?'theme_switch_light':'theme_switch_dark'));toggle.title=toggle.getAttribute('aria-label');toggle.setAttribute('aria-pressed',String(dark));}
 $$('[data-action="theme-select"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===themePreference)));
 $$('[data-action="appearance"]').forEach(b=>b.setAttribute('aria-pressed',String(focusBackground)));
}
function applyTheme(){
 const theme=themePreference==='system'?(themeMedia.matches?'dark':'light'):themePreference;
 document.documentElement.dataset.theme=theme;
 document.documentElement.dataset.themePreference=themePreference;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#10151e':'#fbfcfe');
 refreshThemeControls();
}
function setTheme(value){
 if(!['light','dark','system'].includes(value))return;
 themePreference=value;applyTheme();
 try{localStorage.setItem('aff-theme',value)}catch{toast(uiText('theme_storage_error'))}
}
themeMedia.addEventListener('change',()=>{if(themePreference==='system')applyTheme()});
window.addEventListener('storage',e=>{if(e.key==='aff-theme'){themePreference=['light','dark','system'].includes(e.newValue)?e.newValue:'light';applyTheme()}});
applyTheme();
