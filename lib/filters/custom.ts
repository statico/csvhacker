import * as yup from "yup"
import { FilterSpecification } from "./types"

const makeFunction = (body: string) =>
  new Function(`var row = arguments[0];${body}`)

const schema = yup
  .object({
    enabled: yup
      .boolean()
      .default(false)
      .test("is-enabled", "Filter must be enabled", (val) => val === true),
    code: yup
      .string()
      .nullable()
      .meta({
        textarea: true,
        placeholder:
          "// return row.map(x => x.toUpperCase())\n// return false to skip the row\n// return true to keep the input row",
      })
      .test("is-valid-function", "Must be valid JavaScript", (value) => {
        try {
          makeFunction(value)
          return true
        } catch (err) {
          console.warn(err)
          return false
        }
      }),
  })
  .defined()

export const custom: FilterSpecification = {
  type: "custom",
  title: "Custom",
  description: "Write custom JavaScript code to filter a row",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { code, enabled } = config
    if (!enabled) return input
    const fn = makeFunction(code)
    const output = []
    for (let i = 0; i < input.length; i++) {
      const result = fn(input[i])
      if (result === false) {
        continue
      } else if (Array.isArray(result)) {
        output.push(result)
      } else {
        output.push(input[i])
      }
    }
    return output
  },
}
