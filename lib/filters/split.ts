import * as yup from "yup"
import { columnListSchema, parseColumnList, regexSchema } from "./common"
import { FilterSpecification } from "./types"

const schema = yup
  .object({
    columns: columnListSchema("").required(),
    pattern: yup.string().required(),
    regex: regexSchema,
    limit: yup.number().positive().integer().nullable(),
  })
  .defined()

export const split: FilterSpecification = {
  type: "split",
  title: "Split",
  description: "Split one or more columns on something.",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns, pattern, limit, regex } = config
    const splitter = regex ? new RegExp(pattern, "g") : pattern
    const colset = new Set(parseColumnList(columns))
    return input.map((row) =>
      row
        .map((cell, i) => (colset.has(i) ? cell.split(splitter, limit) : cell))
        .flat()
    )
  },
}
