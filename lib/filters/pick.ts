import * as yup from "yup"
import { columnListSchema, parseColumnList } from "./common"
import { FilterSpecification } from "./types"

const schema = yup.object({
  columns: columnListSchema("All"),
})

export const pick: FilterSpecification = {
  type: "pick",
  title: "Pick",
  description: "Pick or reorder columns in the output",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns } = config

    const colnums = parseColumnList(columns)
    const n = colnums.length
    if (n === 0) return input

    return input.map((row) => {
      const newRow = new Array(n)
      for (let i = 0; i < n; i++) {
        newRow[i] = row[colnums[i]]
      }
      return newRow
    })
  },
}
