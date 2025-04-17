
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useExportDocx, useExportMd, useExportPdf } from '@/hooks/export.tsx'
import '@/style/layout/editor.css'
import { useCurrentEditor } from '@tiptap/react'

export default function MdFooter() {
  const { editor } = useCurrentEditor()
  const html = editor?.getHTML() || ""
  const { save: saveToPdf, isExporting: pdfIsExporting } = useExportPdf(html)
  const { save: saveToDocx, isExporting: docxIsExporting } = useExportDocx(html)
  const { save: saveToMd, isExporting: mdIsExporting } = useExportMd(html)

  if (!editor) {
    return <p>No Export</p>
  }
  return (
    <section className='editor-footer'>
      <Button onClick={saveToDocx}>{docxIsExporting ? <Spinner /> : 'Export To Docx'}</Button>
      <Button onClick={saveToPdf}>{pdfIsExporting ? <Spinner /> : 'Export To Pdf'}</Button>
      <Button onClick={saveToMd}>{mdIsExporting ? <Spinner /> : 'Export To MarkDown'}</Button>
    </section>
  )
}
