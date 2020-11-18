import parseNumericRange from "parse-numeric-range"
import * as yup from "yup"
import { FilterSpecification } from "./types"

const schema = yup.object({
  columns: yup
    .string()
    .nullable()
    .matches(/^[\d,-]*$/)
    .meta({ placeholder: "All" }),
  pattern: yup.string().nullable(),
  replacement: yup.string().nullable(),
  regex: yup
    .boolean()
    .default(false)
    .meta({ title: "RegExp", helpLink: "https://regexr.com/" }),
  caseSensitive: yup.boolean().default(false),
})

export const edit: FilterSpecification = {
  type: "edit",
  title: "Edit",
  description: "Edit the value of a cell",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns, pattern, replacement, regex, caseSensitive } = config

    const colNums = columns
      ? parseNumericRange(columns.trim()).map((n) => n - 1)
      : []

    let fn: (str: string) => string
    if (regex) {
      const re = new RegExp(pattern.trim(), caseSensitive ? "g" : "gi")
      fn = (str: string) => str.replaceAll(re, replacement)
    } else {
      fn = (str: string) => str.replaceAll(pattern, replacement)
    }

    if (colNums.length) {
      const c = new Set(colNums)
      return input.map((row) => row.map((str, i) => (c.has(i) ? fn(str) : str)))
    } else {
      return input.map((row) => row.map(fn))
    }
  },
}
