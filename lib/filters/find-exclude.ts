import parseNumericRange from "parse-numeric-range"
import * as yup from "yup"
import { FilterSpecification, Matrix } from "./types"

const schema = yup.object({
  pattern: yup.string().nullable(),
  columns: yup
    .string()
    .nullable()
    .matches(/^[\d,-]*$/)
    .meta({ placeholder: "Any" }),
  regex: yup
    .boolean()
    .default(false)
    .meta({ title: "RegExp", helpLink: "https://regexr.com/" }),
  caseSensitive: yup.boolean().default(false),
})

const makeTransform = (invert: boolean): FilterSpecification["transform"] => (
  input,
  config: yup.InferType<typeof schema>
) => {
  const { columns, pattern, regex, caseSensitive } = config

  const colNums = columns
    ? parseNumericRange(columns.trim()).map((n) => n - 1)
    : []

  // This is repetitive because I hope the VM will optimize this pretty well. (shrug)
  let fn: (string) => boolean
  if (regex) {
    const re = new RegExp(pattern.trim(), caseSensitive ? "" : "i")
    if (invert) {
      fn = (str: string) => !re.test(str)
    } else {
      fn = (str: string) => str && re.test(str)
    }
  } else {
    if (caseSensitive) {
      if (invert) {
        fn = (str: string) => !str?.includes(pattern)
      } else {
        fn = (str: string) => str?.includes(pattern)
      }
    } else {
      const lowerCasePattern = pattern.toLowerCase()
      if (invert) {
        fn = (str: string) => !str?.toLowerCase().includes(lowerCasePattern)
      } else {
        fn = (str: string) => str?.toLowerCase().includes(lowerCasePattern)
      }
    }
  }

  const output: Matrix = []

  if (invert) {
    if (colNums.length) {
      row: for (let i = 0; i < input.length; i++) {
        const row = input[i]
        col: for (let j = 0; j < colNums.length; j++) {
          const k = colNums[j]
          if (k < 0 || k >= row.length) continue col
          if (!fn(row[k])) continue row
        }
        output.push(row)
      }
    } else {
      row: for (let i = 0; i < input.length; i++) {
        const row = input[i]
        col: for (let j = 0; j < row.length; j++) {
          if (!fn(row[j])) continue row
        }
        output.push(row)
      }
    }
  } else {
    if (colNums.length) {
      row: for (let i = 0; i < input.length; i++) {
        const row = input[i]
        col: for (let j = 0; j < colNums.length; j++) {
          const k = colNums[j]
          if (k < 0 || k >= row.length) continue col
          if (fn(row[k])) {
            output.push(row)
            break col
          }
        }
      }
    } else {
      row: for (let i = 0; i < input.length; i++) {
        const row = input[i]
        col: for (let j = 0; j < row.length; j++) {
          if (fn(row[j])) {
            output.push(row)
            break col
          }
        }
      }
    }
  }

  return output
}

export const find: FilterSpecification = {
  type: "find",
  title: "Find",
  description: "Find rows matching a given pattern in all or some columns",
  schema,
  transform: makeTransform(false),
}

export const exclude: FilterSpecification = {
  type: "exclude",
  title: "Exclude",
  description: "Exclude rows matching a given pattern in all or some columns",
  schema,
  transform: makeTransform(true),
}