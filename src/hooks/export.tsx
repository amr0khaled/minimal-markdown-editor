import { Packer, Paragraph, ImageRun, TextRun, HeadingLevel, IImageOptions, Document as Documentx } from 'docx'
import { sanitize } from './sanitize'
import { Dispatch, DispatchWithoutAction, useEffect, useState } from 'react'
// import { PDFDocument, PDFString, StandardFonts, rgb } from 'pdf-lib'
import { PDFDownloadLink, Document as ReactDocument, Page, Image, Text, View, Link, StyleSheet, Font, pdf } from '@react-pdf/renderer'
import TurndownService from 'turndown';
import * as hl from 'highlight.js/styles/tokyo-night-dark.min.css'

const convertImageToUint8Array = async (src: string) => {
  if (src.startsWith('data:')) {
    const base64Data = src.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes
  }
};

export const useExportDocx = (html: string) => {

  const [isExporting, setIsExporting] = useState(false);


  const parseHtmlToDocx = async (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = doc.body.children;
    const docxElements = [];

    for (const element of nodes) {
      switch (element.tagName.toLowerCase()) {
        case 'h1':
          docxElements.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun(element.textContent ?? '')]
            })
          );
          break;

        case 'h2':
          docxElements.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun(element.textContent ?? '')]
            })
          );
          break;

        case 'p':
          docxElements.push(
            new Paragraph({
              children: [new TextRun(element.textContent ?? '')]
            })
          );
          break;

        case 'img': {
          const src = element.getAttribute('src');
          if (src) {
            const imageData = await convertImageToUint8Array(src);
            docxElements.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageData,
                    transformation: {
                      width: parseInt(element.getAttribute('width') || '100'),
                      height: parseInt(element.getAttribute('height') || '100')
                    }
                  } as IImageOptions)
                ]
              })
            );
          }
          break;
        }

        case 'strong':
          docxElements.push(
            new Paragraph({
              children: [new TextRun({
                text: element.textContent ?? '',
                bold: true
              })]
            })
          );
          break;

        case 'em':
          docxElements.push(
            new Paragraph({
              children: [new TextRun({
                text: element.textContent ?? '',
                italics: true
              })]
            })
          );
          break;

        default:
          docxElements.push(
            new Paragraph({
              children: [new TextRun(element.textContent ?? '')]
            })
          );
      }
    }

    return docxElements;
  };

  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true);
    try {
      let title = ''
      const titleEl = getTitle(html)
      if (titleEl) {
        title = titleEl.textContent ?? ''
      }
      // Sanitize HTML
      const cleanHtml = sanitize(html)
      // Create DOCX document
      const doc = new Documentx({
        sections: [{
          properties: {},
          children: await parseHtmlToDocx(cleanHtml)
        }]
      });

      // Generate Blob
      const blob = await Packer.toBlob(doc);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.docx`;
      link.target = "_blank"
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  return { save: handleExport, isExporting }
}

function getTitle(htmlString: string): Element | null {
  return new DOMParser().parseFromString(htmlString, "text/html").body.querySelector('#title-markdown');
}

export const useExportMd = (html: string) => {
  const [isExporting, setExporting] = useState(false)
  let title = ''
  const titleEl = getTitle(html)
  if (titleEl) {
    title = titleEl.textContent ?? ''
  }
  const td = new TurndownService()
  const md = td.turndown(html)
  const save = () => {
    if (isExporting) return
    setExporting(true)
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExporting(false)
  }
  return { save, isExporting }
}

// export const useExportPdf = (html: string) => {
//   const [isExporting, setExporting] = useState(false)
// 
//   const element = document.createElement('div');
//   let title = ''
//   const titleEl = getTitle(html)
//   if (titleEl) {
//     title = titleEl.textContent ?? ''
//   }
//   element.innerHTML = html;
//   element.style.padding = '2cm';
// 
//   // Clone the element to preserve original styles
//   const clone = element.cloneNode(true) as HTMLElement;
// 
//   // Apply Tailwind styles
//   clone.querySelectorAll('*').forEach(el => {
//     const classes = el.getAttribute('class');
//     if (classes) {
//       const styles = window.getComputedStyle(el);
//       (el as HTMLElement).style.cssText = styles.cssText;
//     }
//   });
// 
// 
//   const save = async () => {
//     if (isExporting) return
//     setExporting(true)
//     try {
//       const pdfDoc = await PDFDocument.create();
//       const page = pdfDoc.addPage();
//       const { width, height } = page.getSize();
// 
//       // Extract text content with styles
// 
//       // Set up fonts
//       const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
// 
//       // Add text
//       page.drawText(html, {
//         x: 50,
//         y: height - 50,
//         size: 12,
//         font,
//         color: rgb(0, 0, 0),
//         maxWidth: width - 100,
//         lineHeight: 18,
//       });
// 
//       // Save PDF
//       const pdfBytes = await pdfDoc.save();
//       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
// 
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `${title}.pdf`;
//       link.click();
//       URL.revokeObjectURL(url);
//     } catch (e) {
//     }
//     setExporting(false)
//   }
//   return { save, isExporting };
// }

const processNodes = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const nodes = doc.body.children;
  const docxElements = [];
  for (const node of nodes) {
    let tag = node.tagName.toLowerCase()
    if (tag !== 'img') {
      if (tag === 'p' && node.children.length !== 0) {
        tag = node.children.item(0)?.tagName.toLowerCase() ?? 'p'
      }
      if (tag === 'em') {
        docxElements.push(<Text style={{ fontSize: 12, fontStyle: 'italic' }}>{node.textContent}</Text>)
        continue
      }
      if (tag === 'strong') {
        docxElements.push(<Text style={{ fontWeight: 'semibold' }}>{node.textContent}</Text>)
        continue
      }
      if (tag === 'a') {
        docxElements.push(
          <Link href={(node as HTMLAnchorElement).href}>
            {node.textContent}
          </Link>
        )
        continue
      }
      if (tag === 'p') {
        docxElements.push(
          <Text style={{ fontSize: 12, paddingVertical: 1 * 4 }}>
            {node.textContent}
          </Text>
        )
        continue
      }
      if (tag === 'pre') {
        docxElements.push(
          <View
            style={{
              backgroundColor: '#101010',
              color: '#fefefe',
              borderRadius: 1.5 * 4,
              paddingVertical: 0.75 * 4,
              paddingHorizontal: 1 * 4
            }}
          >
            <Text>{node.children.item(0)?.textContent ?? ''}</Text>
          </View>
        )
        continue
      }
      if (tag.startsWith('h') && !tag.endsWith('r') && tag.length === 2) {
        const size = () => {
          switch (tag) {
            case 'h1':
              return 56
            case 'h2':
              return 48
            case 'h3':
              return 40
            case 'h4':
              return 32
            case 'h5':
              return 24
            default:
              return 16
          }
        }
        const margin = () => {
          switch (tag) {
            case 'h1':
              return 10
            case 'h2':
              return 8
            case 'h3':
              return 6
            case 'h4':
              return 4
            case 'h5':
              return 3
            default:
              return 2
          }
        }
        docxElements.push(
          <Text
            style={{
              fontSize: size(),
              marginBottom: margin(),
              fontWeight: 'bold'
            }}
          >
            {node.textContent ?? ''}
          </Text>
        )
        continue
      }
      docxElements.push(<Text>{node.textContent}</Text>)
    } else if (tag === 'img') {
      docxElements.push(
        <Image src={(node as HTMLImageElement).src} cache={true} />
      )
      continue
    }
  }
  return docxElements
}

export const useExportPdf = (html: string, setShow: Dispatch<boolean>, show: boolean) => {
  const [isExporting, setIsExporting] = useState(false)

  const save = () => {
    setIsExporting(true)
    console.log(html)
    const content = sanitize(html)
    const title = getTitle(content)?.textContent

    const win = window.open('/download', '_blank', 'width=800, height=600')
    if (win) {
      const styles = [...document.head.children].filter(e => e.tagName === 'STYLE')
      const _content = `
      <html>
        <head>
          <title>${title}</title>
          ${styles.map(e => e.outerHTML).join('\n')}
        </head>
        <body>
          ${content}
        </body>
      </html>
    `
      win.document.write(_content)
      win.document.close()
      win.print()
    } else {
      console.log('win is null')
    }


    setIsExporting(false)
  }
  return { save, isExporting }
}

// export const useExportPdf = (html: string) => {
//   const [isExporting, setIsExporting] = useState(false)
//   const save = async () => {
//     setIsExporting(true)
//     console.log(html)
//     const cleanHtml = sanitize(html)
//     const content = processNodes(cleanHtml)
//     const RootPDF =
//       <ReactDocument title={getTitle(html)?.textContent ?? `${Date.now()}`}>
//         <Page size='A4' style={{
//           paddingVertical: 5 * 4,
//           paddingHorizontal: 3 * 4
//         }}>
//           {...content}
//         </Page>
//       </ReactDocument>
//     const blob = await pdf(RootPDF).toBlob()
//     const _url = URL.createObjectURL(blob)
//     const link = document.createElement('a')
//     const title = getTitle(html)?.textContent
//     link.href = _url
//     link.download = `${title}.docx`;
//     link.target = "_blank"
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//     URL.revokeObjectURL(_url)
// 
//     setIsExporting(false)
//   }
//   return { save, isExporting }
// }

// const LIGHT_MODE_STYLES = {
//   background: rgb(1, 1, 1),
//   text: rgb(0, 0, 0),
//   link: rgb(0, 0.33, 1),
//   baseFontSize: 12,
//   padding: 50,
//   pagePaddingTop: 72, // 1 inch (72 points) top padding
//   pagePaddingHorizontal: 50,
//   verticalMargin: 8,
//   codeBackground: rgb(0.95, 0.95, 0.95),
//   codeBorder: rgb(0.8, 0.8, 0.8),
//   bulletRadius: 2,
//   checkboxSize: 8,
// };
// 
// 
// const convertStylesToPdfOptions = (element: HTMLElement) => {
//   const isCode = element.tagName === 'PRE' || element.tagName === 'CODE';
//   co
//   const isListItem = element.tagName === 'LI';
//   const isTodo = element.classList.contains('todo-item');
// 
//   const baseStyles = {
//     // ... previous style conversions
//     isCode,
//     isList,
//     isListItem,
//     isTodo,
//     isChecked: element.classList.contains('checked'),
//     listDepth: parseInt(element.dataset.listDepth || '0'),
//     listType: element.parentElement?.tagName === 'OL' ? 'ordered' : 'unordered',
//   };
// 
//   return baseStyles;
// };
// 
// 
// const parseColor = (color: string) => {
// /  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
//   return match ? rgb(
//     parseInt(match[1]) / 255,
//     parseInt(match[2]) / 255,
//     parseInt(match[3]) / 255
//   ) : LIGHT_MODE_STYLES.text;
// };
// 
// const parseTailwindColor = (color: string) => {
//   const colors: Record<string, [number, number, number]> = {
//     black: [0, 0, 0],
//     white: [1, 1, 1],
//     gray: [0.5, 0.5, 0.5],
//     red: [1, 0, 0],
//     blue: [0, 0.33, 1],
// /    // Add more Tailwind colors as needed
//   };
//   return colors[color] ? rgb(...colors[color]) : LIGHT_MODE_STYLES.text;
// };
// const processContentNode = async (
//   node: ChildNode,
//   pdfDoc: PDFDocument,
//   page: any,
//   state: {
//     yPosition: number;
//     listCounters: number[];
//     currentListDepth: number;
//   }
// ) => {
//   if (node.nodeType !== Node.ELEMENT_NODE) return;
// 
//   const element = node as HTMLElement;
//   const styles = convertStylesToPdfOptions(element);
//   const font = await pdfDoc.embedFont(
//     styles.isCode ? StandardFonts.Courier :
//     styles.fontWeight === 'bold' ? StandardFonts.HelveticaBold :
//         StandardFonts.Helvetica
//   );
// 
//   // Handle code blocks
//   if (styles.isCode) {
//     const text = element.textContent || '';
//     const padding = 8;
// 
//     // Draw code background
//     page.drawRectangle({
//       x: LIGHT_MODE_STYLES.pagePaddingHorizontal,
//       y: state.yPosition - padding,
//       width: page.getWidth() - (LIGHT_MODE_STYLES.pagePaddingHorizontal * 2),
//       height: styles.fontSize * 1.5 * (text.split('\n').length + 1),
//       color: LIGHT_MODE_STYLES.codeBackground,
//       borderColor: LIGHT_MODE_STYLES.codeBorder,
//       borderWidth: 1,
//     });
// 
//     // Draw code text
//     page.drawText(text, {
//       x: LIGHT_MODE_STYLES.pagePaddingHorizontal + padding,
//       y: state.yPosition,
//       size: styles.fontSize,
//       font,
//       color: styles.color,
//       lineHeight: styles.fontSize * 1.5,
//     });
// 
//     state.yPosition -= (text.split('\n').length * styles.fontSize * 1.5) + padding * 2;
//     return;
//   }
// 
//   // Handle lists
//   if (styles.isList) {
//     state.currentListDepth = styles.listDepth;
//     state.listCounters[state.currentListDepth] = 0;
//   }
// 
//   if (styles.isListItem) {
//     const indent = styles.listDepth * 20;
//     let bullet = '• ';
// 
//     if (styles.listType === 'ordered') {
//       state.listCounters[state.currentListDepth] += 1;
//       bullet = `${state.listCounters[state.currentListDepth]}. `;
//     }
// 
//     if (styles.isTodo) {
//       bullet = styles.isChecked ? '☒ ' : '☐ ';
//     }
// 
//     page.drawText(bullet, {
//       x: LIGHT_MODE_STYLES.pagePaddingHorizontal + indent,
//       y: state.yPosition,
//       size: styles.fontSize,
//       font,
//       color: styles.color,
//     });
// 
//     // Draw list item text
//     const text = element.textContent?.replace(/^\s*[\-*]\s/, '') || '';
//     page.drawText(text, {
//       x: LIGHT_MODE_STYLES.pagePaddingHorizontal + indent + 15,
//       y: state.yPosition,
//       size: styles.fontSize,
//       font,
//       color: styles.color,
//       maxWidth: page.getWidth() - (LIGHT_MODE_STYLES.pagePaddingHorizontal * 2) - indent - 15,
//       lineHeight: styles.fontSize * 1.5,
//     });
// 
//     state.yPosition -= styles.fontSize * 1.5;
//     return;
//   }
// 
//   export const useExportPdf = (html: string) => {
//     const [isExporting, setExporting] = useState(false);
// 
//     const save = async () => {
//       if (isExporting) return;
//       setExporting(true);
// 
//       try {
//         const pdfDoc = await PDFDocument.create();
//         const page = pdfDoc.addPage();
//         const { width, height } = page.getSize();
// 
//         // Create temp element with light mode styles
//         const element = document.createElement('div');
//         element.innerHTML = html;
//         document.body.appendChild(element);
//         const state = {
//           yPosition: height - LIGHT_MODE_STYLES.pagePaddingTop,
//           listCounters: [0],
//           currentListDepth: 0,
//         };
// 
//         const walkNodes = async (nodes: NodeListOf<ChildNode>) => {
//           for (const node of nodes) {
//             await processContentNode(node, pdfDoc, page, state);
//             if (node.childNodes.length > 0) {
//               await walkNodes(node.childNodes);
//             }
//           }
//         };
// 
//         await walkNodes(element.childNodes);
// 
//         // Process content with Tailwind styles
//         const blocks = Array.from(element.children);
//         let yPosition = height - LIGHT_MODE_STYLES.pagePaddingTop;
// 
// 
//         for (const block of blocks) {
//           const styles = convertStylesToPdfOptions(block as HTMLElement);
//           const font = await pdfDoc.embedFont(
//             styles.fontWeight === 'bold' ? StandardFonts.HelveticaBold : StandardFonts.Helvetica
//           );
//           const textHeight = font.heightAtSize(styles.fontSize);
// 
//           page.drawText(block.textContent || '', {
//             x: LIGHT_MODE_STYLES.pagePaddingHorizontal,
//             y: yPosition,
//             size: styles.fontSize,
//             font,
//             color: styles.color,
//             maxWidth: width - (LIGHT_MODE_STYLES.pagePaddingHorizontal * 2),
//             lineHeight: styles.fontSize * 1.5,
//           });
// 
//           yPosition -= textHeight + LIGHT_MODE_STYLES.verticalMargin; // Move cursor down
//         }
// 
//         document.body.removeChild(element);
// 
//         // Save and download
//         const pdfBytes = await pdfDoc.save();
//         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//         const url = URL.createObjectURL(blob);
// 
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `document-${Date.now()}.pdf`;
//         link.click();
//         URL.revokeObjectURL(url);
// 
//       } catch (error) {
//         console.error('PDF export failed:', error);
//       } finally {
//         setExporting(false);
//       }
//     };
// 
//     return { save, isExporting };
//   };
