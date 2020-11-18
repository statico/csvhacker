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

export const trim: FilterSpecification = {
  type: "trim",
  title: "Trim Whitespace",
  description: "Trim whitespace from the beginning and end of cell contents",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns } = config

    const colNums = columns
      ? parseNumericRange(columns.trim()).map((n) => n - 1)
      : []

    if (colNums.length) {
      const c = new Set(colNums)
      return input.map((row) =>
        row.map((str, i) => (c.has(i) ? str.trim() : str))
      )
    } else {
      return input.map((row) => row.map((str) => str.trim()))
    }
  },
}
