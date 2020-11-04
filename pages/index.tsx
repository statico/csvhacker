import { atom, useRecoilValue } from "recoil"

const inputState = atom<null | any[][]>({
  key: "input",
  default: new Array(20)
    .fill(0)
    .map((i) =>
      new Array(5)
        .fill(0)
        .map((j) => Math.floor(Math.random() * 1e15).toString(36))
    ),
})

const Page = () => {
  const input = useRecoilValue(inputState)
  return (
    <div>
      <h1 className="text-xl">Data</h1>
      <table>
        {input.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  )
}

export default Page
