import * as yup from "yup"
import { columnListSchema, parseColumnList } from "./common"
import { FilterSpecification } from "./types"

const schema = yup.object({
  columns: columnListSchema("All"),
  spaces: yup.boolean().default(true).meta({
    helpText:
      "Convert newlines to spaces. If disabled, newlines will be removed.",
  }),
})

export const rmnew: FilterSpecification = {
  type: "rmnew",
  title: "Remove Newlines",
  description:
    "Remove CRLF, CR, and LF from cell contents, optionally converting to spaces.",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns, spaces } = config
    const colset = new Set(parseColumnList(columns))

    const re = /[\n\r\f]/g
    const replacement = spaces ? " " : ""
    const fn = (str: string) => str.replaceAll(re, replacement)

    if (colset.size) {
      return input.map((row) =>
        row.map((str, i) => (colset.has(i) ? fn(str) : str))
      )
    } else {
      return input.map((row) => row.map((str) => fn(str)))
    }
  },
}
