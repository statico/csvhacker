import classNames from "classnames"
import React, { Fragment, useState } from "react"
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
import { FaTimes } from "react-icons/fa"
import { GoAlert } from "react-icons/go"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  AllFilters,
  checkFilterInstanceConfig,
  createFilterInstance,
  getFilterSpecification,
} from "../lib/filters"
import { FilterSpecification } from "../lib/filters/types"
import { filterState, outputState } from "../lib/state"
import Tooltip from "./Tooltip"

// https://stackoverflow.com/a/4149393/102704
const titleCase = (str: string) =>
  str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase()
  })

// https://github.com/atlassian/react-beautiful-dnd/blob/master/stories/src/custom-drop/no-drop.jsx
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
  const { error: outputError, errorIndex } = useRecoilValue(outputState)
  const filters = useRecoilValue(filterState)
  const setFilters = useSetRecoilState(filterState)

  const instance = filters[index]

  const updateMe = (value: any) => {
    const newFilters = [...filters]
    const f = filters[index]
    newFilters[index] = { ...f, config: { ...f.config, ...value } }
    setFilters(newFilters)
  }

  const deleteMe = () => {
    const f = [...filters]
    f.splice(index, 1)
    setFilters(f)
  }

  let isValid = true
  let error = index === errorIndex ? outputError : null
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

  // TODO: Tooltips

  return (
    <div
      className={classNames(
        "p-2 border",
        error ? "border-red-600" : "border-transparent"
      )}
    >
      <div className="flex flex-row items-center mb-2">
        <div className="font-bold truncate">{spec.title}</div>
        <div className="flex flex-grow items-center justify-end ">
          <span
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={deleteMe}
          >
            <FaTimes />
          </span>
        </div>
      </div>
      {Object.keys(fields).map((key) => {
        // @ts-ignore - `meta` property is missing in SchemaFieldDescription
        const { type, meta = {} } = fields[key]

        switch (type) {
          case "number":
          case "string":
            if (meta.textarea) {
              return (
                <Fragment key={key}>
                  <textarea
                    className={classNames(
                      "border px-2 min-w-0 text-sm w-full h-32",
                      type === "string" ? "flex-grow" : "max-w-xs"
                    )}
                    placeholder={meta.placeholder}
                    onChange={(e) =>
                      updateMe({
                        [key]: e.target.value || null,
                      })
                    }
                  >
                    {instance.config[key] || ""}
                  </textarea>
                </Fragment>
              )
            } else {
              return (
                <label key={key} className="flex flex-row items-center mb-1">
                  <span className="mr-1">
                    {meta.title ? meta.title : titleCase(key)}:
                  </span>
                  <input
                    className={classNames(
                      "border px-2 min-w-0",
                      type === "string" ? "flex-grow" : "max-w-xs"
                    )}
                    placeholder={meta.placeholder}
                    type="text"
                    value={instance.config[key] || ""}
                    onChange={(e) =>
                      updateMe({
                        [key]: e.target.value || null,
                      })
                    }
                  />
                </label>
              )
            }

          case "boolean":
            return (
              <label key={key} className="flex flex-row items-center mb-1">
                <span className="mr-1">
                  {meta.title ? meta.title : titleCase(key)}:
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(instance.config[key])}
                  onChange={(e) => updateMe({ [key]: e.target.checked })}
                />
                {meta.helpLink && (
                  <span className="ml-2 flex-grow text-right">
                    <a
                      href={meta.helpLink}
                      target="_blank"
                      className="text-xs underline"
                    >
                      Help?
                    </a>
                  </span>
                )}
              </label>
            )

          default:
            return (
              <div key={key} className="bg-red-800 text-white text-xs">
                Unknown field type: {type}
              </div>
            )
        }
      })}
      {error && (
        <div className="text-red-600 text-sm leading-tight mt-2">
          <GoAlert className="inline mr-1 mx-1 align-middle" />
          {String(error).replace(/^ValidationError:\s+/, "")}
        </div>
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
          {(dropProvided, dropSnapshot) => (
            <div
              ref={dropProvided.innerRef}
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
                    dragProvided: DraggableProvided,
                    dragSnapshot: DraggableStateSnapshot
                  ) => (
                    /* Tooltip positioning isn't ideal but we can revisit later */
                    <Tooltip
                      tip={filter.description}
                      disabled={
                        dropSnapshot.isDraggingOver || dragSnapshot.isDragging
                      }
                    >
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`
                          select-none 
                          bg-white hover:bg-gray-200 
                          rounded-md 
                          shadow hover:shadow-md 
                          border border-transparent hover:border-gray-300
                          transition-all duration-100
                          block mb-2 p-2
                          truncate
                        `}
                        style={getStyle(
                          dragProvided.draggableProps.style,
                          dragSnapshot
                        )}
                      >
                        {filter.title}
                      </div>
                    </Tooltip>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="filters">
          {(dropProvided, dropSnapshot) => (
            <div
              className={classNames(
                wellClassName,
                isDragging && "bg-green-200"
              )}
              ref={dropProvided.innerRef}
            >
              {filters.map((filter, i) => (
                <Draggable draggableId={String(i)} index={i} key={i}>
                  {(
                    dragProvided: DraggableProvided,
                    dragSnapshot: DraggableStateSnapshot
                  ) => (
                    <div
                      ref={dragProvided.innerRef}
                      key={i}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={`
                        bg-white
                        rounded-sm
                        shadow hover:shadow-md
                        border border-transparent hover:border-gray-300
                        transition-all duration-100
                        block mb-2
                      `}
                      style={getStyle(
                        dragProvided.draggableProps.style,
                        dragSnapshot
                      )}
                    >
                      <FilterView index={i} />
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
