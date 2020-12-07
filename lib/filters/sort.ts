import * as yup from "yup"
import { FilterSpecification } from "./types"

const schema = yup.object({
  column: yup.number().integer().nullable(),
  ascending: yup.boolean().default(true),
  numeric: yup.boolean().default(false),
})

export const sort: FilterSpecification = {
  type: "sort",
  title: "Sort",
  description: "Sort the sheet",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { column: i, ascending, numeric } = config
    if (i == null) return input

    const output = [...input]
    if (numeric) {
      if (ascending) {
        output.sort((a, b) => Number(a[i]) - Number(b[i]))
      } else {
        output.sort((a, b) => Number(b[i]) - Number(a[i]))
      }
    } else {
      if (ascending) {
        output.sort((a, b) =>
          a[i] == null ? -1 : b[i] == null ? 1 : a[i].localeCompare(b[i])
        )
      } else {
        output.sort((a, b) =>
          a[i] == null ? 1 : b[i] == null ? -1 : b[i].localeCompare(a[i])
        )
      }
    }
    return output
  },
}
