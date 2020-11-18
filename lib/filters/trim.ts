import * as yup from "yup"
import { columnListSchema, parseColumnList } from "./common"
import { FilterSpecification } from "./types"

const schema = yup.object({
  columns: columnListSchema("All"),
})

export const trim: FilterSpecification = {
  type: "trim",
  title: "Trim Whitespace",
  description: "Trim whitespace from the beginning and end of cell contents",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { columns } = config
    const colset = new Set(parseColumnList(columns))

    if (colset.size) {
      return input.map((row) =>
        row.map((str, i) => (colset.has(i) ? str.trim() : str))
      )
    } else {
      return input.map((row) => row.map((str) => str.trim()))
    }
  },
}
