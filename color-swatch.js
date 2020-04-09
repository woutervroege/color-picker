import { HTMLButtonElement, html } from '@html-element-wrappers/button';
import { enableFocusVisible } from './utils/focus-visible-polyfill.js';
import { PropertyChangedHandler } from 'html-element-property-mixins/src/addons';
import { TinyColor } from '@ctrl/tinycolor';

export class ColorSwatch extends PropertyChangedHandler(HTMLButtonElement) {

  constructor() {
    super();
    enableFocusVisible(this);
  }

  propertyChangedCallback(propName, oldValue, newValue) {
    super.propertyChangedCallback(propName, oldValue, newValue);
    if(this.isConnected) this._setCSSProperty('--color', new TinyColor(this.value).toRgbString());
  }

  connectedCallback() {
    super.connectedCallback();
    this.placeholder = new TinyColor(this.value).toRgbString();
    this._setCSSProperty('--color', this.placeholder);
    this.tabIndex = 0;
    this.addEventListener('focus', this._handleFocus);
    this.addEventListener('keydown', this._handleKeydown);
  }

  get styles() {
    return html`
      <style>
        :host {
          display: block;
          outline: none;
          padding: 4px;
          box-sizing: border-box;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }

        :host([disabled]) {
          cursor: default;
        }
        
        :host(.focus-visible) {
          outline-color: -webkit-focus-ring-color;
          outline-style: auto;
        }

        :host(:not([disabled]):hover), :host(:not([disabled]):focus) {
          background: var(--bg-color--10);
        }        

        div {
          width: 100%;
          height: 100%;
          display: flex;
        }

        button {
          min-width: var(--swatch-size);
          height: var(--swatch-size);
          border-radius: 50%;
          border: 1px solid var(--bg-color--20);
          background-color: var(--color);
          font-size: 0;
          outline: none;
        }

        input {
          width: 100%;
          background: transparent;
          color: var(--color-picker-color);
          border: 0;
          font-size: 12px;
          padding: 0 8px;
          outline: none;
          cursor: inherit;
          user-select: none;
          -webkit-user-select: none;
        }

        input:not([readonly]):focus {
          background: var(--color-picker-background-color);
          cursor: text;
        }

        :host([disabled]) {
          opacity: 0.5;
        }
      </style>
      
    `;
  }

  get template() {
    return html`
      <div @click="${this._handleClick}">
        ${super.template}
        <input 
          .value="${this.title}"input
          ?disabled="${this.disabled}"
          .placeholder="${this.placeholder}"
          readonly        
          @dblclick="${this._handleInputDblClick}"
          @keydown="${this._handleInputKeypress}"
          @blur="${this._handleInputBlur}"
          @change="${e => this.title = e.target.value}"
        >
      </div>
    `;
  }

  _setCSSProperty(propName, value, selector = this) {
    if(!selector) return;
    selector.style.setProperty(propName, value);
    if(window.ShadyCSS) window.ShadyCSS.styleSubtree(this, {[propName] : value});
  }

  _handleClick(e) {
    if(this.disabled) e.stopPropagation();
    this.dispatchEvent(new Event('click'));
  }

  _handleInputDblClick(e) {
    if(this.readOnly) return;
    e.target.readOnly = false;
  }

  _handleInputKeypress(e) {
    if(e.key === 'Enter') {
      e.target.readOnly = !e.target.readOnly;
      if(e.target.readOnly === false) e.target.select();
    }
    if(e.target.readOnly) return;
    e.stopPropagation();
  }

  _handleInputBlur(e) {
    e.target.readOnly = true;
  }

  _handleFocus() {
    window.setTimeout(() => {
      this.shadowRoot.querySelector('input').focus();
    }, 40);
  }

  _handleKeydown(e) {
    if(e.code === 'Space') this.click();
    if(e.key === 'Delete' || e.key === 'Backspace') this.dispatchEvent(new CustomEvent('delete-swatch', {bubbles: true}));
  }
  
}

window.customElements.define('color-swatch', ColorSwatch);