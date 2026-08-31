// blocks/hero/hero.js - With basic debugging

export default function decorate(block) {
  console.log('[HERO] Starting decoration');
  const heading = block.querySelector('h1');
  const text = block.querySelector('p');
  console.log('[HERO] Found elements:', { heading: !!heading, text: !!text });

  if (heading) {
    heading.classList.add('hero-title');
    console.log('[HERO] Added hero-title class');
  }

  if (text) {
    text.classList.add('hero-text');
    console.log('[HERO] Added hero-text class');
  }
  console.log('[HERO] Decoration complete');
}
