import fileDownload from "js-file-download"
import Papa from "papaparse"
import { useCallback } from "react"
import { FaDownload } from "react-icons/fa"
import { useRecoilState, useRecoilValue } from "recoil"
import XLSX from "xlsx"
import { outputConfigState, outputState } from "../lib/state"

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
