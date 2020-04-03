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
    const oldVal = this.value.getAlpha();
    this.value.setAlpha(alpha);
    this.propertyChangedCallback('alpha', oldVal, this.alpha);
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
    enableFocusVisible(this.shadowRoot.querySelector('#gridInput'));
    this._valueChanged();
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
          display: block;
          font-family: sans-serif;
          background: #222;
          color: white;
        }

        #gridInput {
          position: relative;
          width: 100%;
          height: 180px;
          background: ${new TinyColor({h: this.value.toHsl().h, s: 100, v: 100}).toRgbString()};
          outline: none;
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
          background: ${this._gridGradient};
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
          --color-picker-slider-track-background: linear-gradient(to right, ${this.value.toHexString()}00 0%, ${this.value.toHexString()} 100%);
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
          margin: auto;
          overflow: hidden;
        }

        #colorSteel:before,
        #colorSteel:after {
          content: '';
        }

        .checkerboard:before {
          background: linear-gradient(45deg, #777 25%, transparent 25%), linear-gradient(-45deg, #777 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #777 75%), linear-gradient(-45deg, transparent 75%, #777 75%);
          background-size: ${'6px'} ${'6px'};
          background-position: 0 0, 0 ${'3px'}, ${'3px'} -${'3px'}, -${'3px'} 0px;
        }

        #colorSteel:after {
          background: ${this.value.toRgbString()};
        }

        input, select, select * {
          font-size: 12px;
          border: 0;
          padding: 3px;
          min-width: 44px;
          color: inherit;
          -moz-appearance: textfield;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .flex {
          display: flex;
        }

        .align-center {
          align-items: center;
        }

        .justify-center {
          justify-content: center;
        }

        #textInput {
          padding: 0 8px 8px 8px;
        }

        select, .color-input, .alpha-input {
          /* border: 1px solid #ddd; */
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
          opacity: 0.7;
          display: block;
        }

        select .alpha-input {
          flex: 0;
        }

        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          -ms-appearance: none;
          height: 100%;
          border-radius: 0;
          background: transparent;
          padding: 3px;
          text-align: center;
          text-align-last: center;
          align-self: flex-start;
        }

        .color-input {
          flex: 1;
          display: flex;
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

      <section id="textInput" class="flex align-center jusify-center">

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
          <label data-name="#"><input type="text" .value="${this.hex}" data-scheme="hex" @change="${this._handleInput}"></label>
        </div>

        <div ?hidden="${this.format !== 'hex8'}" class="color-input">
        <label data-name="#"><input type="text" .value="${this.hex8}" data-scheme="hex8" @change="${this._handleInput}"></label>
        </div>

        <div class="alpha-input" ?hidden="${this.format === 'hex8'}">
          <label data-name="%"><input type="number" .value="${Math.round(this.alpha * 100)}" min="0" max="100" step="1" data-scheme="alpha" @input="${this._handleAlphaInput}"></label>
        </div>
      
      </section>
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
    const grid = this.shadowRoot.querySelector('#gridInput');
    const saturation = Math.min(Math.max((e.offsetX / grid.offsetWidth), 0.01), 0.99);
    const value = 1 - Math.min(Math.max((e.offsetY / grid.offsetHeight), 0.01), 0.99);
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
  }

  _formatChanged() {
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
    const grid = this.shadowRoot.querySelector('#gridInput');
    if(!grid) return;

    const saturation = (this.format === 'hsl') ? this.hsl.s : this.hsv.s;
    const value = (this.format === 'hsl') ? this.hsl.l : this.hsv.v;
    const thumbX = grid.offsetWidth * saturation;
    const thumbY = grid.offsetHeight * (1-value);
    grid.style.setProperty('--grid-offset-x', `${thumbX}px`);
    grid.style.setProperty('--grid-offset-y', `${thumbY}px`);
  }

  get _thumbStyles() {
    return new ColorPickerSlider()._thumbStyles;
  }

}

window.customElements.define('color-picker', ColorPicker);