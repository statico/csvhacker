import Papa from "papaparse"
import { atom, selector } from "recoil"
import {
  applyFilterInstance,
  createFilterInstance,
  deserializeFilterInstances,
  serializeFiltersInstances,
} from "./filters"
import { FilterInstance, Matrix } from "./filters/types"
import { getUrlState, setUrlState } from "./url"

interface InputConfigState {
  url?: string
  file?: File
  delimiter?: "comma" | "tab"
}

export const inputConfigState = atom<InputConfigState>({
  key: "inputConfig",
  default: {},
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      // @ts-ignore
      onSet(({ url }) => {
        setUrlState({ ...getUrlState(), url })
      })

      const read = () => {
        const { url } = getUrlState()
        if (url) setSelf({ url })
      }
      setTimeout(read, 0) // HACK: Why doesn't read() just work?

      window.addEventListener("hashchange", read)
      return () => {
        window.removeEventListener("hashchange", read)
      }
    },
  ],
})

export const inputState = selector<Matrix>({
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

export const filterState = atom<FilterInstance[]>({
  key: "filters",
  default: [createFilterInstance("find")],
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      onSet((instances) => {
        if (!Array.isArray(instances)) return
        setUrlState({
          ...getUrlState(),
          filters: serializeFiltersInstances(instances),
        })
      })

      const read = () => {
        const { filters: instances } = getUrlState()
        if (instances) setSelf(deserializeFilterInstances(instances))
      }
      setTimeout(read, 0) // HACK: Why doesn't read() just work?

      window.addEventListener("hashchange", read)
      return () => {
        window.removeEventListener("hashchange", read)
      }
    },
  ],
})

interface OutputConfigState {
  delimiter?: "comma" | "tab"
}

export const outputConfigState = atom<OutputConfigState>({
  key: "outputConfig",
  default: {},
})

interface OutputState {
  output: Matrix
  error?: string
  errorIndex?: number
  numRows: number
  numColumns: number
}

export const outputState = selector<OutputState>({
  key: "output",
  get: ({ get }) => {
    const input = get(inputState)
    if (!input) return null
    const instances = [...get(filterState)]

    let output = input
    let error = null
    let errorIndex = 0
    try {
      while (instances.length) {
        const instance = instances.shift()
        output = applyFilterInstance(instance, output)
        errorIndex++
      }
    } catch (err) {
      console.warn(err)
      output = input
      error = String(err)
    }

    let numRows = output.length
    let numColumns = 0
    for (const row of output) {
      if (row.length > numColumns) numColumns = row.length
    }
    return { output, numRows, numColumns, error, errorIndex }
  },
})
