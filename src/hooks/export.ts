import { Packer, Paragraph, ImageRun, TextRun, HeadingLevel, IImageOptions, Document as Documentx } from 'docx'
import { useSanitize } from './sanitize'
import { useState } from 'react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { PDFDownloadLink, Document as ReactDocument, Page, Image, Text, View, Link, StyleSheet, Font } from '@react-pdf/renderer'
import TurndownService from 'turndown';

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
      const cleanHtml = useSanitize(html)
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

/// WARNING: Loop on the element before turning them into React PDF Component
/// Add 'data-pdfId' when looping first time
type Block = {
  id: string,
  type: BlockType,
  headingLevel?: number
  content: string | Blob | Uint8Array | null,
  src?: string,
  children: Block[]
}
enum BlockType {
  Document,
  Container,
  BlockText,
  Text,
  Image,
  Link,
  CodeBlock
}
const rootBlock: Block = {
  type: BlockType.Document,
  children: [],
  content: null,
  id: '0'
}
function treverse(node: Element, nodeBlock: Block, prefix = "") {
  // Generate a unique ID based on hierarchy
  if (node.children.length === 0) {
    nodeBlock.children = []
  }
  Array.from(node.children).forEach((child, index) => {
    const newId = prefix ? `${prefix}-${index + 1}` : `${index + 1}`;
    child.setAttribute("data-pdf-id", newId);
    let block: Block = {
      type: BlockType.Container,
      id: newId,
      content: null,
      children: []
    }
    switch (child.tagName) {
      case 'p':
        block.type = BlockType.BlockText
        break
      case 'a':
        let value = child.getAttribute('href')
        if (value) block.src = value
        block.type = BlockType.Link
        break
      case 'img':
        block.type = BlockType.Image
        break
      case 'pre':
        block.type = BlockType.CodeBlock
        break
      default:
        block.type = BlockType.Text
    }
    if (child.tagName.startsWith('h') && Number.isInteger(child.tagName[1])) {
      const level = child.tagName[1]
      block.type = BlockType.BlockText
      block.headingLevel = parseInt(level)
    }
    block.content = child.textContent
    block.id = newId

    // Recursively process children
    nodeBlock.children.push(block)
    treverse(child, block, newId);
  });
}

const processType = (dom: Document) => {
  const root = dom.body.children[0]
  const ids = ['0']
  let level = 0
  root.setAttribute('data-pdfid', ids[0])
  let i = 0
  let parent = root
  let openedParent = false
  let currentChild = 1
  // looping children of the currentChild
  for (const child of parent.children) {
    i++
    // checks if we finished looping inside this child
    openedParent = !(i === parent.children.length)
    if (!openedParent) {
      // if we finished this level children
      if (currentChild === parent.children.length) { }
      // if we finished this level children
      else {

      }
    }
    child.setAttribute('data-pdfparent', ids.join('-'))
    child.setAttribute('data-pdfid', i.toString())
    // checks if have children
    if (child.children.length > 0) {
    }
  }
}

export const useExportPdf = () => {

}

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
