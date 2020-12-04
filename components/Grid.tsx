import React, { useMemo } from "react"
import BaseTable, { AutoResizer, ColumnShape } from "react-base-table"
import { useRecoilValue } from "recoil"
import { outputState } from "../lib/state"

export const Grid = () => {
  const { header, output, numColumns } = useRecoilValue(outputState)
  if (!output) return null

  const columns = useMemo<ColumnShape<any>[]>(() => {
    return new Array(numColumns).fill(0).map((_, i) => ({
      key: i,
      dataGetter: ({ rowData, columnIndex }) => rowData[columnIndex],
      title: header ? header[i] : `Column ${i + 1}`,
      width: 130,
      resizable: true,
    }))
  }, [header, output])

  return (
    <AutoResizer>
      {({ height, width }) => (
        <BaseTable
          fixed
          data={output}
          columns={columns}
          width={width}
          height={height}
          headerHeight={30}
          estimatedRowHeight={30}
        />
      )}
    </AutoResizer>
  )
}
