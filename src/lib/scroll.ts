export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) {
    console.warn("Scroll target not found:", id);
    return;
  }

  const offset = 80; // navbar height
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  
  window.scrollTo({ 
    top, 
    behavior: "smooth" 
  });
}

export function getScrollContainer(): HTMLElement | Window {
  // If you use a custom container, return it. otherwise return window
  const el = document.querySelector('[data-scroll-container="true"]') as HTMLElement | null;
  return el ?? window;
}