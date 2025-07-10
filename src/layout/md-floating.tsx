import { Editor, FloatingMenu, useCurrentEditor } from "@tiptap/react";
import '@/style/layout/editor.css'
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaCode } from "react-icons/fa6";

export default function MdFloating() {
  const { editor } = useCurrentEditor()
  if (!editor) {
    return <p>No Floating</p>
  }
  const {
    toggleCodeBlock,
    setCodeBlock
  } = editor.chain().focus()
  return (
    <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <div className='floating-menu'>
        <Button size={'icon'} variant={'default'} onClick={() => setCodeBlock().run()}>
          <FaCode />
        </Button>
      </div>
    </FloatingMenu>
  )
}
