import { atom, selector, useRecoilValue } from "recoil"
import Papa from "papaparse"

const inputState = selector<null | any[][]>({
  key: "input",
  get: ({ get }) => {
    return new Promise((resolve, reject) => {
      Papa.parse("http://localhost:8080/100.csv", {
        download: true,
        error: reject,
        worker: true,
        complete: (results) => {
          // @ts-ignore
          resolve(results.data)
        },
      })
    })
  },
})

const filterState = atom<any[]>({
  key: "filters",
  default: [
    {
      type: "head",
      count: 10,
    },
  ],
})

const outputState = selector<any[][]>({
  key: "output",
  get: ({ get }) => {
    const input = get(inputState)
    if (!input) return null
    const filters = [...get(filterState)]
    let ret = input
    while (filters.length) {
      const filter = filters.shift()
      switch (filter.type) {
        case "head":
          ret = ret.slice(0, filter.count)
          break
        default:
          throw new Error(`Unknown filter type: ${filter.type}`)
      }
    }
    return ret
  },
})

const Main = () => {
  const filters = useRecoilValue(filterState)
  const output = useRecoilValue(outputState)

  return (
    <div className="p-2 flex flex-row">
      <div className="mr-5">
        <h1 className="text-xl">Filters</h1>
        {filters.map((filter, i) => (
          <div
            key={i}
            className="border border-gray-800 b-2 mb-2 p-2 inline-block"
          >
            {i}: {JSON.stringify(filter)}
          </div>
        ))}
      </div>
      <div>
        <h1 className="text-xl">Data</h1>
        <table className="text-sm w-full">
          <tbody>
            {output &&
              output.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border b-1 px-1">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Main
