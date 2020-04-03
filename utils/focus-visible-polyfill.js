export const enableFocusVisible = (selector) => {
  init();
  selector.addEventListener('focus', _handleFocus.bind(selector));
  selector.addEventListener('blur', _handleBlur.bind(selector));
};

function init() {
  if(window.__focusVisiblePolyFillReady === true) return;
  window.addEventListener('keydown', e => window.__focusVisiblePolyFillLastKeyDown = e.key);
  window.addEventListener('mousedown', () => window.__focusVisiblePolyFillLastKeyDown = null);
  window.addEventListener('pointerdown', () => window.__focusVisiblePolyFillLastKeyDown = null);
  window.addEventListener('touchdown', () => window.__focusVisiblePolyFillLastKeyDown = null);
  window.__focusVisiblePolyFillReady = true;
}

function _handleFocus() {
  if(window.__focusVisiblePolyFillLastKeyDown === 'Tab') return addClass.call(this);
  removeClass.call(this);
}

function addClass() {
  this.classList.add('focus-visible');
}

function removeClass() {
  this.classList.remove('focus-visible');
}

function _handleBlur() {
  removeClass.call(this);
}