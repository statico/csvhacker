import { useCallback } from "react"
import { useRecoilState } from "recoil"
import { inputConfigState } from "../lib/state"
import { Button } from "./Button"
import { RadioGroup } from "./RadioGroup"

export const InputConfig = ({ open }: { open: () => void }) => {
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
      <div className="font-bold mb-2">
        Input:{" "}
        <Button onClick={open}>
          {config.file
            ? config.file.name || "Local file"
            : config.url
            ? config.url
            : `None`}
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
