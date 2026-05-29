---
name: Warm Bungeo
colors:
  surface: '#fff8f6'
  surface-dim: '#f8d1cb'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ee'
  surface-container: '#ffe9e5'
  surface-container-high: '#ffe2dd'
  surface-container-highest: '#ffdad4'
  on-surface: '#2b1613'
  on-surface-variant: '#4d4732'
  inverse-surface: '#422a26'
  inverse-on-surface: '#ffedea'
  outline: '#7e775f'
  outline-variant: '#d0c6ab'
  surface-tint: '#705d00'
  primary: '#705d00'
  on-primary: '#ffffff'
  primary-container: '#ffd700'
  on-primary-container: '#705e00'
  inverse-primary: '#e9c400'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fd8b00'
  on-secondary-container: '#603100'
  tertiary: '#635e53'
  on-tertiary: '#ffffff'
  tertiary-container: '#e0d9cb'
  on-tertiary-container: '#635e53'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe16d'
  primary-fixed-dim: '#e9c400'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#544600'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#e9e2d3'
  tertiary-fixed-dim: '#cdc6b8'
  on-tertiary-fixed: '#1e1b13'
  on-tertiary-fixed-variant: '#4b463c'
  background: '#fff8f6'
  on-background: '#2b1613'
  surface-variant: '#ffdad4'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: auto
  max-width: 1200px
---

## Brand & Style

The design system is centered on the concept of "Susu-han" (humble/warm) joy. It targets a demographic that appreciates "kawaii" aesthetics and comfort food, evoking the nostalgia of winter street snacks through a modern, digital lens.

The visual style is **Tactile & Playful**, blending organic, hand-drawn elements with a clean, functional layout. It leverages soft, doughy roundedness and a "freshly baked" color palette. The UI should feel soft to the touch, using subtle skeuomorphic cues like squishy button interactions and paper-like textures to create an emotional connection with the user.

## Colors

The palette is inspired by the ingredients of Bungeoppang: golden batter, glowing embers, and sweet red bean filling.

- **Primary (Golden Yellow):** #FFD700. Used for key actions and branding highlights. It represents the perfectly toasted exterior of the pastry.
- **Secondary (Soft Orange):** #FF8C00. Used for interactive elements and accents that need higher energy.
- **Surface (Creamy Beige):** #FDF5E6. The primary background color, providing a softer, warmer alternative to pure white, reminiscent of uncooked batter or parchment paper.
- **Typography (Deep Chocolate):** #3E2723. A rich, dark brown used for all text to ensure high readability while maintaining the warm, organic feel. Avoid pure black (#000000) entirely.
- **Accent (Red Bean):** #8B0000. Reserved for status errors or specific "sweet" call-outs.

## Typography

This design system uses **Plus Jakarta Sans** for headlines and labels to provide a friendly, rounded geometric feel that matches the pastry shapes. **Be Vietnam Pro** is used for body text to maintain a contemporary, approachable atmosphere with excellent legibility.

Headlines should use tight letter-spacing to feel "plump" and substantial. Body text should maintain generous line heights to ensure the interface feels airy and unhurried. For an extra touch of brand personality, use "Display" styles for promotional banners or splash screens.

## Layout & Spacing

The layout utilizes a **fluid grid** for mobile and a **centered fixed-width container** for desktop to preserve the intimate feel of a mobile app. 

- **Mobile:** 4-column grid with 20px outer margins and 16px gutters.
- **Desktop:** 12-column grid within a 1200px max-width container.
- **Rhythm:** An 8px base unit (with 4px increments for tight elements) ensures consistency. Use generous vertical padding (`xl`) between sections to prevent the UI from feeling cluttered, reinforcing the "cozy" brand pillar.

## Elevation & Depth

Depth is achieved through **Ambient Shadows** and **Tonal Layering** rather than harsh outlines.

- **Soft Depth:** Use very diffused shadows with a slight tint of the `Neutral` (Chocolate) color at low opacity (e.g., `rgba(62, 39, 35, 0.08)`).
- **Physicality:** Cards should appear slightly "lifted" from the Creamy Beige background.
- **Interaction:** When pressed, buttons should "sink" (remove shadow and scale down slightly to 0.98), mimicking the tactile sensation of pressing into soft dough.
- **Backdrop:** Use a subtle "steam" blur (10px - 15px) for overlays and modals to maintain the warm food aesthetic.

## Shapes

The shape language is defined by **Softness**. Every corner should be rounded to avoid "stinging" the user's eye. 

Standard components use a 0.5rem (8px) radius, while primary buttons and feature cards use 1rem (16px) or larger to emphasize their friendly nature. Search bars and tags should be fully pill-shaped (rounded-full) to mimic the silhouette of a Bungeoppang pastry. Avoid 90-degree angles entirely in the interface.

## Components

- **Buttons:** Use high-contrast Golden Yellow with Deep Chocolate text. Primary buttons are "squishy" (pill-shaped with soft shadows). Secondary buttons use a thick 2px border in Chocolate with no fill.
- **Cards:** White or very light beige containers with `rounded-xl` corners. Include a playful, hand-drawn border (1px, irregular) for "Special Pick" items.
- **Chips/Tags:** Used for flavors (e.g., "Red Bean", "Custard"). These should be pill-shaped with background colors derived from the flavor (e.g., soft pink for strawberry, cream for custard).
- **Input Fields:** Soft beige backgrounds with deep brown placeholder text. Focus states should use a thick Golden Yellow glow.
- **Navigation:** Bottom bar on mobile uses a slight "arc" shape or a floating "island" look rather than a flat edge-to-edge bar.
- **Illustrations:** Incorporate hand-drawn "steam" lines, crumbs, or tiny fish-fin motifs near the corners of images to reinforce the craft-made feel.