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
import { AllFilters, createFilterInstance } from "../lib/filters"
import { filterState } from "../lib/state"
import Tooltip from "./Tooltip"

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

const FilterView = ({ index }: { index: number }) => {
  const filters = useRecoilValue(filterState)
  const setFilters = useSetRecoilState(filterState)

  const filter = filters[index]
  const update = (value: any) => {
    const newFilters = [...filters]
    const f = filters[index]
    newFilters[index] = { ...f, config: { ...f.config, ...value } }
    setFilters(newFilters)
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
              value={filter.config.rows}
              onChange={(e) => update({ rows: Number(e.target.value) || 0 })}
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
              value={filter.config.rows}
              onChange={(e) => update({ rows: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
      )
  }
}

export const FilterList = () => {
  const filters = useRecoilValue(filterState)
  const setFilters = useSetRecoilState(filterState)

  const addFilter = (type: string, index: number) => {
    const f = [...filters]
    f.splice(index, 0, createFilterInstance(type))
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
    <div className="flex flex-row flex-grow h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="toolbox" isDropDisabled={true}>
          {(provided, outerSnapshot) => (
            <div
              ref={provided.innerRef}
              className="bg-blue-200 p-2"
              style={{ width: 100 }}
            >
              {AllFilters.map((filter, index) => (
                <Draggable
                  draggableId={filter.type}
                  index={index}
                  key={filter.type}
                >
                  {(
                    provided: DraggableProvided,
                    snapshot: DraggableStateSnapshot
                  ) => (
                    <Tooltip
                      tip={filter.description}
                      disabled={
                        outerSnapshot.isDraggingOver || snapshot.isDragging
                      }
                    >
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="select-none bg-white rounded-sm mb-2 p-2 block"
                        style={getStyle(
                          provided.draggableProps.style,
                          snapshot
                        )}
                      >
                        {filter.name}
                      </div>
                    </Tooltip>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="filters">
          {(provided, snapshot) => (
            <div
              className="shadow-inner overflow-y-auto p-2"
              ref={provided.innerRef}
              style={{ width: 200 }}
            >
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
                      className="bg-white rounded-sm mb-2 p-2 block shadow"
                      style={getStyle(provided.draggableProps.style, snapshot)}
                    >
                      <FilterView index={i} />
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
