import { Properties } from 'html-element-property-mixins';
import { BooleanConverter } from 'html-element-property-mixins/src/utils/attribute-converters';
import { render, html } from 'lit-html/lib/shady-render';
import { enableFocusVisible } from './utils/focus-visible-polyfill.js';
import './color-swatch.js';

export class ColorSwatchgroup extends Properties(HTMLElement) {
  
  static get properties() {
    return {
      
      label: {
        observe: true,
        DOM: true
      },

      disabled: {
        observe: true,
        DOM: true,
        fromAttributeConverter: BooleanConverter.fromAttribute
      },

      readonly: {
        observe: true,
        DOM: true,
        fromAttributeConverter: BooleanConverter.fromAttribute
      }

    };
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.readonly = false;
    this.addEventListener('click', this._handleClick.bind(this));
    this.addEventListener('delete-swatch', this._handleDeleteSwatch.bind(this));
    enableFocusVisible(this.shadowRoot.querySelector('button'));
  }

  propertyChangedCallback(propName, oldValue, newValue) {
    super.propertyChangedCallback(propName, oldValue, newValue);
    render(this.template, this.shadowRoot, {eventContext: this, scopeName: this.localName});
  }

  get template() {
    return html`
      <style>
        :host {
          display: block;
          --swatch-size: 28px;
        }

        section {
          margin: 0;
        }

        main {
          display: grid;
          grid-gap: 4px;
          grid-template-columns: repeat(auto-fill, minmax(var(--swatch-size), 1fr));
        }

        ::slotted(:not(color-swatch)) {
          display: none!important;
        }

        ::slotted(color-swatch) {
          flex: none;
        }

        button {
          background: transparent;
          color: inherit;
          border: 0;
          font-size: 22px;
          font-weight: 200;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--swatch-size);
          height: var(--swatch-size);
          padding: 0;
          outline: none;
        }

        button.focus-visible {
          outline-color: -webkit-focus-ring-color;
          outline-style: auto;
        }

        span {
          background: var(--color-picker-current-color);
        }

        [hidden] {
          display: none!important;
        }
      </style>
      <section>
        <main>
          <slot @slotchange="${this._handleSlotChange}"></slot>
          <button title="Add current color" ?hidden="${this.readonly}" @click="${this._handleButtonClick}">+</button>
        </main>
      </section>
      <span hidden></span>
`;
  }

  _handleSlotChange(e) {
    const nodes = e.target.assignedNodes();
    const swatchElements = [];
    for(let i in nodes) if(nodes[i].tagName === 'COLOR-SWATCH') swatchElements.push(nodes[i]);
  }

  _handleClick(e) {
    if(e.target.tagName === 'COLOR-SWATCH') this._fireSwatchClick(e);
  }

  _handleDeleteSwatch(e) {
    const deleteSwatch = window.confirm('Are you sure you want to delete this?');
    if(deleteSwatch) e.target.remove();
  }

  _fireSwatchClick(e) {
    this.dispatchEvent(new CustomEvent('swatch-clicked', {
      detail: { value: e.target.value }, bubbles: true
    }));
  }

  _handleButtonClick() {
    if(this.disabled || this.readonly) return;
    const swatch = document.createElement('color-swatch');
    swatch.value = this.currentColor;
    swatch.title = this.currentColor;
    this.appendChild(swatch);
  }

  get currentColor() {
    return window.getComputedStyle(this.shadowRoot.querySelector('span')).backgroundColor;
  }

}

window.customElements.define('color-swatchgroup', ColorSwatchgroup);