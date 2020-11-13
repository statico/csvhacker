import { useCallback } from "react"
import { FaExternalLinkAlt } from "react-icons/fa"
import { useRecoilState } from "recoil"
import { inputConfigState } from "../lib/state"
import { RadioGroup } from "./RadioGroup"

export const InputConfig = () => {
  const [config, setConfig] = useRecoilState(inputConfigState)
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
        Delimiter:{" "}
        <RadioGroup
          name="inputDelimiter"
          value={config.delimiter || "auto"}
          items={[
            { label: "Auto", value: "auto" },
            { label: "Comma", value: "comma" },
            { label: "Tab", value: "tab" },
          ]}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
