# DM Editor

DM Editor is a block-styled visual editor written in React.

[Online demo](https://demo.dmeditor.io/editor?d=demo)

[Roadmap](https://github.com/orgs/dmeditor/projects/1) , mail [xc](mailto:chen.xcmail@gmail.com) if you want to discuss:).

**_For full documentation please go to [dmeditor.github.io](https://dmeditor.github.io)_**

The idea behind is to have an editor which is easy to develop and style widget within React ecosystem, in the end **together with developer** bring good user experience for page editing.

### Highlights

- Block based, real WYSIWYG(What you see is what you get)
- See immediate change while slide on padding, width, color, margin, etc
- Intractive widgets like tab, accordion
- Get benefits of React ecosystem for creating widget.
- Widgets can be inside widget
- Extend styles of a widget
- Create template from widget

### Screenshots

<img src="https://www.digimaker.com/var/images/w/wzz/upload-2038061186-screen1.png" />

<img src="https://www.digimaker.com/var/images/l/loe/upload-103887251-screen2.png" />

## Installation

See [sample project](https://github.com/dmeditor/dmeditor-sample)

```
npm install dmeditor
```

_Note: to develop widgets, suggest to install `@mui/material` and `@emotion/css` so you get all benefits of mui and emotion css. See sample project for detail._

### Templates

Put below in index.html to use open source templates ([the template repo](https://github.com/dmeditor/templates)):

```
<script src="https://cdn.jsdelivr.net/gh/dmeditor/templates@main/templates.js"></script>
```

### Widget list

[dmeditor-digimaker](https://github.com/digimakergo/dmeditor-digimaker/): - Content widgets(eg. content grid, Gallary) for digimaker CMF
