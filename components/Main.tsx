import AutoSizer from "react-virtualized-auto-sizer"
import { VariableSizeGrid as Grid } from "react-window"
import { atom, selector, useRecoilValue, useSetRecoilState } from "recoil"
import Papa from "papaparse"
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableProvidedDraggableProps,
  DraggableStateSnapshot,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd"
import { useCallback, useMemo } from "react"

const getUrlState = (): any => {
  if (!process.browser || !document.location.hash) return {}
  try {
    return JSON.parse(decodeURI(document.location.hash.substr(1))) || {}
  } catch (err) {
    console.error("Could not parse state from URL")
    return {}
  }
}

const setUrlState = (state: any): void => {
  if (!process.browser) return
  const url = new URL(document.location.href)
  url.hash = JSON.stringify(state)
  history.pushState(null, "", url.toString())
}

const inputConfigState = atom<{ url?: string; file?: File }>({
  key: "inputConfig",
  default: {},
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      // @ts-ignore
      onSet(({ url }) => {
        const state = { ...getUrlState() }
        if (url) {
          state.url = url
        } else {
          delete state.url
        }
        setUrlState(state)
      })

      const read = () => {
        const { url } = getUrlState()
        if (url) setSelf({ url })
      }
      setTimeout(read, 0) // TODO: Why doesn't read() just work?

      window.addEventListener("hashchange", read)
      return () => {
        window.removeEventListener("hashchange", read)
      }
    },
  ],
})

const inputState = selector<any[][]>({
  key: "input",
  get: ({ get }) => {
    const { url, file } = get(inputConfigState)
    if (!(url || file)) return []
    return new Promise((resolve, reject) => {
      Papa.parse(url || file, {
        download: true,
        error: reject,
        worker: true,
        complete: (results) => {
          // @ts-ignore
          resolve(results.data)
        },
      })
    })
  },
})

const filterState = atom<any[]>({
  key: "filters",
  default: [
    {
      type: "head",
      count: 100,
    },
  ],
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      onSet((filters) => {
        setUrlState({ ...getUrlState(), filters })
      })

      const read = () => {
        const { filters } = getUrlState()
        if (filters) setSelf(filters)
      }
      setTimeout(read, 0) // TODO: Why doesn't read() just work?

      window.addEventListener("hashchange", read)
      return () => {
        window.removeEventListener("hashchange", read)
      }
    },
  ],
})

const outputState = selector<any[][]>({
  key: "output",
  get: ({ get }) => {
    const input = get(inputState)
    if (!input) return null
    const filters = [...get(filterState)]
    let ret = input
    while (filters.length) {
      const filter = filters.shift()
      switch (filter.type) {
        case "head":
          ret = ret.slice(0, filter.count)
          break
        case "tail":
          ret = ret.slice(ret.length - filter.count)
          break
        default:
          throw new Error(`Unknown filter type: ${filter.type}`)
      }
    }
    return ret
  },
})

const outputStatsState = selector<any>({
  key: "outputStats",
  get: ({ get }) => {
    const output = get(outputState)
    let numColumns = 0
    for (const row of output) {
      if (row.length > numColumns) numColumns = row.length
    }
    return { numRows: output.length, numColumns }
  },
})

const getStyle = (
  style: DraggableProvidedDraggableProps["style"],
  snapshot: DraggableStateSnapshot
): any => {
  if (!snapshot.isDropAnimating) {
    return style
  }
  return {
    ...style,
    transitionDuration: `0.001s`,
  }
}

const Filters = () => {
  const filters = useRecoilValue(filterState)
  const setFilters = useSetRecoilState(filterState)

  const addFilter = (type: string, index: number) => {
    const f = [...filters]
    f.splice(index, 0, { type, count: 5 })
    setFilters(f)
  }

  const moveFilter = (from: number, to: number) => {
    const f = [...filters]
    const [removed] = f.splice(from, 1)
    f.splice(to, 0, removed)
    setFilters(f)
  }

  const deleteFilter = (index: number) => {
    const f = [...filters]
    f.splice(index, 1)
    setFilters(f)
  }

  const onDragEnd: OnDragEndResponder = ({
    draggableId,
    source,
    destination,
  }) => {
    if (destination?.droppableId === "filters") {
      if (source.droppableId === "toolbox") {
        addFilter(draggableId, destination.index)
      } else {
        moveFilter(source.index, destination.index)
      }
    } else if (source.droppableId === "filters") {
      deleteFilter(source.index)
    }
  }

  return (
    <div className="flex flex-row">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="toolbox" isDropDisabled={true}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef} className="mr-5">
              {["head", "tail"].map((key, i) => (
                <Draggable draggableId={key} index={i} key={key}>
                  {(
                    provided: DraggableProvided,
                    snapshot: DraggableStateSnapshot
                  ) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="select-none bg-white border border-gray-800 b-2 mb-2 p-2 block"
                      style={getStyle(provided.draggableProps.style, snapshot)}
                    >
                      {key}
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="filters">
          {(provided, snapshot) => (
            <div ref={provided.innerRef}>
              {filters.map((filter, i) => (
                <Draggable draggableId={String(i)} index={i} key={i}>
                  {(
                    provided: DraggableProvided,
                    snapshot: DraggableStateSnapshot
                  ) => (
                    <div
                      ref={provided.innerRef}
                      key={i}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white border border-gray-800 b-2 mb-2 p-2 block"
                      style={getStyle(provided.draggableProps.style, snapshot)}
                    >
                      {i}: {JSON.stringify(filter)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

const Output = () => {
  const output = useRecoilValue(outputState)
  const { numRows, numColumns } = useRecoilValue(outputStatsState)

  if (!output) return null

  const columnWidths = new Array(numColumns).fill(100)
  const rowHeights = new Array(numRows).fill(100)

  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div style={style} className="border-t border-l p-1 text-sm truncate">
      {output?.[rowIndex]?.[columnIndex]}
    </div>
  )

  return (
    <AutoSizer defaultHeight={300} defaultWidth={500}>
      {({ height, width }) => (
        <Grid
          width={width}
          height={height}
          rowCount={numRows}
          columnCount={numColumns}
          rowHeight={(index) => rowHeights[index]}
          columnWidth={(index) => columnWidths[index]}
        >
          {Cell}
        </Grid>
      )}
    </AutoSizer>
  )
}

const Main = () => {
  const input = useRecoilValue(inputState)
  const output = useRecoilValue(outputState)

  return (
    <div className="flex flex-col w-full h-screen z-30">
      {/* TODO: Header */}
      <div className="flex flex-row w-full h-full">
        <div className="p-1">
          <h1 className="text-xl">Filters</h1>
          <Filters />
        </div>
        <div className="p-1 w-full flex flex-col">
          <h1 className="text-xl">Data</h1>
          <div>
            Input: {input.length.toLocaleString()} rows | Output:{" "}
            {output.length.toLocaleString()} rows
          </div>
          <div className="flex-1">
            <Output />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main
