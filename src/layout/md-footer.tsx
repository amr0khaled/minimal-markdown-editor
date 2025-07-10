
import Alert from '@/components/custom-alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useExportDocx, useExportMd, useExportPdf } from '@/hooks/export.tsx'
import '@/style/layout/editor.css'
import { useCurrentEditor } from '@tiptap/react'
import { useLayoutEffect, useState } from 'react'

export default function MdFooter() {
  const { editor } = useCurrentEditor()
  const html = editor?.getHTML() || ""
  const [first, setFirst] = useState(false)
  const [show, setAlert] = useState(false)
  const { save: saveToPdf, isExporting: pdfIsExporting } = useExportPdf(html, setAlert, show)
  const { save: saveToDocx, isExporting: docxIsExporting } = useExportDocx(html)
  const { save: saveToMd, isExporting: mdIsExporting } = useExportMd(html)
  const showAlert = () => {
    setAlert(true)
  }
  useLayoutEffect(() => {
    if (first && show && !pdfIsExporting) {
      saveToPdf()
      setFirst(false)
    }
  }, [show, first, pdfIsExporting, saveToPdf])
  if (!editor) {
    return <p>No Export</p>
  }
  return (
    <section className='editor-footer'>
      <Alert setShow={setFirst} show={first} />
      <Button disabled={docxIsExporting} onClick={saveToDocx}>{docxIsExporting ? <Spinner /> : 'Export To Docx'}</Button>
      <Button disabled={pdfIsExporting} onClick={saveToPdf}>{pdfIsExporting ? <Spinner /> : 'Export To Pdf'}</Button>
      <Button disabled={mdIsExporting} onClick={saveToMd}>{mdIsExporting ? <Spinner /> : 'Export To MarkDown'}</Button>
    </section>
  )
}
