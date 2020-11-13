import fileDownload from "js-file-download"
import Papa from "papaparse"
import { useCallback } from "react"
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableProvidedDraggableProps,
  DraggableStateSnapshot,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd"
import { useDropzone } from "react-dropzone"
import { FaCloudUploadAlt, FaDownload } from "react-icons/fa"
import AutoSizer from "react-virtualized-auto-sizer"
import { VariableSizeGrid as Grid } from "react-window"
import {
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil"
import XLSX from "xlsx"

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

const inputConfigState = atom<{
  url?: string
  file?: File
  delimiter?: "comma" | "tab"
}>({
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
    const { url, file, delimiter } = get(inputConfigState)
    if (!(url || file)) return []
    return new Promise((resolve, reject) => {
      Papa.parse(url || file, {
        delimiter:
          delimiter === "comma" ? "," : delimiter === "tab" ? "\t" : undefined,
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

const outputConfigState = atom<{
  delimiter?: "comma" | "tab"
}>({
  key: "outputConfig",
  default: {},
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

const Output = () => {
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
        <Grid
          width={width}
          height={height}
          rowCount={numRows}
          columnCount={numColumns}
          rowHeight={() => 30}
          columnWidth={() => 150}
        >
          {Cell}
        </Grid>
      )}
    </AutoSizer>
  )
}

const InputConfig = () => {
  const [config, setConfig] = useRecoilState(inputConfigState)
  const onChange = useCallback(
    (e: any) => {
      const val = e.target.value
      setConfig({
        ...config,
        delimiter: val === "auto" ? undefined : val,
      })
    },
    [config]
  )
  return (
    <div className="border border-gray-900 p-2 mb-5">
      <div className="font-bold">Input</div>
      <div className="italic w-full truncate">
        {config.file
          ? `File: xxx`
          : config.url
          ? `URL: ${config.url}`
          : `No data`}
      </div>
      <div>
        Delimiter:
        <label>
          <input
            type="radio"
            name="inputDelimiter"
            value="auto"
            checked={config.delimiter === undefined}
            onChange={onChange}
          />
          Auto
        </label>
        <label>
          <input
            type="radio"
            name="inputDelimiter"
            value="comma"
            checked={config.delimiter === "comma"}
            onChange={onChange}
          />
          Comma
        </label>
        <label>
          <input
            type="radio"
            name="inputDelimiter"
            value="tab"
            checked={config.delimiter === "tab"}
            onChange={onChange}
          />
          Tab
        </label>
      </div>
    </div>
  )
}

const OutputConfig = () => {
  const output = useRecoilValue(outputState)
  const [config, setConfig] = useRecoilState(outputConfigState)

  const downloadCSV = useCallback(async () => {
    const data = Papa.unparse(output, {
      delimiter:
        config.delimiter === "comma"
          ? ","
          : config.delimiter === "tab"
          ? "\t"
          : undefined,
    })
    fileDownload(data, "csvhacker.csv")
  }, [output])

  const downloadXLSX = useCallback(async () => {
    const ws = XLSX.utils.aoa_to_sheet(output)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws)
    XLSX.writeFile(wb, "csvhacker.xlsx")
  }, [output])

  const onChange = useCallback(
    (e: any) => {
      const val = e.target.value
      setConfig({
        ...config,
        delimiter: val === "auto" ? undefined : val,
      })
    },
    [config]
  )

  return (
    <div className="border border-gray-900 p-2 mb-5">
      <div className="font-bold">Output</div>
      <div>
        Delimiter:
        <label>
          <input
            type="radio"
            name="outputDelimiter"
            value="auto"
            checked={config.delimiter === undefined}
            onChange={onChange}
          />
          Auto
        </label>
        <label>
          <input
            type="radio"
            name="outputDelimiter"
            value="comma"
            checked={config.delimiter === "comma"}
            onChange={onChange}
          />
          Comma
        </label>
        <label>
          <input
            type="radio"
            name="outputDelimiter"
            value="tab"
            checked={config.delimiter === "tab"}
            onChange={onChange}
          />
          Tab
        </label>
      </div>
      <div>
        <span onClick={downloadXLSX}>
          XLSX
          <FaDownload className="inline" />
        </span>
        <span onClick={downloadCSV}>
          CSV
          <FaDownload className="inline" />
        </span>
      </div>
    </div>
  )
}

const Main = () => {
  const setInputConfig = useSetRecoilState(inputConfigState)

  const onDrop = useCallback((files) => {
    if (files?.length) {
      setInputConfig({ file: files[0] })
    }
  }, [])
  const { getRootProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="flex flex-col w-full h-screen z-30" {...getRootProps()}>
      <header className="flex flex-row text-gray-100 bg-gray-900 items-center">
        <div className="p-1 flex-grow">csvhacker</div>
        <div className="p-1 flex-grow text-right"></div>
      </header>
      {isDragActive && (
        <div className="flex justify-center items-center absolute left-0 right-0 top-0 bottom-0 z-50 bg-green-500 opacity-50">
          <FaCloudUploadAlt className="text-white text-6xl animate-bounce" />
        </div>
      )}
      <main className="flex flex-row w-full h-full">
        <section className="p-1 flex flex-col h-full">
          <InputConfig />
          <div className="flex-grow">
            <Filters />
          </div>
          <OutputConfig />
        </section>
        <section className="p-1 w-full flex flex-col">
          <Output />
        </section>
      </main>
    </div>
  )
}

export default Main
