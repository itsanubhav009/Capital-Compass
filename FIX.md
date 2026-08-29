> **Status: applied.** Points 1–4 are in the code; the category rename is now
> done at render time rather than in the admin panel — see `cardCategory()` in
> `src/lib/format.ts`.

# Card density

Comparing your screenshot against the reference side by side, four things
account for nearly all the difference.

## 1. Headlines clamp to two lines

The reference cuts them mid-sentence — "Small businesses adapt to new
digital". Yours run to three and four lines, which makes every card ~60%
taller and is the single biggest reason the grid does not match.

## 2. Square thumbnails, smaller

Reference is roughly 110×110. Yours were 140×104 landscape.

## 3. Category labels never wrap

"CAPITAL FLOW – INTERNATIONAL" wrapped to two lines in the right rail,
pushing everything below it out of alignment with the left rail. Now
`whitespace-nowrap` with truncation.

**Worth considering separately:** the reference uses one-word categories —
STARTUPS, WORLD, INSURANCE, FINANCE. Your section names are three and four
words. Even truncated they crowd the card. If you want the density to match
properly, shorten the display names in the admin panel: "Capital Flow –
India" → "India", "Capital Flow – International" → "International", "Smart
Money Insights" → "Smart Money". The nav can keep the long names; only the
card kicker needs to be short.

## 4. Tighter rows

`py-4` instead of `py-5`, and the gap between thumb and text reduced.

## Also

The hero in your screenshot is still the static `HeroCard`. The carousel from
`carousel-preloader.zip` has not been wired into `page.tsx` yet — that is
step 2 of its APPLY.md.
