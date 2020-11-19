import { ReactNode, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FaCloudUploadAlt, FaGithub, FaInfoCircle } from "react-icons/fa"
import { useSetRecoilState } from "recoil"
import { inputConfigState } from "../lib/state"
import packageJSON from "../package.json"
import { FilterList } from "./Filters"
import { Grid } from "./Grid"
import { InputConfig } from "./InputConfig"
import { OutputConfig } from "./OutputConfig"

const HeaderLink = ({
  href,
  title,
  children,
}: {
  href: string
  title?: string
  children: ReactNode
}) => (
  <a
    href={href}
    title={title}
    className="font-mono text-gray-200 hover:text-gray-400 transition-colors duration-75"
    target="_blank"
  >
    {children}
  </a>
)

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
        <section
          className="flex flex-col h-full bg-gray-400 pb-2"
          style={{ width: 350 }}
        >
          <header className="flex flex-row items-center p-3 bg-gray-800 text-lg">
            <HeaderLink href={url}>CSVHacker v{packageJSON.version}</HeaderLink>
            <div className="flex-grow flex flex-row justify-end items-center">
              <HeaderLink href={url} title="View source on GitHub">
                <FaGithub className="ml-1" />
              </HeaderLink>
            </div>
          </header>

          <InputConfig chooseFile={open} className="p-3" />
          <div className="flex-grow">
            <FilterList
              toolboxClassName={"px-3"}
              wellClassName={
                "flex-grow bg-gray-200 shadow-inner overflow-y-auto p-3"
              }
            />
          </div>
          <OutputConfig className="p-3" />
        </section>

        <section className="p-1 w-full flex flex-col">
          <Grid />
        </section>
      </main>
    </div>
  )
}

export default Main
