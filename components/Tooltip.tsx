import React, { ReactNode } from "react"
import { Tooltip as TippyTooltip } from "react-tippy"

const Tooltip = ({
  tip,
  children,
  disabled,
}: {
  tip: string
  children: ReactNode
  disabled?: boolean
}) => (
  <TippyTooltip
    disabled={disabled}
    title={tip}
    delay={350}
    duration={0}
    size="small"
    theme="dark"
    className="leading-none"
  >
    {children}
  </TippyTooltip>
)

export default Tooltip
