import { Record, Number, Runtype, Static } from "runtypes"

export interface Filter {
  key: string
  name: string
  description: string
  configType: Runtype
  default: any
  transform: (matrix: Matrix, config: any) => Matrix
}

export const HeadConfig = Record({
  count: Number,
})

export const TailConfig = Record({
  count: Number,
})

export const Filters: Filter[] = [
  {
    key: "head",
    name: "Head",
    description: "Limit to N first rows",
    configType: HeadConfig,
    default: {
      count: 100,
    },
    transform: (input, config: Static<typeof HeadConfig>) => {
      return input.slice(0, config.count)
    },
  },

  {
    key: "tail",
    name: "Tail",
    description: "Limit to N last rows",
    configType: TailConfig,
    default: {
      count: 100,
    },
    transform: (input, config: Static<typeof TailConfig>) => {
      return input.slice(input.length - config.count)
    },
  },
]
