import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Image } from '@tiptap/extension-image'
import { TitleBlock } from '@/lib/title-node'
import { all, createLowlight } from 'lowlight'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import py from 'highlight.js/lib/languages/python'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import java from 'highlight.js/lib/languages/java'
import rust from 'highlight.js/lib/languages/rust'
import go from 'highlight.js/lib/languages/go'
import scss from 'highlight.js/lib/languages/scss'
import php from 'highlight.js/lib/languages/php'
import sql from 'highlight.js/lib/languages/sql'

const lowlight = createLowlight(all)

export const useMdEditorConf = () => {
  lowlight.register('js', js)
  lowlight.register('ts', ts)
  lowlight.register('py', py)
  lowlight.register('c', c)
  lowlight.register('cpp', cpp)
  lowlight.register('java', java)
  lowlight.register('rust', rust)
  lowlight.register('go', go)
  lowlight.register('scss', scss)
  lowlight.register('php', php)
  lowlight.register('sql', sql)
  return {
    content: `
    <h1 data-undeletable="true" id='title-markdown'>Title!</h1>
    <p>Your Story.</p>
    `,
    extensions: [
      TitleBlock,
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Subscript,
      Superscript,
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          'data-safe': 'true'
        }
      })
    ]
  }
}
