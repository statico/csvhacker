import fileDownload from "js-file-download"
import Papa from "papaparse"
import React, { useCallback } from "react"
import { FaFileDownload } from "react-icons/fa"
import { useRecoilState, useRecoilValue } from "recoil"
import XLSX from "xlsx"
import { outputConfigState, outputState } from "../lib/state"
import { Button } from "./Button"
import { RadioGroup } from "./RadioGroup"

export const OutputConfig = ({ className }: { className?: string }) => {
  const { output, numRows } = useRecoilValue(outputState)
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
    (value: any) => {
      setConfig({
        ...config,
        delimiter: value === "auto" ? undefined : value,
      })
    },
    [config]
  )

  return (
    <div className={className}>
      <div className="mb-1">
        <span className="font-bold mr-2">Output:</span>
        {numRows.toLocaleString()} rows
      </div>
      <div className="mb-2">
        Delimiter:{" "}
        <RadioGroup
          name="outputDelimiter"
          value={config.delimiter || "auto"}
          items={[
            { label: "Auto", value: "auto" },
            { label: "Comma", value: "comma" },
            { label: "Tab", value: "tab" },
          ]}
          onChange={onChange}
        />
      </div>
      <div className="flex flex-row justify-center">
        <div className="mx-1">
          <Button onClick={downloadCSV}>
            CSV <FaFileDownload />
          </Button>
        </div>
        <div className="mx-1">
          <Button onClick={downloadXLSX}>
            XLSX <FaFileDownload />
          </Button>
        </div>
      </div>
    </div>
  )
}
