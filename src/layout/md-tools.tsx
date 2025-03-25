import { useCurrentEditor } from '@tiptap/react'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FaBold, FaItalic, FaParagraph, FaQuoteRight, FaSubscript, FaSuperscript, FaUnderline } from "react-icons/fa6";
import '@/style/layout/editor.css'
import { LucideHeading1, LucideHeading2, LucideHeading3, LucideHeading4, LucideHeading5, LucideHeading6 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';


export default function MdTools() {
  const { editor } = useCurrentEditor()
  if (!editor) {
    return <p>No Tools</p>
  }
  const disabledButton = editor.can().chain().focus()
  const buttonEditor = editor.chain().focus()
  return (
    <section className="tools-container flex">
      <ToggleGroup className='tools-group' type='multiple' variant={'default'}>
        <ToggleGroupItem value='bold' size={'sm'}
          onClick={() => buttonEditor.toggleBold().run()} disabled={!disabledButton.toggleBold().run()}>
          <FaBold />
        </ToggleGroupItem>
        <ToggleGroupItem value='italic' size={'sm'}
          onClick={() => buttonEditor.toggleItalic().run()} disabled={!disabledButton.toggleBold().run()}>
          <FaItalic />
        </ToggleGroupItem>
        {/* TODO: Install Underline Extension*/}
        <ToggleGroupItem value='underline' size={'sm'}
          onClick={() => buttonEditor.toggleBold().run()} disabled>
          <FaUnderline />
        </ToggleGroupItem>
        <ToggleGroupItem value='quote' size={'sm'}
          onClick={() => buttonEditor.toggleBlockquote().run()} disabled={!disabledButton.toggleBlockquote().run()}>
          <FaQuoteRight />
        </ToggleGroupItem>
        {/* TODO: Install Superscript & Subscript Extensions*/}
        <ToggleGroup className='tools-group' type='single' variant={'default'}>
          <ToggleGroupItem value='sub' size={'sm'}
            onClick={() => buttonEditor.toggleBold().run()} disabled>
            <FaSubscript />
          </ToggleGroupItem>
          <ToggleGroupItem value='sup' size={'sm'}
            onClick={() => buttonEditor.toggleBold().run()} disabled>
            <FaSuperscript />
          </ToggleGroupItem>
        </ToggleGroup>
        <Separator orientation='vertical' />
      </ToggleGroup>
      <ToggleGroup className='tools-group' type='single' variant={'default'}>
        <ToggleGroupItem value='paragraph' size={'sm'}
          onClick={() => buttonEditor.setParagraph().run()}>
          <FaParagraph />
        </ToggleGroupItem>
        <ToggleGroupItem value='h1' size={'sm'}
          onClick={() => buttonEditor.toggleHeading({ level: 1 }).run()}>
          <LucideHeading1 size={28} className='size-6' />
        </ToggleGroupItem>
        <ToggleGroupItem value='h2' size={'sm'}
          onClick={() => buttonEditor.toggleHeading({ level: 2 }).run()}>
          <LucideHeading2 size={28} className='size-6' />
        </ToggleGroupItem>
        <ToggleGroupItem value='h3' size={'sm'}
          onClick={() => buttonEditor.toggleHeading({ level: 3 }).run()}>
          <LucideHeading3 size={28} className='size-6' />
        </ToggleGroupItem>
        <ToggleGroupItem value='h4' size={'sm'}
          onClick={() => buttonEditor.toggleHeading({ level: 4 }).run()}>
          <LucideHeading4 size={28} className='size-6' />
        </ToggleGroupItem>
        <ToggleGroupItem value='h5' size={'sm'}
          onClick={() => buttonEditor.toggleHeading({ level: 5 }).run()}>
          <LucideHeading5 size={28} className='size-6' />
        </ToggleGroupItem>
        <ToggleGroupItem value='h6' size={'sm'}
          onClick={() => buttonEditor.toggleHeading({ level: 6 }).run()}>
          <LucideHeading6 size={28} className='size-6' />
        </ToggleGroupItem>
      </ToggleGroup>
    </section>
  )
}
