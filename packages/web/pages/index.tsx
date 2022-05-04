import { Box, HStack, useColorModeValue, useToast } from "@chakra-ui/react"
import Editor from "@monaco-editor/react"
import flatten from "just-flatten-it"
import split from "just-split"
import { parse } from "papaparse"
import pluralize from "pluralize"
import { useCallback, useEffect, useMemo, useState } from "react"
import DataGrid, { Column } from "react-data-grid"
import { useDropzone } from "react-dropzone"
import slugify from "slugify"
import initSqlJs, { Database, QueryExecResult, SqlJsStatic } from "sql.js"
import fetch from "unfetch"
import useModals, { ModalProvider } from "../hooks/useModals"

const DEFAULT_QUERY = "select * from data"

export const App = () => {
  const isDark = useColorModeValue(false, true)
  const { alert } = useModals()

  const [sqlite, setSQLite] = useState<SqlJsStatic>()
  const [db, setDB] = useState<Database>()
  const [query, setQuery] = useState(DEFAULT_QUERY)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initSqlJs({
      locateFile: (path) => `/sql.js/${path}`,
    }).then((SQLStatic) => {
      setSQLite(SQLStatic)
    })
  }, [])

  const onDrop = useCallback(
    (files: File[]) => {
      parse(files[0], {
        error: (err) => {
          alert(String(err))
        },
        complete: (results) => {
          if (!sqlite) return alert("SQLite not available")

          if (results.errors?.length)
            return alert(
              `${results.errors.length} error(s): ${results.errors[0]}`
            )

          const header = results.data.shift() as string[]
          if (!header) return alert("No data")

          let maxColumns = 0
          for (const row of results.data as any[][]) {
            maxColumns = Math.max(maxColumns, row.length)
          }
          const seen = new Map<string, number>()
          const columns = new Array(maxColumns).fill(0).map((_, i) => {
            let name = slugify(header[i] || `column_${i}`, {
              remove: /[^\W\S]/,
              lower: true,
              replacement: "_",
            })
            if (seen.has(name)) {
              const i = seen.get(name)! + 1
              name += i
              seen.set(name, i)
            } else {
              seen.set(name, 1)
            }
            return name
          })

          const db = new sqlite.Database()
          db.run(
            `create table data (${columns
              .map((c) => c + " string")
              .join(", ")});`
          )

          const chunks = split(results.data, 1000) as any[][][]
          const placeholders =
            "(" + new Array(maxColumns).fill("?").join(",") + ")"
          for (const chunk of chunks) {
            db.run(
              "insert into data values " +
                new Array(chunk.length).fill(placeholders).join(","),
              flatten(chunk)
            )
          }

          setDB(db)
        },
      })
    },
    [sqlite]
  )

  useEffect(() => {
    if (!sqlite) return
    fetch("https://csv.statico.io/100.csv")
      .then((res) => res.blob())
      .then((blob) => onDrop([new File([blob], "file.csv")]))
  }, [sqlite])

  const [results, setResults] = useState<QueryExecResult>()
  useEffect(() => {
    if (!db) return
    try {
      setResults(db.exec(query || DEFAULT_QUERY)[0])
      console.log(query || DEFAULT_QUERY)
      setError(null)
    } catch (err) {
      setError(String(err))
    }
  }, [db, query])

  type Row = any
  const rows: readonly Row[] = useMemo(() => results?.values || [], [results])
  const columns: Column<Row>[] = useMemo(
    () =>
      (results?.columns || []).map(
        (name, i): Column<Row> => ({
          name,
          key: String(i),
          resizable: true,
        })
      ),
    [results]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: !!db,
  })

  return (
    <Box
      {...getRootProps()}
      h="100vh"
      w="100vw"
      display="flex"
      flexDirection="column"
      fontFamily="Menlo, monospace"
      bg={isDark ? "black.100" : "white"}
    >
      <input {...getInputProps()} />

      <Box as="header">
        <HStack p={1}>
          <Editor
            height="75px"
            defaultValue={query}
            defaultLanguage="sql"
            theme={isDark ? "vs-dark" : "light"}
            onChange={(value) => setQuery(value || "")}
            options={{
              fontSize: 16,
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              lineDecorationsWidth: 0, // undocumented
              lineNumbersMinChars: 0, // undocumented
              glyphMargin: false,
              folding: false,
              lineNumbers: false,
              renderLineHighlight: false,
              scrollbar: {
                vertical: "hidden",
                verticalScrollbarSize: 0,
              },
              minimap: {
                enabled: false,
              },
            }}
          />
        </HStack>
      </Box>

      {error ? (
        <Box
          bg={isDark ? "red.700" : "red.100"}
          color={isDark ? "white" : "black"}
          p={1}
          fontSize="sm"
        >
          {error}
        </Box>
      ) : (
        <Box
          bg={isDark ? "blue.700" : "blue.100"}
          color={isDark ? "white" : "black"}
          p={1}
          fontSize="sm"
        >
          {pluralize("rows", results?.values.length || 0, true)}
        </Box>
      )}

      {/* Don't render the grid on the server side */}
      {sqlite && (
        <DataGrid<Row>
          columns={columns}
          rows={rows}
          rowHeight={22}
          style={{
            flexGrow: 1,
          }}
        />
      )}
    </Box>
  )
}

export default function Page() {
  return (
    <ModalProvider>
      <App />
    </ModalProvider>
  )
}
