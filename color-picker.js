import { Properties } from 'html-element-property-mixins';
import { PropertyChangedHandler, PropertiesChangedHandler, PropertiesChangedCallback } from 'html-element-property-mixins/src/addons';
import { TinyColor } from '@ctrl/tinycolor';
import { render, html } from 'lit-html';
import { ColorPickerSlider } from './color-picker-slider.js';
import { enableFocusVisible } from '../utils/focus-visible-polyfill.js';

class ColorPicker extends PropertiesChangedHandler(PropertiesChangedCallback(PropertyChangedHandler(Properties(HTMLElement)))) {

  static get properties() {
    return {

      value: {
        observe: true,
        DOM: true,
        changedHandler: '_valueChanged'
      },

      format: {
        observe: true,
        DOM: true,
        changedHandler: '_formatChanged'
      },

      _pointerDown: {
        observe: true
      },

      _sliderDown: {
        observe: true
      }

    };
  }

  get value() {
    return this['#value'];
  }

  set value(val) {
    this['#value'] = new TinyColor(val);
  }

  get supportedFormats() {
    return ['hex', 'hex8', 'rgb', 'hsv', 'hsl'];
  }

  get format() {
    return this['#format'];
  }

  set format(val) {
    if(this.supportedFormats.indexOf(val) === -1) return;
    this['#format'] = val;
  }

  get hsv() {
    return this.value.toHsv();
  }

  get alpha() {
    return this.value.getAlpha();
  }

  set alpha(alpha) {
    const oldVal = this.value;
    this.value.setAlpha(alpha);
    this.propertyChangedCallback('value', oldVal, this.value);
  }

  get hex() {
    return this.value.toHex();
  }

  get hex8() {
    return this.value.toHex8();
  }

  get rgb() {
    return this.value.toRgb();
  }

  get hsl() {
    return this.value.toHsl();
  }

  get _gridGradient() {
    if(this.format === 'hsl') return 'linear-gradient(to bottom, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%), linear-gradient(to right, hsl(0, 0%, 50%) 0%, hsla(0, 0%, 50%, 0) 100%)';
    return 'linear-gradient(rgba(0,0,0,0) 0%, #000 100%), linear-gradient(to left, rgba(255,255,255,0) 0%, #fff 100%)';
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    
    this.value = {h: 0, s: 1, v: 1};
    this.format = 'rgb';
    this._pointerDown = false;
    this._sliderDown = false;

    window.addEventListener('mouseup', this._handleMouseup.bind(this), false);
    window.addEventListener('mousemove', this._handleMousemove.bind(this), false);
    enableFocusVisible(this.$grid);
    this._valueChanged();
    this.shadowRoot.querySelectorAll('input, select').forEach(item => enableFocusVisible(item))
  }

  propertyChangedCallback(propNames, oldValues, newValues) {
    super.propertyChangedCallback(propNames, oldValues, newValues);
    render(this.template, this.shadowRoot, {eventContext: this, scopeName: this.localName});
  }

  static get propertiesChangedHandlers() {
    return {
      '_notifyChanges': ['value', '_pointerDown', '_sliderDown']
    };
  }

  get template() {
    return html`

      <style>

        *, *:before, *:after {
          box-sizing: border-box;
          font-size: 0;
        }

        :host {
          width: 240px;
          height: 240px;
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          --color-picker-background-color: #fff;
          --color-picker-color: #222;
        }

        :host([light]) {
          --color-picker-background-color: #fff;
          --color-picker-color: #222;          
        }

        @media (prefers-color-scheme: dark) {
          :host {
            --color-picker-background-color: #222;
            --color-picker-color: #fff;          
          }
        }

        :host([dark]) {
          --color-picker-background-color: #222;
          --color-picker-color: #fff;          
        }

        #container {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          background-color: var(--color-picker-background-color);
          color: var(--color-picker-color);
        }

        #gridInput {
          position: relative;
          width: 100%;
          background: var(--grid-background);
          outline: none;
          flex: 1;
        }

        #gridInput:after {
          margin: -7px;
          transform: translateX(var(--grid-offset-x, 0)) translateY(var(--grid-offset-y, 0));
          ${this._thumbStyles}
        }

        #gridInput:focus.focus-visible {
          outline-color: -webkit-focus-ring-color;
          outline-style: auto;
        }

        .absbefore:before,
        .absafter:after {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          content: '';
        }

        #gridInput:before {
          background: var(--grid-gradient);
          content: '';
        }

        #sliderInput {
          padding: 8px;
          display: flex;
        }

        #sliders {
          display: flex;
          flex-direction: column;
          flex: 1;
          margin-right: 8px;
        }

        color-picker-slider:nth-child(1) {
          margin-bottom: 8px;
        }

        #hueInput {
          --color-picker-slider-track-background: linear-gradient(to right, red 0%, #ff0 17%, lime 33%, cyan 50%, blue 66%, #f0f 83%, red 100%);
        }

        #alphaInput {
          position: relative;
          --color-picker-slider-track-background: linear-gradient(to right, var(--alpha-slider-background-0) 0%, var(--alpha-slider-background-100) 100%);
        }

        #alphaInput:before, #alphaInput:after {
          border-radius: inherit;
          pointer-events: none;
        }

        #colorSteel {
          position: relative;
          width: 100%;
          height: 100%;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--bg-color--10);
          margin: auto;
          overflow: hidden;
        }

        #colorSteel:before,
        #colorSteel:after {
          content: '';
        }

        .checkerboard:before {
          background: linear-gradient(45deg, #777 25%, transparent 25%), linear-gradient(-45deg, #777 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #777 75%), linear-gradient(-45deg, transparent 75%, #777 75%);
          background-size: 6px 6px;
          background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
        }

        #colorSteel:after {
          background: var(--value);
        }

        input, select {
          border: 1px solid transparent;
          outline: none;
        }

        input:hover, select:hover, input:focus, select:focus {
          border-color: var(--bg-color--10);
        }

        :focus.focus-visible {
          outline-color: -webkit-focus-ring-color;
          outline-style: auto;
        }

        input, select, select * {
          font-size: 12px;
          padding: 3px;
          min-width: 44px;
          color: inherit;
          -moz-appearance: textfield;
          font-family: inherit;
        }

        input[type="text"] {
          min-width: 80px;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        #textInput {
          padding: 0 8px 8px 8px;
          display: flex;
          align-items: center;
        }

        select, .color-input, .alpha-input {
          flex: 0;
          padding: 0;
        }

        .color-input label, .alpha-input label {
          position: relative;
          display: block;
          height: 36px;
        }
        
        .color-input label:after, .alpha-input label:after {
          content: attr(data-name);
          font-size: 10px;
          position: absolute;
          top: 20px;
          left: 0;
          width: 100%;
          text-align: center;
          text-transform: uppercase;
          color: inherit;
          color: var(--bg-color--60);
          display: block;
        }

        select .alpha-input {
          flex: 0;
        }

        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          -ms-appearance: none;
          border-radius: 0;
          background: transparent;
          padding: 3px;
          text-align: center;
          text-align-last: center;
          align-self: flex-start;
          margin: 0;
        }

        .color-input {
          flex: 0;
          display: flex;
          justify-content: flex-start;
        }

        input {
          padding: 3px;
          margin: 0;
          flex: 1;
          text-align: center;
          text-align-last: center;
          background: transparent;
          color: inherit;
          text-transform: uppercase;
          width: 100%;
        }

        [hidden] {
          display: none!important;
        }
      </style>

      <div id="container">

        <section
          id="gridInput"
          class="absbefore absafter"
          tabindex="0"
          @mousedown="${this._handleMousedown}"
          @keydown="${this._handleGridKeydown}"
          @click="${this._handleGridClick}"
        ></section>

        <section id="sliderInput">
          <div id="sliders">
            <color-picker-slider id="hueInput" .value="${this.hsv.h}" min="0" max="359" step="1" data-scheme="hsv" data-key="h" @input="${this._handleInput}" @mousedown="${() => this._sliderDown = true}" @mouseup="${() => this._sliderDown = false}"></color-picker-slider>
            <color-picker-slider id="alphaInput" class="absbefore absafter checkerboard" .value="${this.alpha}" min="0" max="1" step="0.01" @input="${this._handleAlphaSliderInput}" @mousedown="${() => this._sliderDown = true}" @mouseup="${() => this._sliderDown = false}"></color-picker-slider>
          </div>
          <div id="colorSteel" class="absbefore absafter checkerboard"></div>
        </section>

        <section id="textInput">

          <select .selectedIndex="${this.supportedFormats.indexOf(this.format)}" @input="${this._handleSelectInput}">
            ${this.supportedFormats.map(format => html`
              <option .value="${format}">${format.toUpperCase()}</option>
            `)}
          </select>

          <div ?hidden="${this.format !== 'hsv'}" class="color-input">
            <label data-name="h"><input type="number" .value="${Math.round(this.hsv.h)}" min="0" max="359" step="1" data-scheme="hsv", data-key="h" @input="${this._handleInput}"></label>
            <label data-name="s"><input type="number" .value="${Math.round(this.hsv.s * 100)}" min="0" max="100" step="1" data-scheme="hsv", data-key="s" @input="${this._handleInput}"></label>
            <label data-name="v"><input type="number" .value="${Math.round(this.hsv.v * 100)}" min="0" max="100" step="1" data-scheme="hsv", data-key="v" @input="${this._handleInput}"></label>
          </div>

          <div ?hidden="${this.format !== 'hsl'}" class="color-input">
            <label data-name="h"><input type="number" .value="${Math.round(this.hsl.h)}" min="0" max="359" step="1" data-scheme="hsl", data-key="h" @input="${this._handleInput}"></label>
            <label data-name="s"><input type="number" .value="${Math.round(this.hsl.s * 100)}" min="0" max="100" step="1" data-scheme="hsl", data-key="s" @input="${this._handleInput}"></label>
            <label data-name="l"><input type="number" .value="${Math.round(this.hsl.l * 100)}" min="0" max="100" step="1" data-scheme="hsl", data-key="l" @input="${this._handleInput}"></label>
          </div>

          <div ?hidden="${this.format !== 'rgb'}" class="color-input">
            <label data-name="r"><input type="number" .value="${this.rgb.r}" min="0" max="255" step="1" data-scheme="rgb", data-key="r" @input="${this._handleInput}"></label>
            <label data-name="g"><input type="number" .value="${this.rgb.g}" min="0" max="255" step="1" data-scheme="rgb", data-key="g" @input="${this._handleInput}"></label>
            <label data-name="b"><input type="number" .value="${this.rgb.b}" min="0" max="255" step="1" data-scheme="rgb", data-key="b" @input="${this._handleInput}"></label>
          </div>

          <div ?hidden="${this.format !== 'hex'}" class="color-input">
            <label data-name="#"><input type="text" .value="${this.hex}" data-scheme="hex" maxlength="6" @change="${this._handleInput}"></label>
          </div>

          <div ?hidden="${this.format !== 'hex8'}" class="color-input">
          <label data-name="#"><input type="text" .value="${this.hex8}" data-scheme="hex8" maxlength="8" @change="${this._handleInput}"></label>
          </div>

          <div class="alpha-input" ?hidden="${this.format === 'hex8'}">
            <label data-name="%"><input type="number" .value="${Math.round(this.alpha * 100)}" min="0" max="100" step="1" data-scheme="alpha" @input="${this._handleAlphaInput}"></label>
          </div>
        
        </section>
      </div>
    `;
  }

  _handleInput(e) {
    e.stopPropagation();
    const scheme = e.target.dataset.scheme;
    const key = e.target.dataset.key;
    const value = e.target.value;
    let data = this[scheme];
    if(key) data[key] = Math.round(value);
    else data = value;
    this.value = data;
  }

  _handleAlphaSliderInput(e) {
    e.stopPropagation();
    this.alpha = e.target.value;
  }

  _handleAlphaInput(e) {
    e.stopPropagation();
    this.alpha = e.target.value / 100;
  }

  _handleSelectInput(e) {
    e.stopPropagation();
    this.format = e.target.value;
  }

  _handleMouseup() {
    this._pointerDown = false;
  }

  _handleMousemove(e) {
    if(!this._pointerDown) return;
    const saturation = Math.min(Math.max((e.offsetX / this.$grid.offsetWidth), 0.01), 0.99);
    const value = 1 - Math.min(Math.max((e.offsetY / this.$grid.offsetHeight), 0.01), 0.99);
    if(this.format === 'hsl') this.value = {...this.value.toHsl(), ...{s: saturation}, ...{l: value}};
    else this.value = {...this.value.toHsv(), ...{s: saturation}, ...{v: value}};
  }

  _handleMousedown() {
    this._pointerDown = true;
  }

  _handleGridKeydown(e) {
    const hsl = this.value.toHsl();
    const hsv = this.value.toHsv();

    if(e.key === 'ArrowLeft') return this.value = (this.format === 'hsl') ? {...hsl, ...{s: hsl.s-0.01}} : {...hsv, ...{s: hsv.s-0.01}};
    if(e.key === 'ArrowRight') return this.value = (this.format === 'hsl') ? {...hsl, ...{s: hsl.s+0.01}} : {...hsv, ...{s: hsv.s+0.01}};

    if(e.key === 'ArrowUp') return this.value = (this.format === 'hsl') ? {...hsl, ...{l: hsl.l+0.01}} : {...hsv, ...{v: hsv.v+0.01}};
    if(e.key === 'ArrowDown') return this.value = (this.format === 'hsl') ? {...hsl, ...{l: hsl.l-0.01}} : {...hsv, ...{v: hsv.v-0.01}};

    if(e.key === 'Home') return this.value = (this.format === 'hsl') ? {...hsl, ...{s: hsl.s-0.10}} : {...hsv, ...{s: hsv.s-0.10}};
    if(e.key === 'End') return this.value = (this.format === 'hsl') ? {...hsl, ...{s: hsl.s+0.10}} : {...hsv, ...{s: hsv.s+0.10}};

    if(e.key === 'PageUp') return this.value = (this.format === 'hsl') ? {...hsl, ...{l: hsl.l+0.10}} : {...hsv, ...{v: hsv.v+0.10}};
    if(e.key === 'PageDown') return this.value = (this.format === 'hsl') ? {...hsl, ...{l: hsl.l-0.10}} : {...hsv, ...{v: hsv.v-0.10}};
  }

  _handleGridClick(e) {
    this._pointerDown = true;
    this._handleMousemove(e);
    this._pointerDown = false;
  }

  _valueChanged() {
    this._setGridThumbPosition();
    this._setHighlightColors();
    if(!this.$container) return;
    this.$container.style.setProperty('--value', this.value.toRgbString());
    this.$container.style.setProperty('--alpha-slider-background-0', `${this.value.toHexString()}00`);
    this.$container.style.setProperty('--alpha-slider-background-100', `${this.value.toHexString()}`);

  }

  _formatChanged() {
    this.$grid.style.setProperty('--grid-gradient', this._gridGradient);
    this._setGridThumbPosition();
  }

  _notifyChanges() {
    if(this._pointerDown || this._sliderDown) return this._dispatchValue('input');
    this._dispatchValue('change');
  }

  _dispatchValue(eventName) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail: {value: this.value}
    }));
  }

  _setGridThumbPosition() {
    if(!this.$grid) return;

    const saturation = (this.format === 'hsl') ? this.hsl.s : this.hsv.s;
    const value = (this.format === 'hsl') ? this.hsl.l : this.hsv.v;
    const thumbX = this.$grid.offsetWidth * saturation;
    const thumbY = this.$grid.offsetHeight * (1-value);
    this.$grid.style.setProperty('--grid-offset-x', `${thumbX}px`);
    this.$grid.style.setProperty('--grid-offset-y', `${thumbY}px`);
    this.$grid.style.setProperty('--grid-background', new TinyColor({h: this.value.toHsl().h, s: 100, v: 100}).toRgbString());
  }

  _setHighlightColors() {
    if(!this.$container) return;
    const bgColor = new TinyColor(window.getComputedStyle(this.$container).backgroundColor);
    const method = bgColor.isLight() ? 'darken' : 'brighten';
    this.$container && this.$container.style.setProperty('--bg-color--10', bgColor[method]()[method]().toRgbString());
    this.$container && this.$container.style.setProperty('--bg-color--20', bgColor[method]()[method]().toRgbString());
    this.$container && this.$container.style.setProperty('--bg-color--60', bgColor[method]()[method]()[method]()[method]()[method]()[method]().toRgbString());
  }

  get _thumbStyles() {
    return new ColorPickerSlider()._thumbStyles;
  }

  get $container() {
    return this.shadowRoot.querySelector('#container');
  }

  get $grid() {
    return this.shadowRoot.querySelector('#gridInput');
  }

}

window.customElements.define('color-picker', ColorPicker);