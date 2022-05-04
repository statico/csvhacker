import DataGrid, { Column } from "react-data-grid"
import { Box, Center, HStack, Input, Text, useToast } from "@chakra-ui/react"
import flatten from "just-flatten-it"
import split from "just-split"
import { NextSeo } from "next-seo"
import { parse } from "papaparse"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDropzone } from "react-dropzone"
import slugify from "slugify"
import initSqlJs, { Database, QueryExecResult, SqlJsStatic } from "sql.js"
import pluralize from "pluralize"
import fetch from "unfetch"

const DEFAULT_QUERY = "select * from data"

export const App = () => {
  const toast = useToast()
  const alert = (title: string, description?: string) => {
    toast({ status: "error", position: "top", title, description })
  }

  const [sqlite, setSQLite] = useState<SqlJsStatic>()
  const [db, setDB] = useState<Database>()
  const [query, setQuery] = useState("")
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
              `${results.errors.length} error(s)`,
              String(results.errors[0])
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
      bg={isDragActive ? "green.100" : "gray.50"}
      display="flex"
      flexDirection="column"
    >
      <Input {...getInputProps()} size="md" />
      <style jsx global>{`
        body {
          font-family: Menlo, monospace;
        }
      `}</style>

      <Box as="header">
        <HStack>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={DEFAULT_QUERY}
          />
        </HStack>
      </Box>

      {error ? (
        <Box bg="red" color="white" p={1} fontSize="sm">
          {error}
        </Box>
      ) : (
        <Box bg="blue" color="white" p={1} fontSize="sm">
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
    <>
      <App />
      <NextSeo
        title="csvhacker - an SQL-powered CSV browser"
        description="A SQL-powered tool to quickly view, filter, map, and reduce CSV/TSV files in the browser. Shareable links for easy collaboration with non-engineers"
        additionalLinkTags={[{ rel: "icon", href: "/favicon.png" }]}
      />
    </>
  )
}
