import * as yup from "yup"

const HeadFilterSchema = yup
  .object({
    rows: yup
      .number()
      .positive()
      .integer()
      .nullable()
      .meta({ title: "Rows", placeholder: "All" }),
  })
  .defined()

const TailFilterSchema = yup
  .object({
    rows: yup
      .number()
      .positive()
      .integer()
      .nullable()
      .meta({ title: "Rows", placeholder: "All" }),
  })
  .defined()

export interface FilterSpecification {
  type: string
  title: string
  description: string
  schema: yup.Schema<any>
  transform: (input: Matrix, config: any) => Matrix
}

export const AllFilters: FilterSpecification[] = [
  {
    type: "head",
    title: "Head",
    description: "Limit to N first rows",
    schema: HeadFilterSchema,
    transform(
      input: Matrix,
      config: yup.InferType<typeof HeadFilterSchema>
    ): Matrix {
      const { rows } = config
      return rows != null ? input.slice(0, rows) : input
    },
  },

  {
    type: "tail",
    title: "Tail",
    description: "Limit to N last rows",
    schema: TailFilterSchema,
    transform(
      input: Matrix,
      config: yup.InferType<typeof TailFilterSchema>
    ): Matrix {
      const { rows } = config
      return rows != null ? input.slice(input.length - rows) : input
    },
  },
]

export const FiltersByType: { [key: string]: FilterSpecification } = {}
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
  instances = Array.from(instances).slice() // HACK: Instances is not an interable?
  return instances.map((instance) => {
    const defaults = getFilterConfigDefaults(instance.type)
    // const config = { ...instance.config }
    const item = JSON.parse(JSON.stringify(instance.config)) // HACK: config is not iterable?
    Object.keys(item).forEach((key) => {
      if (item[key] === defaults[key]) delete item[key]
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
    instance.config = { ...instance.config, config: item }
    return instance
  })
}
