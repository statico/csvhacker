import classNames from "classnames"
import AutoSizer from "react-virtualized-auto-sizer"
import { useRecoilValue } from "recoil"
import { outputState } from "../lib/state"
import React, { useMemo } from "react"
import BaseTable, { AutoResizer, ColumnShape } from "react-base-table"

export const Grid = () => {
  const { header, output, numColumns } = useRecoilValue(outputState)
  if (!output) return null

  const columns = useMemo<ColumnShape<any>[]>(() => {
    return new Array(numColumns).fill(0).map((_, i) => ({
      key: i,
      dataGetter: ({ rowData, columnIndex }) => rowData[columnIndex],
      title: header ? header[i] : `Column ${i + 1}`,
      width: 150,
    }))
  }, [header, output])

  return (
    <AutoResizer>
      {({ height, width }) => (
        <BaseTable
          data={output}
          columns={columns}
          width={width}
          height={height}
          estimatedRowHeight={30}
        />
      )}
    </AutoResizer>
  )
}
