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
  preserveHeader?: boolean // Default is true
  delimiter?: "comma" | "tab" // Deafult is auto
}

export const inputConfigState = atom<InputConfigState>({
  key: "inputConfig",
  default: {
    preserveHeader: true,
  },
  effects_UNSTABLE: [
    // Note: Lots of tricks here to make sure we don't unnecessarily save
    // defaults to the URL.
    ({ setSelf, onSet }) => {
      // @ts-ignore
      onSet(({ url, preserveHeader }) => {
        const newState = { ...getUrlState, url, preserveHeader }
        for (const key of Object.keys(newState)) {
          if (Array.isArray(newState[key]) && newState[key].length == 0) {
            delete newState[key]
          } else if (key === "preserveHeader" && newState[key] !== false) {
            delete newState[key]
          }
        }
        setUrlState(newState)
      })

      const read = () => {
        const { url, preserveHeader, delimiter } = getUrlState()
        const newState = { url, preserveHeader, delimiter }
        if (newState.preserveHeader !== false) newState.preserveHeader = true
        setSelf(newState)
      }
      setTimeout(read, 0) // HACK: Why doesn't read() just work?

      window.addEventListener("hashchange", read)
      return () => {
        window.removeEventListener("hashchange", read)
      }
    },
  ],
})

interface InputState {
  input: Matrix
  error?: string
}

export const inputState = selector<InputState>({
  key: "input",
  get: ({ get }) => {
    const { url, file, delimiter } = get(inputConfigState)
    if (!(url || file)) return { input: [] }
    return new Promise((resolve, reject) => {
      Papa.parse(url || file, {
        delimiter:
          delimiter === "comma" ? "," : delimiter === "tab" ? "\t" : undefined,
        download: true,
        error: (err) => {
          resolve({ input: [], error: String(err) })
        },
        worker: true,
        complete: (results: any) => {
          if (!results) return
          const { data } = results

          // papaparse seems to put a single-cell row of `[""]` at the end of the results.
          if (
            data.length > 1 &&
            data[data.length - 1].length === 1 &&
            data[data.length - 1][0] === ""
          ) {
            data = data.slice(0, data.length - 1)
          }
          resolve({ input: data })
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
  header?: string[]
  output: Matrix
  error?: string
  errorIndex?: number
  numRows: number
  numColumns: number
}

export const outputState = selector<OutputState>({
  key: "output",
  get: ({ get }) => {
    const { preserveHeader } = get(inputConfigState)

    const { input, error: inputError } = get(inputState)
    if (!input) return null
    if (inputError) {
      return { output: [], numRows: 0, numColumns: 0, error: inputError }
    }

    const instances = [...get(filterState)]

    let header, output
    if (preserveHeader) {
      header = input[0]
      output = input.slice(1)
    } else {
      header = null
      output = input
    }

    let error = null
    let errorIndex = 0
    try {
      while (instances.length) {
        const instance = instances.shift()
        output = applyFilterInstance(instance, output)
        errorIndex++
      }
    } catch (err) {
      error = String(err)
      if (preserveHeader) {
        header = input[0]
        output = input.slice(1)
      } else {
        header = null
        output = input
      }
    }

    let numRows = output.length
    let numColumns = 0
    for (const row of output) {
      if (row.length > numColumns) numColumns = row.length
    }
    return { header, output, numRows, numColumns, error, errorIndex }
  },
})
