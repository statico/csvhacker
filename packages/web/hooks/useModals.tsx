import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react"
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react"

// TODO: Select field contents when a prompt() loads
// TODO: Fix Promise<> return types instead of using any

enum ModalType {
  Alert,
  Confirm,
  Prompt,
}

export interface Modals {
  alert: (message: string) => Promise<any>
  confirm: (message: string) => Promise<any>
  prompt: (message: string, defaultValue?: string) => Promise<any>
}

const defaultContext: Modals = {
  alert() {
    throw new Error("<ModalProvider> is missing")
  },
  confirm() {
    throw new Error("<ModalProvider> is missing")
  },
  prompt() {
    throw new Error("<ModalProvider> is missing")
  },
}

const Context = createContext<Modals>(defaultContext)

interface AnyEvent {
  preventDefault(): void
}

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ReactNode | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const ok = useRef<HTMLButtonElement>(null)

  const createOpener = useCallback(
    (type: ModalType) =>
      (message: string, defaultValue = "") =>
        new Promise((resolve) => {
          const handleClose = (e?: AnyEvent) => {
            e?.preventDefault()
            setModal(null)
            resolve(null)
          }

          const handleCancel = (e?: AnyEvent) => {
            e?.preventDefault()
            setModal(null)
            if (type === ModalType.Prompt) resolve(null)
            else resolve(false)
          }

          const handleOK = (e?: AnyEvent) => {
            e?.preventDefault()
            setModal(null)
            if (type === ModalType.Prompt) resolve(input.current?.value)
            else resolve(true)
          }

          setModal(
            <Modal
              isOpen={true}
              onClose={handleClose}
              initialFocusRef={type === ModalType.Prompt ? input : ok}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalBody mt={5}>
                  <Stack spacing={5}>
                    <Text> {message}</Text>
                    {type === ModalType.Prompt && (
                      <Input ref={input} defaultValue={defaultValue} />
                    )}
                  </Stack>
                </ModalBody>
                <ModalFooter>
                  {type !== ModalType.Alert && (
                    <Button mr={3} variant="ghost" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleOK} ref={ok}>
                    OK
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )
        }),
    [children]
  )

  return (
    <Context.Provider
      value={{
        alert: createOpener(ModalType.Alert),
        confirm: createOpener(ModalType.Confirm),
        prompt: createOpener(ModalType.Prompt),
      }}
    >
      {children}
      {modal}
    </Context.Provider>
  )
}

const useModals = () => useContext(Context)

export default useModals
