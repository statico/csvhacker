import * as yup from "yup"
import { FilterSpecification } from "./types"

const makeFunction = (body: string) =>
  new Function(`
    let row = arguments[0];
    let index = arguments[1];
    let output = arguments[2];
    let state = arguments[3];
    ${body}
  `)

const placeholder = `
state.count = state.count || 0
state.count += index
row[0] = JSON.stringify(state)
output.push(row)
`.trim()

const schema = yup
  .object({
    enabled: yup
      .boolean()
      .default(false)
      .test("is-enabled", "Filter must be enabled", (val) => val === true),
    code: yup
      .string()
      .nullable()
      .default(placeholder)
      .meta({ textarea: true, placeholder })
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

export const mapreduce: FilterSpecification = {
  type: "mapreduce",
  title: "MapReduce",
  description: "Write JavaScript code to filter or aggregate rows",
  schema,
  transform(input, config: yup.InferType<typeof schema>) {
    const { code, enabled } = config
    if (!enabled) return input

    const state: any = {}
    const output: any[] = []
    const fn = makeFunction(code)

    for (let i = 0; i < input.length; i++) {
      fn(input[i].slice(0), i, output, state)
    }

    return output
  },
}
