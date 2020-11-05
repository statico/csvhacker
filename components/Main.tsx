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

const inputState = selector<null | any[][]>({
  key: "input",
  get: ({ get }) => {
    return new Promise((resolve, reject) => {
      Papa.parse("http://localhost:8080/10k.csv", {
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
      count: 10,
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

const Main = () => {
  const output = useRecoilValue(outputState)

  return (
    <div className="p-2 flex flex-row">
      <div className="mr-5">
        <h1 className="text-xl">Filters</h1>
        <Filters />
      </div>
      <div>
        <h1 className="text-xl">Data</h1>
        <table className="text-sm w-full">
          <tbody>
            {output &&
              output.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border b-1 px-1">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Main
