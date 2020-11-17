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
    className={`
      bg-gray-500 hover:bg-gray-500 active:bg-gray-300
      text-gray-900
      shadow-sm hover:shadow-md
      rounded-md
      px-3 py-2
      transition-all duration-75
      flex flex-row justify-center items-center
      `}
    onClick={onClick}
  >
    {children}
  </button>
)
