import { useCallback } from "react"
import { useRecoilState } from "recoil"
import { inputConfigState } from "../lib/state"

export const InputConfig = () => {
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
