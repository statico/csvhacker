import * as yup from "yup"
import parseNumericRange from "parse-numeric-range"

export type Matrix = any[][]

// ------------------------------------------------------------------------------
// CONFIGURATION SCHEMAS
// ------------------------------------------------------------------------------

const HeadTailFilterSchema = yup
  .object({
    rows: yup.number().positive().integer().nullable().meta({
      placeholder: "All",
      helpText:
        "Enter the number of rows to retain, or leave blank for all rows.",
    }),
  })
  .defined()

const FindExcludeFilterSchema = yup.object({
  pattern: yup.string().nullable(),
  columns: yup
    .string()
    .nullable()
    .matches(/^[\d,-]*$/)
    .meta({ placeholder: "Any" }),
  regex: yup
    .boolean()
    .default(false)
    .meta({ title: "RegExp", helpLink: "https://regexr.com/" }),
  caseSensitive: yup.boolean().default(false),
})

// ------------------------------------------------------------------------------
// FILTER SPECIFICATIONS
// ------------------------------------------------------------------------------

export interface FilterSpecification {
  type: string
  title: string
  description: string
  schema: yup.Schema<any>
  transform: (input: Matrix, config: any) => Matrix
}

const makeFindExcludeTransform = (invert: boolean) => (
  input: Matrix,
  config: yup.InferType<typeof FindExcludeFilterSchema>
): Matrix => {
  const { columns, pattern, regex, caseSensitive } = config

  const colNums = columns
    ? parseNumericRange(columns.trim()).map((n) => n - 1)
    : []

  // This is repetitive because I hope the VM will optimize this pretty well. (shrug)
  let fn: (string) => boolean
  if (regex) {
    const re = new RegExp(pattern.trim(), caseSensitive ? "" : "i")
    if (invert) {
      fn = (str: string) => !re.test(str)
    } else {
      fn = (str: string) => str && re.test(str)
    }
  } else {
    if (caseSensitive) {
      if (invert) {
        fn = (str: string) => !str?.includes(pattern)
      } else {
        fn = (str: string) => str?.includes(pattern)
      }
    } else {
      const lowerCasePattern = pattern.toLowerCase()
      if (invert) {
        fn = (str: string) => !str?.toLowerCase().includes(lowerCasePattern)
      } else {
        fn = (str: string) => str?.toLowerCase().includes(lowerCasePattern)
      }
    }
  }

  const output: Matrix = []

  if (invert) {
    if (colNums.length) {
      row: for (let i = 0; i < input.length; i++) {
        const row = input[i]
        col: for (let j = 0; j < colNums.length; j++) {
          const k = colNums[j]
          if (k < 0 || k >= row.length) continue col
          if (!fn(row[k])) continue row
        }
        output.push(row)
      }
    } else {
      row: for (let i = 0; i < input.length; i++) {
        const row = input[i]
        col: for (let j = 0; j < row.length; j++) {
          if (!fn(row[j])) continue row
        }
        output.push(row)
      }
    }
  } else {
    if (colNums.length) {
      row: for (let i = 0; i < input.length; i++) {
        const row = input[i]
        col: for (let j = 0; j < colNums.length; j++) {
          const k = colNums[j]
          if (k < 0 || k >= row.length) continue col
          if (fn(row[k])) {
            output.push(row)
            break col
          }
        }
      }
    } else {
      row: for (let i = 0; i < input.length; i++) {
        const row = input[i]
        col: for (let j = 0; j < row.length; j++) {
          if (fn(row[j])) {
            output.push(row)
            break col
          }
        }
      }
    }
  }

  return output
}

export const AllFilters: FilterSpecification[] = [
  {
    type: "head",
    title: "Head",
    description: "Limit to N first rows",
    schema: HeadTailFilterSchema,
    transform(
      input: Matrix,
      config: yup.InferType<typeof HeadTailFilterSchema>
    ): Matrix {
      const { rows } = config
      return rows != null ? input.slice(0, rows) : input
    },
  },

  {
    type: "tail",
    title: "Tail",
    description: "Limit to N last rows",
    schema: HeadTailFilterSchema,
    transform(
      input: Matrix,
      config: yup.InferType<typeof HeadTailFilterSchema>
    ): Matrix {
      const { rows } = config
      return rows != null ? input.slice(input.length - rows) : input
    },
  },

  {
    type: "find",
    title: "Find",
    description: "Find rows matching a given pattern in all or some columns",
    schema: FindExcludeFilterSchema,
    transform: makeFindExcludeTransform(false),
  },

  {
    type: "exclude",
    title: "Exclude",
    description: "Exclude rows matching a given pattern in all or some columns",
    schema: FindExcludeFilterSchema,
    transform: makeFindExcludeTransform(true),
  },
]

// ------------------------------------------------------------------------------
// HELPER METHODS
// ------------------------------------------------------------------------------

const FiltersByType: { [key: string]: FilterSpecification } = {}
for (const f of AllFilters) {
  FiltersByType[f.type] = f
}

export interface FilterInstance {
  type: string
  config: any
}

export const getFilterSpecification = (type: string): FilterSpecification => {
  const spec = FiltersByType[type]
  if (!spec) throw new Error(`Unknown filter type: ${type}`)
  return spec
}

export const getFilterConfigDefaults = (type: string): any => {
  const spec = getFilterSpecification(type)
  return spec.schema.cast({})
}

export const createFilterInstance = (type: string): FilterInstance => {
  const defaults = getFilterConfigDefaults(type)
  return { type, config: { ...defaults } }
}

export const checkFilterInstanceConfig = (instance: FilterInstance) => {
  const spec = getFilterSpecification(instance.type)
  spec.schema.validateSync(instance.config)
}

export const applyFilterInstance = (
  instance: FilterInstance,
  input: Matrix
): Matrix => {
  const spec = getFilterSpecification(instance.type)
  checkFilterInstanceConfig(instance)
  return spec.transform(input, instance.config)
}

export const serializeFiltersInstances = (instances: FilterInstance[]): any => {
  instances = Array.from(instances).slice() // HACK: Recoil.js - Instances is not an interable?
  return instances.map((instance) => {
    const defaults = getFilterConfigDefaults(instance.type)
    // const config = { ...instance.config }
    const item = JSON.parse(JSON.stringify(instance.config)) // HACK: Recoil.js - config is not iterable?
    Object.keys(item).forEach((key) => {
      if (item[key] == null || item[key] === defaults[key]) delete item[key]
    })
    item.type = instance.type
    return item
  })
}

export const deserializeFilterInstances = (items: any): FilterInstance[] => {
  if (!Array.isArray(items)) throw new Error(`Array expected`)
  return items.map((item) => {
    const instance = createFilterInstance(item.type)
    delete item.type
    instance.config = { ...instance.config, ...item }
    return instance
  })
}
