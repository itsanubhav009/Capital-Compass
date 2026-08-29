# Newsletter button colour

In `src/components/site.tsx`, inside `NewsletterForm`, the dark variant uses
brass for its button while every other action on the site uses the blue accent.
Find this line:

    dark ? 'bg-brass text-ink hover:bg-brass-soft' : 'bg-deep text-paper hover:bg-deep-soft'

Replace with:

    dark ? 'bg-accent text-white hover:bg-accent-soft' : 'bg-ink text-white hover:bg-bar-2'

And on the input above it, replace `focus:border-brass-soft` with
`focus:border-accent`.
