import Papa from "papaparse"
import { atom, selector } from "recoil"
import { getUrlState, setUrlState } from "./url"

export const inputConfigState = atom<{
  url?: string
  file?: File
  delimiter?: "comma" | "tab"
}>({
  key: "inputConfig",
  default: {},
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      // @ts-ignore
      onSet(({ url }) => {
        const state = { ...getUrlState() }
        if (url) {
          state.url = url
        } else {
          delete state.url
        }
        setUrlState(state)
      })

      const read = () => {
        const { url } = getUrlState()
        if (url) setSelf({ url })
      }
      setTimeout(read, 0) // TODO: Why doesn't read() just work?

      window.addEventListener("hashchange", read)
      return () => {
        window.removeEventListener("hashchange", read)
      }
    },
  ],
})

export const inputState = selector<any[][]>({
  key: "input",
  get: ({ get }) => {
    const { url, file, delimiter } = get(inputConfigState)
    if (!(url || file)) return []
    return new Promise((resolve, reject) => {
      Papa.parse(url || file, {
        delimiter:
          delimiter === "comma" ? "," : delimiter === "tab" ? "\t" : undefined,
        download: true,
        error: reject,
        worker: true,
        complete: (results) => {
          // @ts-ignore
          resolve(results.data)
        },
      })
    })
  },
})

export const filterState = atom<any[]>({
  key: "filters",
  default: [
    {
      type: "head",
      count: 100,
    },
  ],
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      onSet((filters) => {
        setUrlState({ ...getUrlState(), filters })
      })

      const read = () => {
        const { filters } = getUrlState()
        if (filters) setSelf(filters)
      }
      setTimeout(read, 0) // TODO: Why doesn't read() just work?

      window.addEventListener("hashchange", read)
      return () => {
        window.removeEventListener("hashchange", read)
      }
    },
  ],
})

export const outputConfigState = atom<{
  delimiter?: "comma" | "tab"
}>({
  key: "outputConfig",
  default: {},
})

export const outputState = selector<any[][]>({
  key: "output",
  get: ({ get }) => {
    const input = get(inputState)
    if (!input) return null
    const filters = [...get(filterState)]
    let ret = input
    while (filters.length) {
      const filter = filters.shift()
      switch (filter.type) {
        case "head":
          ret = ret.slice(0, filter.count)
          break
        case "tail":
          ret = ret.slice(ret.length - filter.count)
          break
        default:
          throw new Error(`Unknown filter type: ${filter.type}`)
      }
    }
    return ret
  },
})

export const outputStatsState = selector<any>({
  key: "outputStats",
  get: ({ get }) => {
    const output = get(outputState)
    let numColumns = 0
    for (const row of output) {
      if (row.length > numColumns) numColumns = row.length
    }
    return { numRows: output.length, numColumns }
  },
})
