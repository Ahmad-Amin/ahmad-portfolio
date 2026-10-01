// The brand intro is driven by a `data-intro` attribute on <html>, set by the
// inline script below before first paint:
//   "pending": the overlay is showing (first visit this session, home page only)
//   "done":    the overlay is fading out / gone
//   (absent):  no intro this load, or the script never ran
// The overlay is hidden by default in CSS, so if this script is blocked or
// throws, visitors simply get the normal site.

const SESSION_KEY = "intro-seen";
// How long the overlay stays before it starts fading out. The CSS fade adds ~0.4s.
export const INTRO_MS = 1400;

export const introScript = `(function(){try{
var d=document.documentElement;
if(location.pathname!=="/"||location.hash||matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("${SESSION_KEY}"))return;
sessionStorage.setItem("${SESSION_KEY}","1");
d.setAttribute("data-intro","pending");
var evs=["pointerdown","keydown","wheel","touchstart"];
function done(){
if(d.getAttribute("data-intro")!=="pending")return;
d.setAttribute("data-intro","done");
clearTimeout(t);
evs.forEach(function(e){removeEventListener(e,done)});
}
var t=setTimeout(done,${INTRO_MS});
evs.forEach(function(e){addEventListener(e,done,{passive:true})});
}catch(e){}})();`;

// Runs `callback` once the intro is over (immediately if there isn't one).
// Returns a cleanup function. Client-only: call it from an effect.
export function whenIntroDone(callback: () => void): () => void {
  const root = document.documentElement;
  if (root.getAttribute("data-intro") !== "pending") {
    callback();
    return () => {};
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    observer.disconnect();
    clearTimeout(fallback);
    callback();
  };
  const observer = new MutationObserver(() => {
    if (root.getAttribute("data-intro") !== "pending") finish();
  });
  observer.observe(root, { attributes: true, attributeFilter: ["data-intro"] });
  // Never leave the hero hidden if the attribute somehow doesn't change.
  const fallback = setTimeout(finish, INTRO_MS + 1500);

  return () => {
    finished = true;
    observer.disconnect();
    clearTimeout(fallback);
  };
}
