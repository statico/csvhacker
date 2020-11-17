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
    title={tip}
    disabled={disabled}
    delay={0}
    duration={0}
    arrow
    size="regular"
    position="right"
    theme="dark"
    className="leading-none"
  >
    {children}
  </TippyTooltip>
)

export default Tooltip
