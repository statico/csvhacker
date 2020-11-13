# csvhacker

## Goals

- static web site
- drag and drop importing of CSV files
- fast and efficient viewing of large (~80MB) CSV files
- cyberchef style UI for filters, all client side
- xlsx import
- csvfix utils
- csv to long format
- csv diff util
- save files to drive using JS API

## Roadmap

1. [x] Base project with Tailwind, Next.js
1. [x] Auto-deploy to csvhacker.statico.io
1. [x] Load CSV data from URL
1. [x] Load CSV data from file quickly and responsively
1. [x] Filter basics: toolbox & drag and drop
1. [x] Serialize filters to URL
1. [x] Virtualized and fast table rendering
1. [x] Drag & drop
1. [x] Configurable filters - head, tail
1. [x] Save to CSV
1. [x] Save to XLSX
1. [ ] Filters: find, exclude
1. [ ] Filters: edit
1. [ ] Filters: pick (columns)
1. [ ] Filters: rmnew, trim, upper, lower
1. [ ] Filters: split (on character), split (on fixed size)
1. [ ] Filters: sort
1. [ ] Filters: date format
1. [ ] Input options
1. [ ] Resizable work area
1. [ ] Collapsable sidebar
1. [ ] Stats at the bottom?
1. [ ] Raw data tab
1. [ ] Test with various data sources
1. [ ] Hijack Cmd-F to insert a find filter instead of searching the doc
1. [ ] UI/UX pass

## To Fix Later

- Next.js experimental mode
- Experimental `react` and `react-dom` deps
- Recoil.js UNSTABLE usage
- Recoil.js effects requires setTimeout() in initializer
