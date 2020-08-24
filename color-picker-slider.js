import { HTMLInputElement, html } from '@html-element-wrappers/input';
import { enableFocusVisible } from './utils/focus-visible-polyfill.js';
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
          outline: none;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          display: inline-block;
          background: transparent;
          padding: 0;
          border-radius: 10px;
          height: 14px;
          overflow: hidden;
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
          ${this._thumbStyles}
        }

        input[type="range"]::-moz-range-thumb {
          -moz-appearance: none;
          ${this._thumbStyles}
        }

        input[type="range"]::-ms-thumb {
          -ms-appearance: none;
          ${this._thumbStyles}
        }

        input[type="range"]::-webkit-slider-runnable-track {
          -webkit-appearance: none;
          ${this._trackStyles}
        }

        input[type="range"]::-moz-range-track {
          -moz-appearance: none;
          ${this._trackStyles}
        }

        input[type="range"]::-ms-track {
          -ms-appearance: none;
          cursor: pointer;
          background: transparent;
          border-color: transparent;
          color: transparent;
          ${this._trackStyles}
        }

        input[type="range"]::-ms-fill-lower {
          background: transparent;
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
    super.connectedCallback && super.connectedCallback();
    window.requestAnimationFrame(() => {
      this._labelChanged();
      this.$element.addEventListener('change', this._handleChange.bind(this));
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    this.$element.removeEventListener('change', this._handleChange.bind(this));
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

  _handleChange(e) {
    const evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent('change', e.bubbles, e.cancelable, e.detail);
    this.dispatchEvent(evt);
  }
  
}

window.customElements.define('color-picker-slider', ColorPickerSlider);