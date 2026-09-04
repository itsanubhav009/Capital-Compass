import type { CollectionConfig } from 'payload'

/** "bus_post_04-min.jpg" -> "Bus post 04" — a usable alt text, not a filename. */
const altFromFilename = (filename?: string | null): string => {
  if (!filename) return 'Image'
  const base = filename.replace(/\.[a-z0-9]+$/i, '')
  const words = base
    .replace(/[-_]+/g, ' ')
    .replace(/\b(min|final|copy|edited|small|large|scaled|\d{3,4}x\d{3,4})\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!words) return 'Image'
  return words.charAt(0).toUpperCase() + words.slice(1)
}

const MAX_BYTES = 8_000_000

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Images' },
  admin: {
    group: 'Library',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'credit', 'updatedAt'],
    description:
      'Drop in JPG, PNG or WebP up to 8MB. Every size the site needs is generated on upload — never resize by hand. To pull one in from another site, use Add from URL.',
    components: { beforeList: ['/admin/AddImageFromUrl#default'] },
  },
  access: {
    // Public read so images render for visitors; write requires a logged-in
    // user. Without the last three, uploads return 403 even for the owner.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    // Sharp generates these on upload, so the client never resizes anything.
    imageSizes: [
      { name: 'thumb', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 800 },
      { name: 'wide', width: 1600 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    formatOptions: { format: 'webp', options: { quality: 80 } },
    mimeTypes: ['image/*'],
    focalPoint: true,
  },
  endpoints: [
    {
      path: '/from-url',
      method: 'post',
      /**
       * Import an image by pasting its address.
       *
       * Payload's upload field takes a file, not a link, so an editor holding
       * a URL had no way in but "download it, then upload it". This does that
       * round trip on the server: fetch the bytes, hand them to the normal
       * create so the same resizing, WebP conversion and storage apply.
       */
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Sign in first.' }, { status: 403 })
        }

        let body: any = {}
        try {
          body = typeof req.json === 'function' ? await req.json() : {}
        } catch {
          return Response.json({ error: 'Could not read the request.' }, { status: 400 })
        }

        const raw = String(body?.url ?? '').trim()
        if (!raw) return Response.json({ error: 'Paste an image address first.' }, { status: 400 })

        let target: URL
        try {
          target = new URL(raw)
        } catch {
          return Response.json({ error: 'That is not a valid web address.' }, { status: 400 })
        }
        if (target.protocol !== 'http:' && target.protocol !== 'https:') {
          return Response.json({ error: 'Only http and https addresses work.' }, { status: 400 })
        }

        let res: globalThis.Response
        try {
          res = await fetch(target, { redirect: 'follow' })
        } catch {
          return Response.json(
            { error: 'Could not reach that address. Check the link and try again.' },
            { status: 502 },
          )
        }
        if (!res.ok) {
          return Response.json(
            { error: `That address returned ${res.status}. It may need a login, or be gone.` },
            { status: 502 },
          )
        }

        const mimeType = (res.headers.get('content-type') ?? '').split(';')[0].trim()
        if (!mimeType.startsWith('image/')) {
          return Response.json(
            { error: `That link is ${mimeType || 'not an image'}. Paste a direct link to an image file.` },
            { status: 415 },
          )
        }

        const bytes = Buffer.from(await res.arrayBuffer())
        if (bytes.byteLength === 0) {
          return Response.json({ error: 'That image came back empty.' }, { status: 502 })
        }
        if (bytes.byteLength > MAX_BYTES) {
          const mb = (bytes.byteLength / 1_000_000).toFixed(1)
          return Response.json(
            { error: `That image is ${mb}MB. The limit is 8MB.` },
            { status: 413 },
          )
        }

        const guessed = decodeURIComponent(target.pathname.split('/').pop() || 'image')
        const name = /\.[a-z0-9]+$/i.test(guessed)
          ? guessed
          : `${guessed}.${mimeType.split('/')[1] || 'jpg'}`

        try {
          const doc = await req.payload.create({
            collection: 'media',
            data: { alt: String(body?.alt ?? '').trim() || altFromFilename(name) } as any,
            file: { data: bytes, mimetype: mimeType, name, size: bytes.byteLength },
          })
          return Response.json({ doc }, { status: 201 })
        } catch (e: any) {
          return Response.json(
            { error: e?.message || 'Payload could not store that image.' },
            { status: 500 },
          )
        }
      },
    },
  ],
  fields: [
    {
      name: 'alt',
      type: 'text',
      /**
       * Not required.
       *
       * It was, and that quietly blocked uploads: the drawer refuses to save
       * without it, which reads as "the upload is broken" rather than "one
       * field is missing". A filename-derived value goes in instead, so the
       * image lands and the text can be improved afterwards.
       */
      admin: {
        description:
          'Describe the image in one short sentence, for screen readers and search engines. Filled in from the filename if you leave it blank — worth rewriting.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            typeof value === 'string' && value.trim().length
              ? value
              : altFromFilename((data as any)?.filename),
        ],
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer or source, if one needs crediting.' },
    },
  ],
}
