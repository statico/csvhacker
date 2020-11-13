import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FaCloudUploadAlt } from "react-icons/fa"
import { useSetRecoilState } from "recoil"
import { inputConfigState } from "../lib/state"
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
  const { getRootProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="flex flex-col w-full h-screen z-30" {...getRootProps()}>
      <header className="flex flex-row text-gray-100 bg-gray-900 items-center">
        <div className="p-1 flex-grow">csvhacker</div>
        <div className="p-1 flex-grow text-right"></div>
      </header>
      {isDragActive && (
        <div className="flex justify-center items-center absolute left-0 right-0 top-0 bottom-0 z-50 bg-green-500 opacity-50">
          <FaCloudUploadAlt className="text-white text-6xl animate-bounce" />
        </div>
      )}
      <main className="flex flex-row w-full h-full">
        <section className="p-1 flex flex-col h-full">
          <InputConfig />
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
