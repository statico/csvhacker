import { custom } from "./custom"
import { edit } from "./edit"
import { exclude, find } from "./find-exclude"
import { head, tail } from "./head-tail"
import { pick } from "./pick"
import { rmnew } from "./rmnew"
import { split } from "./split"
import { trim } from "./trim"
import { FilterInstance, FilterSpecification, Matrix } from "./types"
import { lower, upper } from "./upper-lower"

export const AllFilters: FilterSpecification[] = [
  custom,
  edit,
  exclude,
  find,
  head,
  lower,
  pick,
  rmnew,
  split,
  tail,
  trim,
  upper,
]

AllFilters.sort((a, b) => a.title.localeCompare(b.title))

const FiltersByType: { [key: string]: FilterSpecification } = {}
for (const f of AllFilters) {
  FiltersByType[f.type] = f
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
    const spec = getFilterSpecification(instance.type)
    const defaults = getFilterConfigDefaults(instance.type)
    // const config = { ...instance.config }
    const clone = JSON.parse(JSON.stringify(instance.config)) // Recoil freezes objects
    const item = spec.schema.cast(clone)
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
    if (instance.config.enabled) instance.config.enabled = false // Don't auto-run custom filters
    return instance
  })
}
