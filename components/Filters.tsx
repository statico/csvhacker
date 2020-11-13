import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableProvidedDraggableProps,
  DraggableStateSnapshot,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { filterState } from "../lib/state"

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
const Filter = ({ index }: { index: number }) => {
  const filters = useRecoilValue(filterState)
  const setFilters = useSetRecoilState(filterState)

  const filter = filters[index]
  const update = (value: any) => {
    const f = [...filters]
    f[index] = { ...filter, ...value }
    setFilters(f)
  }

  switch (filter.type) {
    case "head":
      return (
        <div>
          <div className="font-bold block">Head</div>
          <label>
            Lines:{" "}
            <input
              className="border"
              style={{ width: 50 }}
              type="text"
              value={filter.count}
              onChange={(e) => update({ count: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
      )
    case "tail":
      return (
        <div>
          <div className="font-bold">Tail</div>
          <label>
            Lines:{" "}
            <input
              className="border"
              style={{ width: 50 }}
              type="text"
              value={filter.count}
              onChange={(e) => update({ count: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
      )
  }
}
export const Filters = () => {
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
            <div
              ref={provided.innerRef}
              className="mr-5"
              style={{ width: 100 }}
            >
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
            <div ref={provided.innerRef} style={{ width: 200 }}>
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
                      <Filter index={i} />
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
