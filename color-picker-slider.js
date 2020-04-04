import { HTMLInputElement, html } from '@html-element-wrappers/input';
import { enableFocusVisible } from '../utils/focus-visible-polyfill.js';
import { PropertyChangedHandler } from 'html-element-property-mixins/src/addons';

export class ColorPickerSlider extends PropertyChangedHandler(HTMLInputElement) {

  static get properties() {
    return {...super.properties, ...{
      label: {
        observe: true,
        changedHandler: '_labelChanged'
      }
    }};
  }

  /**
   * @private
   */
  get styles() {
    return html`
      <style>
        
        :host {
          display: block;
        }

        input[type="range"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          -ms-appearance: none;
          width: 100%;
          height: 100%;
          background: transparent;
          position: relative;
          margin: 0;
          padding: 0;
          font-size: 0;
          outline: none;
          z-index: 1;
        }

        :host(.focus-visible) input {
          outline-color: -webkit-focus-ring-color;
          outline-style: auto;
        }

        input[type="range"]::-webkit-slider-thumb {
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

        input[type="range"]::-webkit-slider-thumb {
          ${this._thumbStyles}
        }

        input[type="range"]::-moz-range-thumb {
          ${this._thumbStyles}
        }

        input[type="range"]::-ms-thumb {
          ${this._thumbStyles}
        }

        input[type="range"]::-webkit-slider-runnable-track {
          ${this._trackStyles}
        }

        input[type="range"]::-moz-range-track {
          ${this._trackStyles}
        }

        input[type="range"]::-ms-track {
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
      height: 100%;
      width: 100%;
      background: transparent;
    `;    
  }

  constructor() {
    super();
    enableFocusVisible(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.requestAnimationFrame(() => this._labelChanged());
  }

  /**
   * @private
   */
  get type() {
    return 'range';
  }

  _labelChanged() {
    if(!this.$element.setAttribute) return;
    this.$element.setAttribute('aria-label', this.label);
  }
  
}

window.customElements.define('color-picker-slider', ColorPickerSlider);