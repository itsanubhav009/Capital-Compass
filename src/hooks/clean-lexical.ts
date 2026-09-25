import type { FieldHook } from 'payload'

/**
 * Unwrap link nodes that have nowhere to go.
 *
 * Pasting from Google Docs or Word brings anchors with it. Headings arrive
 * wrapped in `<a>` tags that carry a bookmark name or an in-document
 * `#heading=h.xyz` target but no real href, and Lexical faithfully turns each
 * one into a link node with an empty url.
 *
 * The database accepts those happily. The admin form does not: every one
 * fails the link field's "Enter a URL" rule, so the document cannot be saved
 * or published and the editor is left with a list of errors pointing at text
 * they never meant to link. One paste produced fifteen.
 *
 * So empty links are unwrapped on the way in — the node goes, its text stays
 * exactly where it was. Nothing a reader would see is lost, because a link
 * with no destination renders as plain text anyway.
 */

type Node = Record<string, any>

const isEmptyLink = (node: Node): boolean => {
  if (node?.type !== 'link' && node?.type !== 'autolink') return false
  const fields = node.fields ?? {}
  const url = typeof fields.url === 'string' ? fields.url.trim() : ''
  // An internal link points at a document instead of a URL; that is valid.
  const hasDoc = fields.linkType === 'internal' && Boolean(fields.doc)
  if (hasDoc) return false
  // A bare fragment is a link to nowhere once the source document is gone.
  if (!url || url === '#') return true
  return false
}

/** Returns the cleaned tree and how many links were unwrapped. */
export function stripEmptyLinks<T>(value: T): { value: T; removed: number } {
  let removed = 0

  const walk = (node: Node): Node => {
    if (!node || typeof node !== 'object') return node

    if (Array.isArray(node.children)) {
      const out: Node[] = []
      for (const child of node.children) {
        if (isEmptyLink(child)) {
          removed++
          // Keep the words, drop the wrapper.
          const inner = Array.isArray(child.children) ? child.children.map(walk) : []
          out.push(...inner)
        } else {
          out.push(walk(child))
        }
      }
      return { ...node, children: out }
    }

    if (node.root) return { ...node, root: walk(node.root) }
    return node
  }

  if (!value || typeof value !== 'object') return { value, removed }
  return { value: walk(value as Node) as T, removed }
}

/**
 * Field hook for a richText body.
 *
 * beforeValidate rather than beforeChange, so the cleaned tree is what the
 * validator sees — running after it would leave the save still failing.
 */
export const cleanRichText: FieldHook = ({ value }) => {
  if (!value) return value
  const { value: cleaned } = stripEmptyLinks(value)
  return cleaned
}
