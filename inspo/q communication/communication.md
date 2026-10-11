# Design Communication Guide

This file is here so we can speak the same design language.

You do not need to name things in formal design terms. If you say the shorthand names below, I will map them to the right visual treatment and use that language when I build new components.

## Core Rule

When you reference one of these terms, I should treat it as a design direction, not just a single image.

That means I should reuse the pattern:
- composition
- hierarchy
- mood
- motion style
- color behavior
- overlay treatment

Not just copy the exact picture.

## Shared Shorthand

### `schoolbanner`
Reference:
- `inspo/q communication/schoolbanner.jpg`
- `inspo/q communication/image.png`

Meaning:
- big editorial page banner
- oversized headline
- giant faded ghost word in background
- red-to-black or team-to-black gradient wash
- small uppercase supporting line
- wide cinematic layout

Use this when:
- building top-of-page hub banners
- making a page feel like a magazine cover
- we want bold hierarchy first, details second

What I should hear when you say it:
- "Make this read like a major section landing page"

### `watermark`
Reference:
- `inspo/q communication/watermark.jpg`

Meaning:
- large low-opacity background mark
- usually a team lettermark, logo, or word
- sits behind content, not competing with it
- should feel embedded in the surface, not pasted on top

Use this when:
- a card or banner needs more identity
- a background feels too empty
- we want branding without adding visual clutter

What I should hear when you say it:
- "Add a ghosted brand layer behind the content"

### `team gradient`
Reference:
- `inspo/q communication/team gradient.jpg`

Meaning:
- thin horizontal identity strip
- team color fading into dark background
- logo plus short team label
- compact scoreboard or record presentation

Use this when:
- making team headers
- standings strips
- schedule rows
- small identity bars inside larger cards

What I should hear when you say it:
- "Anchor this with a clean team-branded strip"

### `player avy`
Reference:
- `inspo/q communication/player avy.jpg`

Meaning:
- tightly cropped portrait
- dramatic close-up
- face-forward, not full-body
- image fades into dark or team-color overlay
- should feel intense and premium, not like a roster thumbnail

Use this when:
- spotlighting a player
- building glory-player treatments
- creating hero cards, profile headers, or matchup spotlights

What I should hear when you say it:
- "Use a bold portrait crop with editorial presence"

Notes:
- `avy` = avatar / portrait shorthand
- if you say `player avy`, I should think portrait-led card immediately

### `logo`
Reference:
- `inspo/q communication/logo.jpg`

Meaning:
- isolated team mark on dark field
- simple, centered, premium logo presentation
- useful when the brand mark itself should carry the visual

Use this when:
- logo-first cards
- identity chips
- matchup badges
- minimalist team blocks

What I should hear when you say it:
- "Let the mark do the work"

### `cool`
Reference:
- `inspo/q communication/cool.jpg`

Meaning:
- sleek dark sports interface detail
- compact left-aligned logo + team name
- subtle trim lines
- restrained but sharp
- more "broadcast package" than "poster"

Use this when:
- score headers
- team tabs
- compact nav strips
- lower-third style UI

What I should hear when you say it:
- "Make it feel sleek and athletic without being loud"

## Design Language We Like

These references point to a few strong recurring patterns. Unless you tell me otherwise, I should bias toward these:

- oversized headlines with tight letter spacing
- ghosted background text or marks
- strong gradient atmosphere instead of flat fills
- dark surfaces with team-color influence
- premium portrait crops instead of generic circles
- logo plates that feel intentional, not decorative
- compact uppercase metadata lines
- editorial sports-magazine hierarchy

## What To Avoid

If you point to these references, I should avoid:

- plain flat cards with no depth
- generic dashboard boxes with weak hierarchy
- tiny logos with no presence
- default circular avatars unless there is a strong reason
- overly clean corporate SaaS styling
- random accent colors that ignore team identity
- white empty backgrounds

## Translation Examples

If you say:

`Use player avy here`
- I should probably make the card portrait-led
- tighter crop
- more dramatic overlay
- bigger name or stat treatment

`Give this a watermark`
- I should add a large low-opacity logo or word behind the content

`Make this more like schoolbanner`
- I should push the hierarchy harder
- bigger headline
- stronger gradient
- ghost word in the background

`Use team gradient for this`
- I should make a horizontal branded strip with logo, team label, and a fade into dark

`Make this more logo`
- I should give the team mark more space and more importance

`Make it cool`
- I should tighten the UI, simplify it, and make it feel sharper rather than louder

## Working Agreement

When you use one of these shorthand labels, I should:

1. assume you are referring to the visual pattern, not the exact file
2. reuse that pattern in the current page's design language
3. preserve our system:
   Chakra, PageShell, team colors, dark editorial look
4. ask only if the shorthand could reasonably mean two very different things

## Current Vocabulary We Can Use

Safe shorthand terms going forward:

- `schoolbanner`
- `watermark`
- `team gradient`
- `player avy`
- `logo`
- `cool`

If you create more reference images later, add them here and I will treat them as part of the shared design vocabulary.
