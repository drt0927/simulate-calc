# Simulate Calc - Project Rules & Conventions

## 1. Project Structure
- **Root**: `index.html` (Landing page listing all calculators).
- **Calculators**: Each calculator resides in its own subdirectory (e.g., `/housing-subscription/`, `/childcare/`).
- **Assets**: Shared resources are located in `/assets/`.
    - CSS: `/assets/css/common.css` (Bootstrap overrides, common component styles).
    - JS: `/assets/js/common.js` (Common utilities).

## 2. Technology Stack
- **Framework**: Bootstrap 5 (CDN).
- **Fonts**: Google Fonts 'Noto Sans KR' (Weights: 300, 400, 500, 700).
- **Icons**: Bootstrap Icons (if needed).

## 3. Design System (UI/UX)
- **Color Palette**:
    - Primary: Blue (`#2563eb`, `var(--primary-color)`).
    - Background: Light Gray (`#f8fafc`, `bg-light`).
- **Layout**:
    - **Container**: Standard Bootstrap `.container` with `py-5`.
    - **Cards**: Inputs and Results are grouped in `.card` with `border-0`, `shadow-sm` (or `shadow-lg` for main components), and rounded corners (`rounded-4`).
    - **Input Groups**: Use `.section-group` class for grouping related inputs with a left border highlight on hover.
- **Key Elements**:
    - **Badges**: Use `.point-badge` for highlighting key metrics (e.g., scores) next to labels.
    - **Result Box**: Distinct background (e.g., `bg-primary bg-opacity-10`) to highlight the final calculation result.
    - **Accordion**: "Source & Reference" info should be in an accordion at the bottom.
        - **Default State**: Open by default (add `.show` class to collapse div, `aria-expanded="true"` to button).

## 4. SEO Requirements (Must Include)
Every `index.html` must include:
- **Title**: Descriptive title ending with key criteria (e.g., " - 청약Home 기준").
- **Meta Tags**:
    - `description`: 1-2 sentences summarizing the tool.
    - `keywords`: Relevant search terms.
    - `author`: "Simulate Calc".
    - `robots`: "index, follow".
- **Canonical Link**: `<link rel="canonical" href="...">`.
- **Open Graph (OG)**: `og:title`, `og:description`, `og:image`, `og:url`.
- **Twitter Card**: `twitter:card`, `twitter:title`, `twitter:description`.
- **Structured Data (JSON-LD)**:
    - `@type`: "WebApplication".
    - `applicationCategory`: "FinanceApplication".

## 5. Coding Conventions
- **HTML**: Semantic tags (`main`, `section`, `h1`~`h6`).
- **CSS**: Use `common.css` for base styles. Page-specific styles should be minimal or in a dedicated `style.css` if complex.
- **JS**: Logic should be in `script.js`, avoiding inline scripts.
- **Pathing**: Use relative paths or root-relative paths consistent with GitHub Pages hosting (usually root-relative `/simulate-calc/...` or relative `../`).

## 6. Logic & Verification
- **Reliable Sources**: When developing a new calculator, the calculation formula MUST be researched and verified from reliable sources (e.g., official government websites, statutes).
- **Source Citation**: Always include a clearly visible section citing the official source of the calculation logic (URL, Law Name).
- **Disclaimer**: Include a disclaimer that results are for simulation/reference only.
