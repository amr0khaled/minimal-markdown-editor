import { useMdEditorConf } from "@/hooks/editor"
import { BubbleMenu, EditorProvider, FloatingMenu, useCurrentEditor } from "@tiptap/react"
import MdTools from "./md-tools"



export default function MdEditor() {
  const { extensions, content } = useMdEditorConf()
  const { editor } = useCurrentEditor()
  return (
    <section className='editor-container'>
      <EditorProvider slotBefore={<MdTools />} extensions={extensions} content={content} editorContainerProps={{
        className: 'editor'
      }}>
        <FloatingMenu editor={null}>Menu</FloatingMenu>
      </EditorProvider>
    </section>
  )
}
