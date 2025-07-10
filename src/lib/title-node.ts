import { Node } from "@tiptap/core"

export const TitleBlock = Node.create({
  name: "undeletableBlock",
  group: "block",
  content: "text*", // Allows nested blocks
  defining: true, // Ensures it's a separate block


  addAttributes() {
    return {
      level: {
        default: 1,
        parseHTML: element => element.tagName.slice(1),
        renderHTML: attributes => {
          return { level: attributes.level }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: "h1[data-undeletable]#title-markdown" }]
  },

  renderHTML() {
    return ["h1", { "data-undeletable": "true", id: 'title-markdown' }, 0]
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $anchor } = selection

        // Check if cursor is inside the undeletable block
        const node = $anchor.node()
        if (node?.type?.name === "undeletableBlock" && $anchor.parentOffset === 0) {
          return true // Prevent deletion
        }

        return false
      },
      Delete: () => true, // Block delete key
    }
  },
})
