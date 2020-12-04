import * as yup from "yup"
import { FilterSpecification } from "./types"

const schema = yup
  .object({
    rows: yup.number().positive().integer().nullable().default(20).meta({
      placeholder: "All",
      helpText:
        "Enter the number of rows to retain, or leave blank for all rows.",
    }),
  })
  .defined()

export const head: FilterSpecification = {
  type: "head",
  title: "Head",
  description: "Limit to N first rows",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { rows } = config
    return rows != null ? input.slice(0, rows) : input
  },
}

export const tail: FilterSpecification = {
  type: "tail",
  title: "Tail",
  description: "Limit to N last rows",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { rows } = config
    return rows != null ? input.slice(input.length - rows) : input
  },
}
