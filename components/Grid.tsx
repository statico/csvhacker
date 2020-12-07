import React, { useMemo } from "react"
import BaseTable, { AutoResizer, ColumnShape } from "react-base-table"
import { useRecoilValue } from "recoil"
import { outputState } from "../lib/state"
import PropTypes from "prop-types"

// Monkey patch react-base-table to accept arrays as data, not just objects.
import TableRow from "react-base-table/es/TableRow"
TableRow.propTypes.rowData = PropTypes.array
import TableCell from "react-base-table/es/TableCell"
TableCell.propTypes.rowData = PropTypes.array
import GridTable from "react-base-table/es/GridTable"
GridTable.prototype._itemKey = ({ rowIndex }) => String(rowIndex)

export const Grid = () => {
  const { header, output, numColumns, error } = useRecoilValue(outputState)
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="max-w-xl p-4 m-4 border border-red-600 text-red-600 text-center">
          {error}
          <br />
          <br />
          See console for further details.
        </div>
      </div>
    )
  } else {
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
            rowHeight={30}
          />
        )}
      </AutoResizer>
    )
  }
}
