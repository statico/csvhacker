import { ReactNode } from "react"

export const Button = ({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) => (
  <button
    type="button"
    className="bg-gray-100 border border-gray-400 rounded-md text-sm px-2 py-1 hover:bg-white active:text-gray-600 active:bg-gray-700"
    onClick={onClick}
  >
    {children}
  </button>
)
