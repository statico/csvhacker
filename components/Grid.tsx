import AutoSizer from "react-virtualized-auto-sizer"
import { VariableSizeGrid } from "react-window"
import { useRecoilValue } from "recoil"
import { outputState, outputStatsState } from "../lib/state"

export const Grid = () => {
  const output = useRecoilValue(outputState)
  const { numRows, numColumns } = useRecoilValue(outputStatsState)

  if (!output) return null

  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div style={style} className="border-t border-l p-1 text-sm truncate">
      {output?.[rowIndex]?.[columnIndex]}
    </div>
  )

  return (
    <AutoSizer defaultHeight={300} defaultWidth={500}>
      {({ height, width }) => (
        <VariableSizeGrid
          width={width}
          height={height}
          rowCount={numRows}
          columnCount={numColumns}
          rowHeight={() => 30}
          columnWidth={() => 150}
        >
          {Cell}
        </VariableSizeGrid>
      )}
    </AutoSizer>
  )
}
