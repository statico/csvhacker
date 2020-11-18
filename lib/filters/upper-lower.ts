import * as yup from "yup"
import { columnListSchema, parseColumnList } from "./common"
import { FilterSpecification } from "./types"

const schema = yup.object({
  columns: columnListSchema("All"),
})

export const upper: FilterSpecification = {
  type: "upper",
  title: "Uppercase",
  description: "Convert column contents to uppercase",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns } = config
    const colset = new Set(parseColumnList(columns))

    if (colset.size) {
      return input.map((row) =>
        row.map((str, i) => (colset.has(i) ? str.toUpperCase() : str))
      )
    } else {
      return input.map((row) => row.map((str) => str.toUpperCase()))
    }
  },
}

export const lower: FilterSpecification = {
  type: "lower",
  title: "Lowercase",
  description: "Convert column contents to lowercase",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns } = config
    const colset = new Set(parseColumnList(columns))

    if (colset.size) {
      return input.map((row) =>
        row.map((str, i) => (colset.has(i) ? str.toLowerCase() : str))
      )
    } else {
      return input.map((row) => row.map((str) => str.toLowerCase()))
    }
  },
}
