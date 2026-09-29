# UI Design Spec
**Product:** RunbookMind – AI SRE Agent
**Stack:** React + Vite + TypeScript, Tailwind (custom tokens only), Radix UI primitives (unstyled), custom SVG for the recall trace and learning curve

---

## 1. Subject, audience, job
- **Subject:** production incident response
- **Audience:** an on-call engineer, tired, reading fast, often at night
- **Primary job:** show *what happened before* next to *what is happening now*, and make the match between them obvious

## 2. Design idea
The interface is a **flight recorder**, not a chatbot and not a dashboard of cards. The current incident sits on the left. Past incidents sit on the right as margin notes. When memory is recalled, **lines are drawn from the current alert to each matched past incident**, and line weight shows match strength. That single moment is what people remember. Everything else stays quiet.

## 3. Design tokens

**Color**
| Name | Hex | Use |
|------|-----|-----|
| Fog | `#EDF0F3` | page ground |
| Paper | `#F8F9FA` | working area (tone shift, not cards) |
| Ink | `#1B2430` | text, rules |
| Signal | `#C2382D` | active incident, severity |
| Trace | `#2C5C8F` | memory: recall lines, matched incidents |
| Confirmed | `#2E7D5B` | fixes marked as worked |
| Caution | `#A86B12` | partial outcomes, degraded states |

Ink is a blue-tinted slate, not neutral black. Trace blue is reserved for memory only, so blue always means "from the past."

**Type**
- **Schibsted Grotesk**: UI and headings. Weights 400, 600, 800. Headlines set tight (-0.02em) and large.
- **JetBrains Mono**: only for real log lines, error signatures, and config values (actual code content).
- Scale (1.25 ratio): 13 / 16 / 20 / 25 / 31 / 39. Body 16px, line length under 72 characters.
- Sentence case everywhere. No all-caps labels, no tracked eyebrows.

**Shape and depth**
- Radius: 2px on inputs and buttons, 0 on panels. No pill shapes.
- No shadows. Separation comes from tone shifts (Fog vs Paper) and 1px Ink rules at 12% opacity.
- No gradients.

## 4. Layout

```
┌──────────────────────────────────────────────────────────────┐
│ RunbookMind              Memory [ on | off ]      Team: prod │
├───────────────────────────────┬──────────────────────────────┤
│ NOW                           │ BEFORE                       │
│                               │                              │
│ checkout-api  SEV1  03:12     │  INC-2041  Redis eviction    │
│ p99 4.2s, 500s rising      ●━━━━━━━━━━━━━  3 weeks ago       │
│                            ●━━━━━━━      INC-1987  Pool full │
│ Likely cause                  │          2 months ago        │
│  Redis maxmemory too low      │                              │
│  87% · matches INC-2041       │  INC-1720  Bad deploy        │
│                            ●╌╌╌╌╌╌╌╌╌╌   (weak match)        │
│ Fixes                         │                              │
│  1  Raise maxmemory to 4GB    │                              │
│     worked 3 of 3 times       │                              │
│     [Mark as worked] [Failed] │                              │
│  2  Set allkeys-lru           │                              │
├───────────────────────────────┴──────────────────────────────┤
│ Accuracy over incidents  ▁▂▂▃▄▅▆▆▇  (memory on vs off)        │
└──────────────────────────────────────────────────────────────┘
```

- **Alignment:** left-aligned throughout. Nothing centered except empty states.
- **Left column (Now):** alert, likely cause, ranked fixes. Fix numbers are real ranks, so numbering is justified here and nowhere else.
- **Right column (Before):** recalled incidents as plain rows separated by rules, not cards. Each row: ID, title, age, outcome.
- **Trace lines:** SVG paths from the alert to each row. Solid and thick for strong matches, dashed and thin for weak ones.
- **Bottom band:** learning curve, two lines (memory on in Trace blue, memory off in Ink at 40%).

## 5. Behavior and motion
- **One orchestrated moment:** when recall returns, trace lines draw in sequence (about 600ms total, strongest match first).
- **Responds to actions only:** marking a fix as worked turns its rule Confirmed green and adds a point to the curve. Toggling memory off collapses the trace and empties the right column.
- No entrance animations on sections, no hover effects on every row.
- Respect `prefers-reduced-motion`: lines appear instantly.

## 6. Memory on/off, made visible
- **On:** trace lines and Before column populated.
- **Off:** right column shows one sentence: "Memory is off. This answer comes from the model alone." Fixes lose their "worked 3 of 3 times" lines.
- The same alert answered both ways is the core of the demo.

## 7. Copy
- Buttons name the action: **Mark as worked**, **Mark as failed**, **Partly worked**.
- The confirmation echoes the action: "Marked as worked. Saved to memory."
- Empty state (no match): "No similar incident found. Resolve this one and it becomes the first entry."
- Error: "Memory didn't respond. Showing a model-only answer." (states what happened, no apology)
- Use plain words: "Likely cause", "Fixes", "Before", "Now". Avoid "insights", "intelligence", "AI-powered".

## 8. Accessibility and quality floor
- Contrast AA or better (Ink on Paper is above 12:1).
- Visible keyboard focus: 2px Trace outline with 2px offset.
- All actions reachable by keyboard; trace lines are decorative, and the same match data is in the row text.
- Responsive: below 900px the columns stack, Before goes under Now, and trace lines are hidden in favor of a "matches INC-2041 (strong)" text line.

## 9. What to avoid (so it doesn't look generated)
- Identical rounded cards with soft shadows
- Purple-to-blue gradients, glassmorphism, glowing borders
- Dark near-black with a single neon accent
- Cream background with serif and terracotta accent
- Emoji as icons, all-caps eyebrow labels, "→" on every button
- Default Tailwind palette colors (define the tokens above in `tailwind.config`)
- Stock library look: use Radix for behavior, style it yourself

## 10. Implementation notes
- Tokens live in `tailwind.config.ts` under `theme.extend.colors`; do not use default palette classes.
- Trace lines: absolutely positioned SVG overlay; compute path endpoints from row `getBoundingClientRect()` and recompute on resize.
- Learning curve: hand-built SVG (about 60 lines) or a minimal chart lib restyled to the tokens.
- Fonts: self-host Schibsted Grotesk and JetBrains Mono to avoid layout shift.
- Screens to build: one page, three regions (Now, Before, Accuracy), plus a history drawer opened from the header.

## 11. Design review notes
- First direction (dark slate with amber accents) was rejected as a common "ops dashboard" default. Switched to a light, cool ground so the blue memory color reads as meaningful.
- Cards for recalled incidents were replaced by ruled rows, because the trace lines need a clean vertical rhythm to connect to.
- The single bold element is the recall trace. Everything else is deliberately plain.
