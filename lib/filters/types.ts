import * as yup from "yup"

export type Matrix = any[][]

export interface FilterSpecification {
  type: string
  title: string
  description: string
  schema: yup.Schema<any>
  transform: (input: Matrix, config: any) => Matrix
}

export interface FilterInstance {
  type: string
  config: any
}
