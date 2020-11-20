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
1. [x] Input options
1. [x] Output options
1. [x] Test with various data sources
1. [x] Debounce setUrlState
1. [x] Filters: find, exclude
1. [x] Filters: pick (columns)
1. [x] Filters: edit
1. [x] Filters: rmnew, trim, upper, lower
1. [x] Filters: split
1. [ ] Filters: sort
1. [ ] Filters: date format
1. [ ] Filters: run javascript (with enable button)
1. [ ] Sticky header row
1. [ ] Debounce input processing
1. [ ] URLs don't paste well in Slack
1. [x] File or URL modal
1. [ ] UI/UX pass
1. [ ] XLSX import
1. [ ] Better grid implementation

### Ideas:

- [ ] Hijack Cmd-F to insert a find filter instead of searching the doc
- [ ] Resizable work area
- [ ] Collapsable sidebar
- [ ] Make raw data viewing smarter?
- [ ] Show spaces in cell values
- [ ] Google Sheets import

## To Fix Later

- Next.js experimental mode
- Experimental `react` and `react-dom` deps
- Recoil.js UNSTABLE usage
- Recoil.js effects requires setTimeout() in initializer
