import classNames from "classnames"
import AutoSizer from "react-virtualized-auto-sizer"
import { VariableSizeGrid } from "react-window"
import { useRecoilValue } from "recoil"
import { outputState } from "../lib/state"

export const Grid = () => {
  const { header, output, numRows, numColumns } = useRecoilValue(outputState)
  if (!output) return null

  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div
      style={style}
      className={classNames(
        "border-t border-l p-1 text-sm truncate",
        rowIndex === numRows - 1 && "border-b",
        columnIndex === numColumns - 1 && "border-r",
        header && rowIndex === 0 && "fixed top-0 left-0 font-bold"
      )}
    >
      {header
        ? rowIndex === 0
          ? header[columnIndex]
          : output[rowIndex - 1][columnIndex]
        : output[rowIndex][columnIndex]}
    </div>
  )

  return (
    <AutoSizer defaultHeight={300} defaultWidth={500}>
      {({ height, width }) => (
        <VariableSizeGrid
          width={width}
          height={height}
          rowCount={header ? numRows + 1 : numRows}
          columnCount={numColumns}
          estimatedRowHeight={30}
          estimatedColumnWidth={130}
          rowHeight={() => 30}
          columnWidth={() => 150}
        >
          {Cell}
        </VariableSizeGrid>
      )}
    </AutoSizer>
  )
}
