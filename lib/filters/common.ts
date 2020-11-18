import parseNumericRange from "parse-numeric-range"
import * as yup from "yup"

export const columnListSchema = (placeholder) =>
  yup
    .string()
    .nullable()
    .matches(/^[\d,-]*$/)
    .meta({ placeholder })

export const regexSchema = yup
  .boolean()
  .default(false)
  .meta({ title: "RegExp", helpLink: "https://regexr.com/" })

export const parseColumnList = (columns: string): number[] =>
  columns ? parseNumericRange(columns.trim()).map((n) => n - 1) : []
