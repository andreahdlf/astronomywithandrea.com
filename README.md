# astronomywithandrea.com

The personal site of Andrea Henderson de la Fuente. A plain static site: one HTML page,
one stylesheet, one script, no build step, no framework. Open `index.html` in a browser
and it works.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole page: hero, about, research, ClumpScope, newsletter, writing, coming soon, footer. All the text lives here. |
| `css/style.css` | Colours, type sizes, layout. The colours and spacing are set at the top in `:root`. |
| `js/main.js` | The starfield, the galaxy fly-in, the pink H-alpha dots, the fade-in of sections, the cursor glow. |
| `images/` | All pictures. `CREDITS.md` records where the galaxy image came from and its licence. |
| `favicon.svg`, `apple-touch-icon.png` | The little icon in the browser tab and on an iPhone home screen. |
| `CNAME` | Tells GitHub Pages the custom domain. Do not delete. |
| `robots.txt`, `sitemap.xml` | For search engines. |
| `.nojekyll` | Tells GitHub Pages to serve the files exactly as they are. |
| `concepts/` | The three early hero mock-ups. Safe to delete once the site is live. |

## Changing text

Everything is in `index.html`. Search for the section you want (each one starts with a
big comment like `2. ABOUT`) and edit the words between the tags. Lines marked `TODO`
are things still to fill in; they show in yellow on the page until you replace or delete them.

## Changing images

1. Export the photo as JPEG or PNG at the size below, then convert it to WebP, which is
   much smaller. On a Mac with Homebrew: `brew install webp`, then for example

       cwebp -q 78 -resize 1600 0 portrait.jpg -o images/portrait.webp

   (`-resize 1600 0` means 1600 px wide, height kept in proportion.)
2. Put the file in `images/` with the exact name below. The page picks it up automatically.

| File name | Used in | Suggested size |
|---|---|---|
| `images/portrait.webp` | About | 1600 px tall, 4:5 shape |
| `images/telescope.webp` | Research | 2000 px wide, 16:9 |
| `images/outreach.webp` | Writing and outreach | 2000 px wide, 16:9 |
| `images/book-cover.webp` | Writing and outreach | 1200 px tall |
| `images/og-image.jpg` | Link previews (WhatsApp, Instagram, iMessage) | exactly 1200 x 630 |
| `images/galaxy-ngc6744-2000.webp` and `-1200.webp` | Hero (desktop and phone) | square, 2000 and 1200 px |

To use a different hero galaxy, replace the two `galaxy-ngc6744-*` files (and the tiny
40 px `-tiny` one, which is the blurred placeholder) and update the credit line in the
footer of `index.html` and in `images/CREDITS.md`.

## The ClumpScope section

The "Try it now" box is a small demo written in `js/try-clumps.js`: three example maps from
ClumpScope (two tutorial pictures and one real galaxy from the sample, see `images/CREDITS.md`),
the visitor drags circles, presses Submit and gets a verdict. To use a different map, save it
as a square WebP over one of `images/try-galaxy-1/2/3.webp` and update the clump positions in
the GALAXIES list at the top of the script. Nothing
is saved. The reference clump positions and the wording of each verdict are in the `GALAXIES`
list at the top of that file. The "Start classifying" button goes to clumpscope.com.

## The latest Instagram posts

The Writing and outreach section is three full-width "story" cards (magazine, book,
Instagram). On a desktop they stack as you scroll: each card sticks near the top of the
window and the next one slides up over it. This is plain CSS (`position: sticky` in the
WRITING AND OUTREACH block of `css/style.css`); on phones the cards just sit in a column.
The magazine card shows a drawn crescent moon because there is no magazine photo yet; the
comment above it in `index.html` says how to swap in a photo.

The three small thumbnails inside the Instagram card (section `5. WRITING AND OUTREACH` in
`index.html`) are updated by hand, newest first:

1. On Instagram, open the post, tap the three dots, choose Copy link, and paste it into
   the `href="..."` of the first `<a class="ig-post">`.
2. Save the post's cover image, convert it to a portrait WebP of 480 by 640 px (the 3:4 shape
   Instagram uses), and save it as `images/ig-1.webp`. Repeat for `ig-2` and `ig-3`.

Instagram does not let a plain website fetch posts automatically without an app token
that would have to be kept secret, so this manual list is the simple, reliable version.

## The newsletter form

The form in `index.html` (section `4. NEWSLETTER`) posts directly to the Kit form called
"Newsletter site" (form id 10153308). It sends three things: first name, email, and the
"Stage" custom field. After submitting, Kit shows its own confirmation page.

To use Kit's own embed instead: in Kit, open the form, choose Publish, copy the
JavaScript embed `<script>` tag, delete the whole `<form>...</form>` block in `index.html`
and paste the tag in its place.

## Previewing locally

Any static server works. On a Mac:

    cd astronomywithandrea
    python3 -m http.server 8765

then open http://localhost:8765 in a browser.

## Publishing

See `DEPLOY.md` for the GitHub Pages and DNS steps.

## Motion and accessibility

Everything animated has a calm version for people who have "Reduce motion" switched on
in their system settings: the stars stop twinkling, the dots stop pulsing, and sections
appear without fading. The text colours keep at least 7:1 contrast on the background.
