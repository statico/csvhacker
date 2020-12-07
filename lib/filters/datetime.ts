import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import * as yup from "yup"
import { columnListSchema, parseColumnList } from "./common"
import { FilterSpecification } from "./types"

dayjs.extend(customParseFormat)

const schema = yup.object({
  columns: columnListSchema(""),
  parse: yup.string().nullable().meta({
    placeholder: "Automatic",
    helpLink:
      "https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens",
  }),
  format: yup.string().nullable().default("YYYY-MM-DD").meta({
    helpLink:
      "https://day.js.org/docs/en/display/format#list-of-all-available-formats",
  }),
})

export const datetime: FilterSpecification = {
  type: "datetime",
  title: "Date/Time",
  description: "Format the date and/or time of a cell",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns, parse, format } = config
    const colset = new Set(parseColumnList(columns))
    if (!colset.size) return input
    return input.map((row) =>
      row.map((str, i) =>
        colset.has(i) ? dayjs(str, parse).format(format) : str
      )
    )
  },
}
