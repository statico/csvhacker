import parseNumericRange from "parse-numeric-range"
import * as yup from "yup"
import { FilterSpecification } from "./types"

const schema = yup.object({
  columns: yup
    .string()
    .nullable()
    .matches(/^[\d,-]*$/)
    .meta({ placeholder: "All" }),
})

export const pick: FilterSpecification = {
  type: "pick",
  title: "Pick",
  description: "Pick or reorder columns in the output",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns } = config

    const colNums = columns
      ? parseNumericRange(columns.trim()).map((n) => n - 1)
      : []
    const n = colNums.length

    if (n === 0) return input

    return input.map((row) => {
      const newRow = new Array(n)
      for (let i = 0; i < n; i++) {
        newRow[i] = row[colNums[i]]
      }
      return newRow
    })
  },
}
