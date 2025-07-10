import { DispatchWithoutAction, useState } from "react"
import { Button } from "./ui/button"

export default function Alert({ show: isShowing, setShow }: { show: boolean, setShow: DispatchWithoutAction<boolean> }) {

  return (
    <div className={`${isShowing ? "" : "hidden"}`}>
      <p>To print colors/background,</p>
      <p>Please enable "Print background colors" from print options.</p>
      <div className='w-full h-8'>
        <Button onClick={() => setShow(false)}>I will do</Button>
      </div>
    </div>
  )
}
