# color-picker

color-picker is a custom Element powered by @bgins TinyColor library.
- Supports hex, rgb(a), rrggbbaa/hex8, hsl(a) and hsv/b(a) color schemes.
- Fully keyboard accessible

![screenshot](https://raw.github.com/woutervroege/color-picker-element/master/screenshot.gif)

```html
<color-picker
  id="picker"
  value="#ff0000"
  formats="hex,rgb,hsl,hsv,hex8"
  selectedformat="hex"
></color-picker>
```
```javascript
picker.addEventlistener('input', (e) => console.info('input', e.detail.value))
picker.addEventlistener('change', (e) => console.info('change', e.detail.value))
```

**Mixins:** PropertiesChangedHandler, PropertiesChangedCallback, PropertyChangedHandler, Properties

## Attributes

| Attribute        | Type      | Description                                      |
|------------------|-----------|--------------------------------------------------|
| `dark`           | `Boolean` | Force dark mode when dark-mode is disabled in browser. |
| `light`          | `Boolean` | Force light mode when dark-mode is enabled in browser. |
| `selectedformat` | `String`  |                                                  |

## Properties

| Property           | Attribute        | Modifiers | Type       | Default                          | Description                   |
|--------------------|------------------|-----------|------------|----------------------------------|-------------------------------|
| `alpha`            |                  |           |            |                                  |                               |
| `color`            |                  | readonly  |            |                                  |                               |
| `formats`          | `formats`        |           | `Array`    | ["hex","hex8","rgb","hsv","hsl"] | list of visible color schemes |
| `hex`              |                  | readonly  |            |                                  |                               |
| `hex8`             |                  | readonly  |            |                                  |                               |
| `hsl`              |                  | readonly  |            |                                  |                               |
| `hsv`              |                  | readonly  |            |                                  |                               |
| `rgb`              |                  | readonly  |            |                                  |                               |
| `selectedFormat`   | `selectedFormat` |           | `String`   | "rgb"                            | selected color scheme         |
| `supportedFormats` |                  | readonly  | `string[]` |                                  |                               |
| `value`            | `value`          |           | `String`   | {"h":0,"s":1,"v":1}              | color value                   |

## Events

| Event    |
|----------|
| `change` |
| `input`  |

## CSS Custom Properties

| Property                          | Description     |
|-----------------------------------|-----------------|
| `--color-picker-background-color` | backround color |
| `--color-picker-color`            | text color      |
