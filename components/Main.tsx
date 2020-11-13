import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FaCloudUploadAlt, FaGithub } from "react-icons/fa"
import { useSetRecoilState } from "recoil"
import { inputConfigState } from "../lib/state"
import { Filters } from "./Filters"
import { Grid } from "./Grid"
import { InputConfig } from "./InputConfig"
import { OutputConfig } from "./OutputConfig"
import packageJSON from "../package.json"

const Main = () => {
  const setInputConfig = useSetRecoilState(inputConfigState)

  const onDrop = useCallback((files) => {
    if (files?.length) {
      setInputConfig({ file: files[0] })
    }
  }, [])
  const { getRootProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="flex flex-col w-full h-screen z-30" {...getRootProps()}>
      {isDragActive && (
        <div className="flex justify-center items-center absolute left-0 right-0 top-0 bottom-0 z-50 bg-green-500 opacity-50">
          <FaCloudUploadAlt className="text-white text-6xl animate-bounce" />
        </div>
      )}
      <main className="flex flex-row w-full h-full">
        <section className="flex flex-col h-full bg-blue-100">
          <a
            href={packageJSON.repository.url.replace(/\.git$/, "")}
            className="flex flex-row text-gray-100 hover:text-gray-400 bg-blue-800 items-center px-2 py-1"
            target="_blank"
          >
            <div className="flex-grow font-mono text-sm">
              CSVHacker v{packageJSON.version}
            </div>
            <div className="p-1">
              <FaGithub />
            </div>
          </a>
          <InputConfig />
          <div className="flex-grow p-2 shadow-inner">
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
