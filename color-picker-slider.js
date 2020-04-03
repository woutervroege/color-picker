import { HTMLInputElement, html } from '@html-element-wrappers/input';
import { enableFocusVisible } from '../utils/focus-visible-polyfill.js';

export class ColorPickerSlider extends HTMLInputElement {

  /**
   * @private
   */
  get styles() {
    return html`
      <style>
        
        :host {
          outline: none;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          display: inline-block;
          font-size: 0;
          background: transparent;
          padding: 0;
          border-radius: 10px;
        }

        input {
          -webkit-appearance: none;
          -moz-appearance: none;
          -ms-appearance: none;
          width: 100%;
          background: transparent;
          position: relative;
          margin: 0;
          outline: none;
        }

        :host(.focus-visible) input {
          outline-color: -webkit-focus-ring-color;
          outline-style: auto;
        }

        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          -moz-appearance: none;
          -ms-appearance: none;
        }

        input[type=range]::-ms-track {
          width: 100%;
          cursor: pointer;
          background: transparent;
          border-color: transparent;
          color: transparent;
        }

        input[type=range]::-webkit-slider-thumb {
          ${this._thumbStyles}
        }

        input[type=range]::-moz-range-thumb {
          ${this._thumbStyles}
        }

        input[type=range]::-ms-thumb {
          ${this._thumbStyles} 
        }

        input[type=range]::-webkit-slider-runnable-track {
          ${this._trackStyles}
        }

        input[type=range]::-moz-range-track {
          ${this._trackStyles}
        }

        input[type=range]::-ms-track {
          ${this._trackStyles}
        }

      </style>
    `;
  }

  get _thumbStyles() {
    return `
    height: 14px;
    width: 14px;
    background: transparent;
    border: 2px solid white;
    box-shadow: 0 0 2px rgba(0,0,0,0.4), inset 0 0 2px rgba(0,0,0,0.4);
    border-radius: 50%;
    box-sizing: border-box;
    content: '';
`;
  }

  get _trackStyles() {
    return `
      height: 14px;
      width: 100%;
      background: var(--color-picker-slider-track-background, black);
      border-radius: 10px;
    `;    
  }

  constructor() {
    super();
    enableFocusVisible(this);
  }

  /**
   * @private
   */
  get type() {
    return 'range';
  }
  
}

window.customElements.define('color-picker-slider', ColorPickerSlider);