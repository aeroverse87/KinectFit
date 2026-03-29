# Design System Document

## 1. Overview & Creative North Star: "The Ethereal Coach"

This design system is built to transform the often-clinical world of nutrition tracking into a premium, editorial experience. We are moving away from the "data-entry" feel of traditional apps toward **"The Ethereal Coach"**—a creative North Star that prioritizes breathing room, depth through luminosity, and an interface that feels like it’s floating in a digital void.

To achieve a high-end, bespoke feel, we reject the rigid, boxed-in layouts of the past decade. Instead, we embrace:
*   **Intentional Asymmetry:** Using white space (and "dark space") as a functional element to guide the eye toward AI-driven insights.
*   **Luminous Depth:** Replacing flat surfaces with "light-emitting" layers and glassmorphism.
*   **Editorial Scale:** Using massive typographic contrasts (e.g., `display-lg` next to `label-md`) to create a sophisticated, magazine-like hierarchy.

---

## 2. Colors & Surface Philosophy

Our palette is rooted in a deep, obsidian `background` (`#0b0e14`), allowing our vibrant `primary` (`#73ffe3`) and `secondary` (`#c57eff`) tones to act as light sources within the UI.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
*   **The Goal:** Seamless flow. 
*   **The Technique:** Define boundaries through background color shifts. A `surface-container-low` section sitting on a `surface` background is sufficient to denote a change in context.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical, translucent layers. Use the surface-container tiers to create "nested" depth:
1.  **Base:** `surface` (#0b0e14)
2.  **Sectioning:** `surface-container-low` (#10131a)
3.  **Interactive Cards:** `surface-container` (#161a21)
4.  **Floating Modals/Popovers:** `surface-container-highest` (#22262f)

### The "Glass & Gradient" Rule
To achieve a "futuristic but friendly" look, use Glassmorphism for floating elements (like the Bottom Navigation or AI Insight Cards). 
*   **Recipe:** Use `surface-variant` at 60% opacity with a `backdrop-filter: blur(20px)`.
*   **Signature Textures:** Apply a subtle linear gradient from `primary` (#73ffe3) to `primary-container` (#00f5d4) for high-value CTAs. This creates a "glow" that feels organic rather than a flat digital fill.

---

## 3. Typography: The Editorial Edge

We pair the geometric precision of **Manrope** for displays with the hyper-readability of **Inter** for data.

*   **Display & Headline (Manrope):** Use `display-lg` for daily calorie remaining or "big wins." These should be tracked tight with a slight negative `letter-spacing` (-0.02em) to feel premium.
*   **Title & Body (Inter):** These handle the heavy lifting. `title-lg` is reserved for meal names, while `body-md` is the standard for nutritional breakdowns.
*   **Label (Inter):** Use `label-md` in all-caps with increased letter-spacing (+0.05em) for category headers (e.g., "MACRONUTRIENTS") to evoke an authoritative, high-end feel.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are too "heavy" for this system. We use light and opacity to define space.

### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. For example, a `surface-container-lowest` card placed on a `surface-container-low` section creates a soft, natural lift without the need for a drop shadow.

### Ambient Shadows
When an element must float (e.g., a "Quick Log" button), use an **Ambient Shadow**:
*   **Blur:** 24px - 40px.
*   **Opacity:** 4% - 8%.
*   **Color:** Use a tinted version of `on-surface` (#ecedf6) rather than pure black. This mimics natural light bouncing off a dark surface.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., Input fields), use a **Ghost Border**:
*   **Value:** `outline-variant` (#45484f) at 20% opacity. 100% opaque borders are strictly forbidden as they break the "ethereal" illusion.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-container`). Roundedness: `full`. No border.
*   **Secondary:** Glassmorphic background (`surface-variant` at 40% + blur). Text color: `primary`.
*   **Tertiary:** No background. Text color: `on-surface-variant`.

### Cards & Lists
*   **The Rule:** No divider lines. Use `spacing-6` (1.5rem) to separate list items or subtle background shifts between `surface-container-low` and `surface-container`.
*   **Nutrition Cards:** Use `xl` (1.5rem) corner radius. Elements inside should feel "placed," not "crammed."

### AI Insight Chips
*   **Style:** `surface-bright` background with a `primary` glow (using a 2px `primary_dim` outer shadow). These should feel like active, living elements of the UI.

### Progress Visualizations (Data-First)
*   **Circular Macros:** Use thick stroke widths (12px+) with rounded caps. The "track" of the progress bar should be `surface-container-highest` to provide a recessed "etched" look.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. Place a large headline on the left and a small supporting label on the right to create dynamic tension.
*   **Do** use `primary_fixed` for success states and `error_dim` for "over-limit" warnings to maintain the dark-mode harmony.
*   **Do** allow background blurs to overlap. The "frosted glass" effect works best when you can see a hint of the content moving beneath it.

### Don't
*   **Don't** use 100% white (#ffffff). Use `on-background` (#ecedf6) to prevent eye strain and maintain the premium "muted" look.
*   **Don't** use standard 1px dividers. If you feel the need to separate content, use a background color change or an 8px vertical gap.
*   **Don't** use sharp corners. Everything must use a minimum of `md` (0.75rem) roundedness to maintain the "friendly" aspect of the brand.