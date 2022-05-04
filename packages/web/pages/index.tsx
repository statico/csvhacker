import {
  Box,
  Center,
  Container,
  Heading,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react"
import flatten from "just-flatten-it"
import split from "just-split"
import { NextSeo } from "next-seo"
import { parse } from "papaparse"
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import slugify from "slugify"
import initSqlJs, { SqlJsStatic } from "sql.js"

export default function Page() {
  const toast = useToast()
  const alert = (title: string, description?: string) => {
    toast({ status: "error", position: "top", title, description })
  }

  const [sqlite, setSQLite] = useState<SqlJsStatic>()

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

          console.log(db.exec("select * from data limit 10")[0].values)
        },
      })
    },
    [sqlite]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <Container>
      <NextSeo
        title="csvhacker - an SQL-powered CSV browser"
        description="A SQL-powered tool to quickly view, filter, map, and reduce CSV/TSV files in the browser. Shareable links for easy collaboration with non-engineers"
        additionalLinkTags={[{ rel: "icon", href: "/favicon.png" }]}
      />
      <Heading as="h1">Hello</Heading>
      <Center
        {...getRootProps()}
        h="100px"
        bg={isDragActive ? "green.100" : "gray.50"}
      >
        <Input {...getInputProps()} size="md" />
        <Text>
          {isDragActive ? "Now drop it..." : "Drag something here..."}
        </Text>
      </Center>
    </Container>
  )
}
