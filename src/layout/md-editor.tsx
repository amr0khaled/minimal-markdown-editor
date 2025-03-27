import { useMdEditorConf } from "@/hooks/editor"
import { BubbleMenu, EditorProvider, useCurrentEditor } from "@tiptap/react"
import MdTools from "./md-tools"
import MdFloating from "./md-floating"



export default function MdEditor() {
  const { extensions, content } = useMdEditorConf()
  return (
    <section className='editor-container'>
      <EditorProvider slotBefore={<MdTools />} extensions={extensions} content={content} editorContainerProps={{
        className: 'editor'
      }}>
        <MdFloating />
      </EditorProvider>
    </section>
  )
}
