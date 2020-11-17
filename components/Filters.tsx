import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableProvidedDraggableProps,
  DraggableStateSnapshot,
  Droppable,
  OnDragEndResponder,
  OnDragStartResponder,
} from "react-beautiful-dnd"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  AllFilters,
  checkFilterInstanceConfig,
  createFilterInstance,
  FilterSpecification,
  getFilterSpecification,
} from "../lib/filters"
import { filterState } from "../lib/state"
import Tooltip from "./Tooltip"
import classNames from "classnames"
import { useState } from "react"

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

  const instance = filters[index]

  const update = (value: any) => {
    const newFilters = [...filters]
    const f = filters[index]
    newFilters[index] = { ...f, config: { ...f.config, ...value } }
    setFilters(newFilters)
  }

  let isValid = true
  let error = null
  try {
    checkFilterInstanceConfig(instance)
  } catch (err) {
    isValid = false
    error = String(err)
  }

  let spec: FilterSpecification
  try {
    spec = getFilterSpecification(instance.type)
  } catch (err) {
    return <div className="bg-red-800 text-white">{String(err)}</div>
  }

  const fields = spec.schema.describe().fields

  return (
    <div
      className={classNames(
        "p-2 transition-all duration-75 border",
        error ? "border-red-600" : "border-transparent"
      )}
    >
      <div className="font-bold block">{spec.title}</div>
      {Object.keys(fields).map((key) => {
        // @ts-ignore
        const { type, meta } = fields[key]
        switch (type) {
          case "number":
            return (
              <label key={key}>
                {meta.title}:
                <input
                  className="border ml-2 px-2"
                  style={{ width: 50 }}
                  placeholder={meta.placeholder}
                  type="text"
                  value={instance.config[key]}
                  onChange={(e) =>
                    update({ [key]: e.target.value.trim() || null })
                  }
                />
              </label>
            )
          default:
            return (
              <div className="bg-red-800 text-white">
                Unknown config tyep: ${type}
              </div>
            )
        }
      })}
      {error && (
        <div className="text-red-600 text-sm leading-tight mt-1">{error}</div>
      )}
    </div>
  )
}

export const FilterList = ({
  wellClassName,
  toolboxClassName,
}: {
  wellClassName?: string
  toolboxClassName?: string
}) => {
  const [isDragging, setIsDragging] = useState(false)
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

  const onDragStart: OnDragStartResponder = () => {
    setIsDragging(true)
  }

  const onDragEnd: OnDragEndResponder = ({
    draggableId,
    source,
    destination,
  }) => {
    setIsDragging(false)
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
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable droppableId="toolbox" isDropDisabled={true}>
          {(provided, outerSnapshot) => (
            <div
              ref={provided.innerRef}
              className={toolboxClassName}
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
                    /* Tooltip positioning isn't ideal but we can revisit later */
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
                        className="select-none bg-white hover:bg-gray-200 rounded-md shadow mb-2 p-2 block"
                        style={getStyle(
                          provided.draggableProps.style,
                          snapshot
                        )}
                      >
                        {filter.title}
                      </div>
                    </Tooltip>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="filters">
          {(provided, outerSnapshot) => (
            <div
              className={classNames(
                wellClassName,
                isDragging && "bg-green-200"
              )}
              ref={provided.innerRef}
              style={{ width: 200 }}
            >
              {filters.map((filter, i) => (
                <Draggable draggableId={String(i)} index={i} key={i}>
                  {(
                    provided: DraggableProvided,
                    innerSnapshot: DraggableStateSnapshot
                  ) => (
                    <div
                      ref={provided.innerRef}
                      key={i}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-white rounded-sm mb-2 block shadow`}
                      style={getStyle(
                        provided.draggableProps.style,
                        innerSnapshot
                      )}
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
