import StarterKit from '@tiptap/starter-kit'

export const useMdEditorConf = () => {
  return {
    content: `
    <h3>Title!</h3>
    <p>Your Story.</p>
    `,
    extensions: [
      StarterKit
    ]
  }
}
