import * as yup from "yup"
import { columnListSchema, parseColumnList, regexSchema } from "./common"
import { FilterSpecification } from "./types"

const schema = yup.object({
  columns: columnListSchema("All"),
  pattern: yup.string().nullable(),
  replacement: yup.string().nullable(),
  regex: regexSchema,
  caseSensitive: yup.boolean().default(false),
})

export const edit: FilterSpecification = {
  type: "edit",
  title: "Edit",
  description: "Edit the value of a cell",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns, pattern, replacement, regex, caseSensitive } = config
    const colset = new Set(parseColumnList(columns))

    let fn: (str: string) => string
    if (regex) {
      const re = new RegExp(pattern.trim(), caseSensitive ? "g" : "gi")
      fn = (str: string) => str.replaceAll(re, replacement)
    } else {
      fn = (str: string) => str.replaceAll(pattern, replacement)
    }

    if (colset.size) {
      return input.map((row) =>
        row.map((str, i) => (colset.has(i) ? fn(str) : str))
      )
    } else {
      return input.map((row) => row.map(fn))
    }
  },
}
