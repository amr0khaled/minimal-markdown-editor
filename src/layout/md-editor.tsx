import { useMdEditorConf } from "@/hooks/editor"
import { BubbleMenu, EditorProvider } from "@tiptap/react"
import MdTools from "./md-tools"
import MdFloating from "./md-floating"
import MdFooter from "./md-footer"



export default function MdEditor() {
  const { extensions, content } = useMdEditorConf()
  return (
    <section className='editor-container'>
      <EditorProvider slotBefore={<MdTools />} slotAfter={<MdFooter />} extensions={extensions} content={content} editorContainerProps={{
        className: 'editor'
      }}>
        <MdFloating />
      </EditorProvider>
    </section>
  )
}
