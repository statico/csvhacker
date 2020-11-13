import { useCallback } from "react"
import { FaExternalLinkAlt } from "react-icons/fa"
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
    <div className="bg-blue-200 p-2">
      <div className="font-bold">
        Input:{" "}
        {config.file ? (
          `Local File`
        ) : config.url ? (
          <span>
            URL{" "}
            <a href={config.url} target="_blank">
              <FaExternalLinkAlt className="inline align-text-bottom" />
            </a>
          </span>
        ) : (
          `None`
        )}
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
