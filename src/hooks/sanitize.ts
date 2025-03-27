import DOMPurify from 'dompurify'
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'strong', 'em', 'ul', 'ol', 'li',
  'img', 'span', 'div', 'br', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
];

const ALLOWED_ATTRS = {
  '*': ['class', 'style'],
  img: ['src', 'alt', 'width', 'height', 'data-*'],
  a: ['href', 'target', 'rel'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan']
};

// Sanitization configuration
const sanitizeConfig = {
  ALLOWED_TAGS,
  ALLOWED_ATTRS,
  ALLOW_DATA_ATTR: true,
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: [
    'onclick',
    'onload',
    'onerror',
    'style',
    'xml',
    'javascript',
    'vbscript'
  ],
  ADD_ATTR: ['data-safe'],
  ADD_TAGS: [],
  KEEP_CONTENT: true
};


export const useSanitize = (dirtyHtml: string) => {
  try {
    return DOMPurify.sanitize(dirtyHtml, sanitizeConfig)
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/&#([0-9]+);/g, (_, num) => {
        return String.fromCharCode(parseInt(num, 10));
      });
  } catch (error) {
    console.error('Sanitization error:', error);
    return '';
  }
}
