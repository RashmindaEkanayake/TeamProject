---
name: InventoryFlow ERP
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  table-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-width: 260px
  container-max-width: 1440px
  gutter: 16px
---

## Brand & Style

The design system is engineered for high-utility enterprise resource planning. It prioritizes clarity, structural integrity, and cognitive efficiency to reduce the mental load of managing complex inventory and sales data.

The design style is **Corporate / Modern**, characterized by a systematic approach to hierarchy. It utilizes a structured "Information First" philosophy, where the interface recedes to allow critical data—such as stock levels and transaction statuses—to take center stage. The aesthetic is professional, grounded, and reliable, utilizing subtle depth and a restrained color palette to signal enterprise-grade stability.

**Key Principles:**
- **Density with Clarity:** Maximizing information density without sacrificing legibility.
- **Predictable Navigation:** A persistent sidebar-driven architecture for rapid context switching.
- **Action-Oriented:** Using color purposefully to highlight statuses and required user interventions.

## Colors

The color system is divided into functional tiers to support the complex state management inherent in an ERP.

- **Primary (Deep Navy):** Reserved for high-level structural elements like the sidebar and primary headers, establishing a foundation of authority.
- **Secondary/Accent (Professional Blue):** Used strictly for interactive elements, links, and primary calls-to-action.
- **Functional/Semantic Colors:** These colors (Emerald, Amber, Rose) are tied directly to data states. Use them for status badges, progress bars, and critical alerts.
- **Neutral Palette:** Employs a range of cool grays to define borders, secondary text, and background layers, ensuring the interface feels airy despite high data density.

## Typography

This design system utilizes **Inter** for its exceptional legibility and neutral tone, which is critical for data-heavy ERP environments.

**Usage Guidelines:**
- **Hierarchy:** Use `display-lg` and `headline-md` only for dashboard overviews. For standard page headers, use `headline-sm`.
- **Data Tables:** Most tabular data should use `table-data` (13px) to balance density and readability. Use tabular lining figures (if supported) to ensure columns of numbers align perfectly.
- **Labels:** `label-md` is intended for table headers and small section titles, using uppercase and increased tracking to differentiate from interactive data.
- **Scaling:** On mobile devices, `display-lg` should scale down to 24px (`headline-md` equivalent) to prevent overflow.

## Layout & Spacing

The layout is built on a **12-column fluid grid** with fixed-width constraints for readability on ultra-wide monitors.

**Layout Structure:**
- **Sidebar:** A fixed 260px left-hand navigation allows for consistent access to core modules (Inventory, Sales, Reports).
- **Content Area:** A fluid container that fills the remaining width, capped at 1440px for optimal line length and data scanning.
- **Spacing Rhythm:** Based on a 4px baseline. Use `16px (md)` for standard component padding and `24px (lg)` for page margins and spacing between major cards.
- **Responsive Behavior:** 
  - **Desktop (>1024px):** Fixed sidebar, full 12-column grid.
  - **Tablet (768px - 1023px):** Sidebar collapses to icons only (64px width); content margins reduce to 16px.
  - **Mobile (<767px):** Sidebar moves to an off-canvas drawer; vertical stacked layout for cards; data tables transition to horizontal scroll or card-based list view.

## Elevation & Depth

To maintain a clean, professional appearance, depth is conveyed through **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Background):** `#F8FAFC` (Neutral Gray). This is the base canvas.
- **Level 1 (Cards/Surface):** Pure white `#FFFFFF` with a 1px border of `#E2E8F0`. Use a subtle shadow: `0px 1px 3px rgba(15, 23, 42, 0.08)`.
- **Level 2 (Hover/Active):** Slightly more pronounced shadow to indicate interactivity: `0px 4px 6px rgba(15, 23, 42, 0.12)`.
- **Level 3 (Modals/Popovers):** Focused depth with a significant blur and protective backdrop: `0px 20px 25px rgba(15, 23, 42, 0.15)`.

Avoid heavy gradients. Depth should feel physical but restrained, ensuring the focus remains on the data.

## Shapes

The design system uses a **Soft (1)** roundedness profile to project modernism while maintaining the structured feel of an enterprise tool.

- **Components (Buttons, Inputs):** 0.25rem (4px) corner radius.
- **Containers (Cards, Modals):** 0.5rem (8px) corner radius.
- **Status Badges:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.
- **Selection States:** A 2px vertical bar on the left side of a sidebar item or table row to denote "Active" or "Selected" states.

## Components

### Buttons & Actions
- **Primary:** Deep Navy background with White text. Used for "Save," "Confirm," or "Create."
- **Secondary:** White background with Professional Blue border and text. Used for "Cancel," "Edit," or "Export."
- **Ghost:** No background/border, Professional Blue text. Used for subtle actions within tables.

### Data Tables
- **Header:** Light gray background (`#F1F5F9`) with `label-md` typography.
- **Rows:** 1px bottom border (`#E2E8F0`). High contrast text for SKU/ID numbers.
- **Density:** 8px vertical padding for standard rows; 4px vertical padding for "Compact" mode.

### Input Fields
- **Default:** 1px border (`#CBD5E1`), 4px roundedness.
- **Focus:** 2px Professional Blue border with a soft blue outer glow.
- **Validation:** Clear error text in Rose (#E11D48) with matching border color.

### Status Badges
- **Style:** Light-colored background with high-contrast text of the same hue (e.g., Success: Light Green bg / Emerald Green text).
- **Iconography:** Use 12px icons within badges for quick visual identification (e.g., a checkmark for "Arrived").

### Inventory Cards
- Summary cards at the top of pages should feature a large "Stat" number, a title, and a trend indicator (Up/Down arrow). Use Professional Blue for the icon container to pull focus.