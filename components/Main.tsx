import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  FaCloudUploadAlt,
  FaGithub,
  FaInfo,
  FaInfoCircle,
  FaQuestionCircle,
} from "react-icons/fa"
import { useSetRecoilState } from "recoil"
import { inputConfigState } from "../lib/state"
import packageJSON from "../package.json"
import { Filters } from "./Filters"
import { Grid } from "./Grid"
import { InputConfig } from "./InputConfig"
import { OutputConfig } from "./OutputConfig"

const Main = () => {
  const setInputConfig = useSetRecoilState(inputConfigState)

  const onDrop = useCallback((files) => {
    if (files?.length) {
      setInputConfig({ file: files[0] })
    }
  }, [])
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  })

  const url = packageJSON.repository.url.replace(/\.git$/, "")

  return (
    <div className="flex flex-col w-full h-screen z-30" {...getRootProps()}>
      {/* A hidden input is required to open the file selection window programatically */}
      <input className="hidden" {...getInputProps()} />

      {isDragActive && (
        <div className="flex justify-center items-center absolute left-0 right-0 top-0 bottom-0 z-50 bg-green-500 opacity-50">
          <FaCloudUploadAlt className="text-white text-6xl animate-bounce" />
        </div>
      )}

      <main className="flex flex-row w-full h-full">
        <section className="flex flex-col h-full bg-blue-100">
          <header className="flex flex-row bg-blue-800 items-center px-2 py-1">
            <a
              href={url}
              className="font-mono text-sm text-gray-100 hover:text-gray-400"
              target="_blank"
            >
              CSVHacker v{packageJSON.version}
            </a>
            <div className="flex-grow text-right">
              <a
                href={url + "#readme"}
                className=" text-gray-100 hover:text-gray-400 "
                target="_blank"
              >
                <FaQuestionCircle className="inline align-text-bottom" />
              </a>{" "}
              <a
                href={url}
                className=" text-gray-100 hover:text-gray-400 "
                target="_blank"
              >
                <FaGithub className="inline align-text-bottom" />
              </a>
            </div>
          </header>

          <InputConfig open={open} />
          <div className="flex-grow">
            <Filters />
          </div>
          <OutputConfig />
        </section>

        <section className="p-1 w-full flex flex-col">
          <Grid />
        </section>
      </main>
    </div>
  )
}

export default Main
