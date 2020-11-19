import { useCallback } from "react"
import { FaFileUpload, FaGlobeAmericas } from "react-icons/fa"
import { useRecoilState } from "recoil"
import { inputConfigState } from "../lib/state"
import { Button } from "./Button"
import { RadioGroup } from "./RadioGroup"

export const InputConfig = ({
  chooseFile,
  className,
}: {
  chooseFile: () => void
  className?: string
}) => {
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

  const chooseURL = () => {
    const url = prompt("Enter file URL:", config.url)
    if (!url || !url.trim()) return
    setConfig({ ...config, file: undefined, url })
  }

  return (
    <div className={className}>
      <div className="flex flex-row items-center mb-2 leading-none">
        <div className="font-bold mr-2">Input:</div>
        <div className="flex-1 min-w-0 truncate text-sm mt-1">
          {config.file
            ? config.file.name || "Local file"
            : config.url
            ? config.url
            : `None`}
        </div>
        <Button onClick={chooseFile} className="ml-1">
          <FaFileUpload />
        </Button>
        <Button onClick={chooseURL} className="ml-1">
          <FaGlobeAmericas />
        </Button>
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
