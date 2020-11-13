import fileDownload from "js-file-download"
import Papa from "papaparse"
import React, { useCallback } from "react"
import { FaDownload } from "react-icons/fa"
import { useRecoilState, useRecoilValue } from "recoil"
import XLSX from "xlsx"
import { outputConfigState, outputState } from "../lib/state"
import { RadioGroup } from "./RadioGroup"

export const OutputConfig = () => {
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
    (value: any) => {
      setConfig({
        ...config,
        delimiter: value === "auto" ? undefined : value,
      })
    },
    [config]
  )

  return (
    <div className="bg-blue-200 p-2">
      <div className="font-bold">Output</div>
      <div>
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
