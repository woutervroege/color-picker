import { Properties } from 'html-element-property-mixins';
import { PropertyChangedHandler, PropertiesChangedHandler, PropertiesChangedCallback } from 'html-element-property-mixins/src/addons';
import { TinyColor } from '@ctrl/tinycolor';
import { render, html } from 'lit-html/lib/shady-render';
import { ColorPickerSlider } from './color-picker-slider.js';
import './color-swatchgroup.js';
import { enableFocusVisible } from './utils/focus-visible-polyfill.js';

/**
 * color-picker is a custom Element powered by @bgins TinyColor library.
 * - Supports hex, rgb(a), rrggbbaa/hex8, hsl(a) and hsv/b(a) color schemes.
 * - Fully keyboard accessible
 * 
 * ### Tested browsers (older / other browsers may work)
 * - Chrome >= 67
 * - Firefox >= 63
 * - Safari >= 10.1
 * - IE11+
 * 
 * [![screenshot.gif](https://i.postimg.cc/T29LHm2m/screenshot.gif)](https://postimg.cc/grx2xxZk)
 * 
 * ```html
 * <color-picker
 *  id="picker"
 *  value="#ff0000"
 *  formats="hex,rgb,hsl,hsv,hex8"
 *  selectedformat="hex"
 * ></color-picker>
 * ```
 * ```javascript
 * picker.addEventlistener('input', (e) => console.info('input', e.detail.value))
 * picker.addEventlistener('change', (e) => console.info('change', e.detail.value))
 * ```
 * 
 * @element color-picker
 * 
 * @fires input
 * @fires change 
 * 
 * @prop {String} value - color value
 * @attr {String} value
 * 
 * @prop {Array} formats - list of visible color schemes
 * @attr {String} formats - comma separated list of listed formats
 * 
 * @prop {String} selectedFormat - selected color scheme
 * @attr {String} selectedformat
 * 
 * @attr {Boolean} dark - Force dark mode when dark-mode is disabled in browser.
 * @attr {Boolean} light - Force light mode when dark-mode is enabled in browser.
 * 
 * @cssprop [--color-picker-background-color] - backround color
 * @cssprop [--color-picker-color] - text color
 * 
 */

class ColorPicker extends PropertiesChangedHandler(PropertiesChangedCallback(PropertyChangedHandler(Properties(HTMLElement)))) {

  static get properties() {
    return {

      value: {
        observe: true,
        DOM: true,
        changedHandler: '_valueChanged'
      },

      formats: {
        observe: true,
        DOM: true,
        fromAttributeConverter: function(oldValue, newValue) {
          return newValue.replace(/\s+/g, '').split(',');
        },
        changedHandler: '_formatsChanged'
      },

      selectedFormat: {
        observe: true,
        DOM: true,
        changedHandler: '_selectedFormatChanged'
      },

      selectedSwatchgroup: {
        observe: true,
        DOM: true,
      },

      _swatches: {
        observe: true
      },

      _swatchGroupLabels: {
        observe: true
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
    if(!this.color) return undefined;
    if(this.selectedFormat === 'hex') return this.color.toHexString();
    if(this.selectedFormat === 'hex8') return this.color.toHex8String();
    if(this.selectedFormat === 'hsl') return this.color.toHslString();
    if(this.selectedFormat === 'hsv') return this.color.toHsvString();
    return this.color.toRgbString();
  }

  set value(val) {
    this['#value'] = new TinyColor(val);
  }

  get color() {
    return this['#value'];
  }

  set formats(val) {
    if(val.constructor.name !== 'Array') return;
    const formats = [];
    for(var i in val) if(this.supportedFormats.indexOf(val[i]) !== -1) formats.push(val[i]);
    this['#formats'] = [...formats];
  }

  get supportedFormats() {
    return ['hex', 'hex8', 'rgb', 'hsv', 'hsl'];
  }

  get selectedFormat() {
    return this['#selectedFormat'];
  }

  set selectedFormat(val) {
    if((this.formats || []).indexOf(val) === -1) return;
    this['#selectedFormat'] = val;
  }

  get hsv() {
    return this.color.toHsv();
  }

  get alpha() {
    return this.color.getAlpha();
  }

  set alpha(alpha) {
    const oldVal = this.color;
    this.color.setAlpha(alpha);
    this.propertyChangedCallback('value', oldVal, this.color);
  }

  get hex() {
    return this.color.toHex();
  }

  get hex8() {
    return this.color.toHex8();
  }

  get rgb() {
    return this.color.toRgb();
  }

  get hsl() {
    return this.color.toHsl();
  }

  get _gridGradient() {
    if(this.selectedFormat === 'hsl') return 'linear-gradient(to bottom, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%), linear-gradient(to right, hsl(0, 0%, 50%) 0%, hsla(0, 0%, 50%, 0) 100%)';
    return 'linear-gradient(rgba(0,0,0,0) 0%, #000 100%), linear-gradient(to left, rgba(255,255,255,0) 0%, #fff 100%)';
  }

  get selectedSwatchgroup() {
    if(this['#selectedSwatchgroup']) return this['#selectedSwatchgroup'];
    if(this._swatchGroupLabels && this._swatchGroupLabels.length > 0) return this._swatchGroupLabels[0];
    return undefined;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    
    this.value = {h: 0, s: 1, v: 1};
    this.selectedFormat = 'rgb';
    this._pointerDown = false;
    this._sliderDown = false;
    this._swatches = [];
    this._swatchGroupLabels = [];
    this.formats = this.supportedFormats;

    window.addEventListener('mouseup', this._handleMouseup.bind(this), false);
    window.addEventListener('mousemove', this._handleMousemove.bind(this), false);
    enableFocusVisible(this._$grid);
    this._valueChanged();
    this.shadowRoot.querySelectorAll('input, select').forEach(item => enableFocusVisible(item));
    this.addEventListener('swatch-clicked', this._handleSwatchClick.bind(this));
  }

  connectedCallback() {
    super.connectedCallback();
    this.selectedFormat = this.color.format;
  }

  /**
   * @private
   */
  propertyChangedCallback(propNames, oldValues, newValues) {
    super.propertyChangedCallback(propNames, oldValues, newValues);
    render(this.template, this.shadowRoot, {eventContext: this, scopeName: this.localName});
  }

  static get propertiesChangedHandlers() {
    return {
      '_notifyChanges': ['value', '_pointerDown', '_sliderDown'],
      '_toggleSwatchGroups': ['selectedSwatchgroup', '_swatchGroupLabels']
    };
  }

  /**
   * @private
   */
  get template() {
    return html`

      <style>

        *, *:before, *:after {
          box-sizing: border-box;
          font-size: 0;
          font-family: var(--color-picker-font-family);
        }

        :host {
          width: 240px;
          display: block;
          --color-picker-background-color: #fff;
          --color-picker-color: #222;
          --color-picker-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          font-family: var(--color-picker-font-family);
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
          width: 100%;
          min-height: 160px;
          outline: none;
          flex: 1;
          position: relative;
        }

        #gridInput .overlay {
          width: 100%;
          top: 0;
          left: 0;
          height: 100%;
          pointer-events: none;
          position: absolute;
        }

        #gridInput .overlay .thumb {
          position: absolute;
          margin: -7px;
          pointer-events: none;
          ${this._thumbStyles}
        }

        #gridInput.focus-visible:focus {
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

        main {
          padding: 8px;
          display: grid;
          grid-gap: 8px;
        }

        #sliderInput {
          display: flex;
        }

        #sliders {
          display: flex;
          flex-direction: column;
          flex: 1;
          margin-right: 8px;
        }

        color-picker-slider {
          position: relative;
        }

        color-picker-slider:nth-child(1) {
          margin-bottom: 8px;
        }

        color-picker-slider:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: inherit;
        }

        #hueInput:after {
          background: linear-gradient(to right, red 0%, #ff0 17%, lime 33%, cyan 50%, blue 66%, #f0f 83%, red 100%);
        }

        #alphaInput:after {
          background: ${this._alphaSliderBackground}
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
          border: 1px solid var(--bg-color--20);
          margin: auto;
          overflow: hidden;
        }

        .checkerboard:before {
          background: linear-gradient(45deg, var(--bg-color--20) 25%, transparent 25%), linear-gradient(-45deg, var(--bg-color--20) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--bg-color--20) 75%), linear-gradient(-45deg, transparent 75%, var(--bg-color--20) 75%);
          background-size: 6px 6px;
          background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
        }

        #colorSteel .inner {
          width: 100%;
          height: 100%;
          position: relative;
          background: var(--color-picker-current-color);
        }

        input, select {
          border: 1px solid transparent;
          outline: none;
        }

        option {
          color: #222;
        }

        input:hover, select:hover, input:focus, select:focus {
          border-color: var(--bg-color--20);
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
          font-family: var(--color-picker-font-family);
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
          display: flex;
          /* align-items: center; */
        }

        select, .color-input, .alpha-input {
          flex: 0;
          padding: 0;
        }

        .color-input label, .alpha-input label {
          position: relative;
          display: block;
        }
        
        .color-input label:after, .alpha-input label:after {
          content: attr(data-name);
          font-size: 10px;
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
          text-align: start;
          text-align-last: start;
          align-self: flex-start;
          margin: 0;
        }

        select::-ms-expand {
          display: none;
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

        #swatches {
          border-top: 1px solid var(--bg-color--20);
        }

        #swatches header {
          padding: 8px 0;
        }

        ::slotted(:not(color-swatchgroup)) {
          display: none;
        }

        ::slotted([hidden]) {
          display: none!important;
        }

        [hidden] {
          display: none!important;
        }
      </style>

      <div id="container">

        <section
          id="gridInput"
          tabindex="0"
          role="slider"
          aria-label="change saturation and ${this.selectedFormat === 'hsl' ? 'light' : 'value'}"
          aria-valuemin="0"
          aria-valuemax="0.99"
          aria-orientation="vertical"
          aria-valuetext="saturation ${this.hsv.s.toFixed(2)} ${this.selectedFormat === 'hsl' ? `light ${this.hsl.l.toFixed(2)}` : `value ${this.hsv.v.toFixed(2)}`}"
          @mousedown="${this._handleMousedown}"
          @keydown="${this._handleGridKeydown}"
          @click="${this._handleGridClick}"
        ><div class="overlay"><div class="thumb"></div></div></section>

        <main>

          <section id="sliderInput">
            <div id="sliders">
              <color-picker-slider tabindex="0" .label="${'change hue'}" id="hueInput" .value="${this.hsv.h}" min="0" max="359" step="1" data-scheme="hsv" data-key="h" @input="${this._handleInput}" @change="${this._handleInput}" @mousedown="${() => this._sliderDown = true}" @mouseup="${() => this._sliderDown = false}"></color-picker-slider>
              <color-picker-slider tabindex="0" .label="${'change alpha'}" id="alphaInput" class="absbefore absafter checkerboard" .value="${this.alpha * 100}" min="0" max="100" step="1" @input="${this._handleAlphaSliderInput}" @change="${this._handleAlphaSliderInput}" @mousedown="${() => this._sliderDown = true}" @mouseup="${() => this._sliderDown = false}"></color-picker-slider>
            </div>
            <div id="colorSteel" class="checkerboard absbefore">
              <div class="inner"></div>
            </div>
          </section>

          <section id="textInput">

            <select aria-label="select color scheme" .selectedIndex="${(this.formats || []).indexOf(this.selectedFormat)}" @change="${this._handleSelectChange}" @input="${e => e.stopPropagation()}">
              ${(this.formats || []).map(format => html`
                <option .value="${format}">${format.toUpperCase()}</option>
              `)}
            </select>

            <div ?hidden="${this.selectedFormat !== 'hsv'}" class="color-input">
              <label data-name="h"><input aria-label="change hue" type="number" .value="${Math.round(this.hsv.h)}" min="0" max="359" step="1" data-scheme="hsv", data-key="h" @input="${this._handleInput}"></label>
              <label data-name="s"><input aria-label="change saturation" type="number" .value="${Math.round(this.hsv.s * 100)}" min="0" max="100" step="1" data-scheme="hsv", data-key="s" @input="${this._handleInput}"></label>
              <label data-name="v"><input aria-label="change value / brightness" type="number" .value="${Math.round(this.hsv.v * 100)}" min="0" max="100" step="1" data-scheme="hsv", data-key="v" @input="${this._handleInput}"></label>
              <label data-name="%"><input aria-label="change alpha" type="number" .value="${Math.round(this.alpha * 100)}" min="0" max="100" step="1" data-scheme="alpha" @input="${this._handleAlphaInput}"></label>
            </div>

            <div ?hidden="${this.selectedFormat !== 'hsl'}" class="color-input">
              <label data-name="h"><input aria-label="change hue" type="number" .value="${Math.round(this.hsl.h)}" min="0" max="359" step="1" data-scheme="hsl", data-key="h" @input="${this._handleInput}"></label>
              <label data-name="s"><input aria-label="change saturation" type="number" .value="${Math.round(this.hsl.s * 100)}" min="0" max="100" step="1" data-scheme="hsl", data-key="s" @input="${this._handleInput}"></label>
              <label data-name="l"><input aria-label="change light" type="number" .value="${Math.round(this.hsl.l * 100)}" min="0" max="100" step="1" data-scheme="hsl", data-key="l" @input="${this._handleInput}"></label>
              <label data-name="%"><input aria-label="change alpha" type="number" .value="${Math.round(this.alpha * 100)}" min="0" max="100" step="1" data-scheme="alpha" @input="${this._handleAlphaInput}"></label>
            </div>

            <div ?hidden="${this.selectedFormat !== 'rgb'}" class="color-input">
              <label data-name="r"><input aria-label="change red" type="number" .value="${this.rgb.r}" min="0" max="255" step="1" data-scheme="rgb", data-key="r" @input="${this._handleInput}"></label>
              <label data-name="g"><input aria-label="change green" type="number" .value="${this.rgb.g}" min="0" max="255" step="1" data-scheme="rgb", data-key="g" @input="${this._handleInput}"></label>
              <label data-name="b"><input aria-label="change blue" type="number" .value="${this.rgb.b}" min="0" max="255" step="1" data-scheme="rgb", data-key="b" @input="${this._handleInput}"></label>
              <label data-name="%"><input aria-label="change alpha" type="number" .value="${Math.round(this.alpha * 100)}" min="0" max="100" step="1" data-scheme="alpha" @input="${this._handleAlphaInput}"></label>
            </div>

            <div ?hidden="${this.selectedFormat !== 'hex'}" class="color-input">
              <label data-name="#"><input aria-label="change hex" type="text" .value="${this.hex}" data-scheme="hex" maxlength="6" @change="${this._handleInput}" @input="${e => e.stopPropagation()}"></label>
              <label data-name="%"><input aria-label="change alpha" type="number" .value="${Math.round(this.alpha * 100)}" min="0" max="100" step="1" data-scheme="alpha" @input="${this._handleAlphaInput}"></label>
            </div>

            <div ?hidden="${this.selectedFormat !== 'hex8'}" class="color-input">
            <label data-name="#"><input aria-label="change hex8" type="text" .value="${this.hex8}" data-scheme="hex8" maxlength="8" @change="${this._handleInput}" @input="${e => e.stopPropagation()}"></label>
            </div>

          </section>

          <section id="swatches" ?hidden="${(this._swatches || []).length === 0 && (this._swatchGroupLabels || []).length === 0}">

            <header>
            <select aria-label="select swatch group" .selectedIndex="${(this._swatchGroupLabels || []).indexOf(this.selectedSwatchgroup)}" @change="${this._handleSelectSwatchChange}" @input="${e => e.stopPropagation()}">
              ${(this._swatchGroupLabels || []).map(label => html`
                <option .value="${label}">${label}</option>
              `)}
            </select>
            </header>
            <slot @slotchange="${this._handleSlotChange}"></slot>
          </section>
        
        </main

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
    this.alpha = e.target.value / 100;
  }

  _handleAlphaInput(e) {
    e.stopPropagation();
    this.alpha = e.target.value / 100;
  }

  _handleSelectChange(e) {
    this.selectedFormat = e.target.value;
  }

  _handleMouseup() {
    this._pointerDown = false;
  }

  _handleMousemove(e) {
    if(!this._pointerDown) return;
    const saturation = Math.min(Math.max((e.offsetX / this._$grid.offsetWidth), 0), 0.99);
    const value = 0.99 - Math.min(Math.max((e.offsetY / this._$grid.offsetHeight), 0), 0.99);
    if(this.selectedFormat === 'hsl') this.value = {...this.color.toHsl(), ...{s: saturation}, ...{l: value}};
    else this.value = {...this.color.toHsv(), ...{s: saturation}, ...{v: value}};
  }

  _handleMousedown() {
    this._pointerDown = true;
  }

  _handleGridKeydown(e) {

    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].indexOf(e.key) === -1) return;
    e.preventDefault();

    const hsl = this.color.toHsl();
    const hsv = this.color.toHsv();

    if(e.key.indexOf())

      if(e.key === 'ArrowLeft') return this.value = (this.selectedFormat === 'hsl') ? {...hsl, ...{s: hsl.s-0.01}} : {...hsv, ...{s: hsv.s-0.01}};
    if(e.key === 'ArrowRight') return this.value = (this.selectedFormat === 'hsl') ? {...hsl, ...{s: hsl.s+0.01}} : {...hsv, ...{s: hsv.s+0.01}};

    if(e.key === 'ArrowUp') return this.value = (this.selectedFormat === 'hsl') ? {...hsl, ...{l: hsl.l+0.01}} : {...hsv, ...{v: hsv.v+0.01}};
    if(e.key === 'ArrowDown') return this.value = (this.selectedFormat === 'hsl') ? {...hsl, ...{l: hsl.l-0.01}} : {...hsv, ...{v: hsv.v-0.01}};

    if(e.key === 'Home') return this.value = (this.selectedFormat === 'hsl') ? {...hsl, ...{s: hsl.s-0.10}} : {...hsv, ...{s: hsv.s-0.10}};
    if(e.key === 'End') return this.value = (this.selectedFormat === 'hsl') ? {...hsl, ...{s: hsl.s+0.10}} : {...hsv, ...{s: hsv.s+0.10}};

    if(e.key === 'PageUp') return this.value = (this.selectedFormat === 'hsl') ? {...hsl, ...{l: hsl.l+0.10}} : {...hsv, ...{v: hsv.v+0.10}};
    if(e.key === 'PageDown') return this.value = (this.selectedFormat === 'hsl') ? {...hsl, ...{l: hsl.l-0.10}} : {...hsv, ...{v: hsv.v-0.10}};
  }

  _handleGridClick(e) {
    this._pointerDown = true;
    this._handleMousemove(e);
    this._pointerDown = false;
  }

  _valueChanged() {
    this._setGridThumbPosition();
    this._setHighlightColors();
    this._setColorSteelColor();
  }

  _setColorSteelColor() {
    if(!this._$container) return;
    this._setCSSProperty('--color-picker-current-color', this.color.toRgbString(), this._$container);
  }

  get _alphaSliderBackground() {
    const color = new TinyColor(this.value);
    return `linear-gradient(to right, ${color.setAlpha(0).toRgbString()} 0%, ${color.setAlpha(1).toRgbString()} 100%);`;
  }

  _formatsChanged() {
    if(this.formats.indexOf(this.selectedFormat) === -1) this.selectedFormat = this.formats[0];
  }

  _selectedFormatChanged() {
    this._setCSSProperty('background', this._gridGradient, this._$grid.querySelector('.overlay'));
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
    if(!this._$grid) return;
    const saturation = (this.selectedFormat === 'hsl') ? this.hsl.s : this.hsv.s;
    const value = (this.selectedFormat === 'hsl') ? this.hsl.l : this.hsv.v;
    const thumbX = this._$grid.offsetWidth * saturation;
    const thumbY = this._$grid.offsetHeight * (1-value);
    this._setCSSProperty('transform', `translate(${thumbX}px, ${thumbY}px)`, this._$grid.querySelector('.thumb'));
    this._setCSSProperty('background', new TinyColor({h: this.color.toHsl().h, s: 100, v: 100}).toRgbString(), this._$grid);
  }

  _setHighlightColors() {
    if(!this._$container) return;
    const bgColor = new TinyColor(window.getComputedStyle(this._$container).backgroundColor);
    const method = bgColor.isLight() ? 'darken' : 'brighten';
    this._setCSSProperty('--bg-color--10', bgColor[method]().toRgbString(), this._$container);
    this._setCSSProperty('--bg-color--20', bgColor[method]()[method]().toRgbString(), this._$container);
    this._setCSSProperty('--bg-color--60', bgColor[method]()[method]()[method]()[method]()[method]()[method]().toRgbString(), this._$container);
  }

  _setCSSProperty(propName, value, selector = this) {
    if(!selector) return;
    selector.style.setProperty(propName, value);
    if(window.ShadyCSS) window.ShadyCSS.styleSubtree(this, {[propName] : value});
  }

  _handleSlotChange(e) {
    const nodes = e.target.assignedNodes();
    const swatchGroupLabels = [];
    for(let i in nodes) if(nodes[i].tagName === 'COLOR-SWATCHGROUP') swatchGroupLabels.push(nodes[i].label);
    this._swatchGroupLabels = [...swatchGroupLabels];
    this._toggleSwatchGroups();
  }

  _handleSwatchClick(e) {
    this.value = e.detail.value;
  }

  _handleSelectSwatchChange(e) {
    this.selectedSwatchgroup = e.target.value;
  }

  _toggleSwatchGroups() {
    this.querySelectorAll('color-swatchgroup').forEach(group => this._toggleSwatchGroup(group));
  }

  _toggleSwatchGroup(group) {
    if(group.label === this.selectedSwatchgroup) return group.removeAttribute('hidden');
    group.setAttribute('hidden', '');
  }

  get _thumbStyles() {
    return new ColorPickerSlider()._thumbStyles;
  }

  get _$container() {
    return this.shadowRoot.querySelector('#container');
  }

  get _$grid() {
    return this.shadowRoot.querySelector('#gridInput');
  }

  get _$colorSteel() {
    return this.shadowRoot.querySelector('#colorSteel');
  }

  get _$swatches() {
    return this.shadowRoot.querySelector('color-swatchgroup');
  }

}

window.customElements.define('color-picker', ColorPicker);