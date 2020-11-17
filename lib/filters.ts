export const AllFilters = [
  {
    type: "head",
    name: "Head",
    description: "Limit to N first rows",
    defaultConfig: {
      rows: 100,
    },
    transform(input: Matrix, config): Matrix {
      return input.slice(0, config.rows)
    },
  },
  {
    type: "tail",
    name: "Tail",
    description: "Limit to N last rows",
    defaultConfig: {
      rows: 100,
    },
    transform(input: Matrix, config): Matrix {
      return input.slice(0, config.rows)
    },
  },
]

export const FiltersByType = {}
for (const f of AllFilters) {
  FiltersByType[f.type] = f
}

export interface FilterInstance {
  type: string
  config: any
}

export const createFilterInstance = (type: string): FilterInstance => {
  return { type, config: { ...FiltersByType[type].defaultConfig } }
}

export const applyFilterInstance = (
  instance: FilterInstance,
  input: Matrix
): Matrix => {
  const filter = FiltersByType[instance.type]
  return filter.transform(input, instance.config)
}

export const serializeFiltersInstances = (instances: FilterInstance[]): any => {
  instances = Array.from(instances).slice() // HACK: Instances is not an interable?
  return instances.map((instance) => {
    const spec = FiltersByType[instance.type]
    if (!spec) throw new Error(`Unknown filter type: ${instance.type}`)

    const defaults = spec.defaultConfig
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
