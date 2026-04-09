# Accessibility Checklist

A concise, actionable guide for accessibility reviews in the mono-starter monorepo. Use this as a PR review checklist and a reference when building new features.

## Semantic HTML

- [ ] Use native interactive elements: `<button>` for actions, `<a>` for navigation, `<input>` for data entry
- [ ] Never attach `onClick` to a `<div>` or `<span>` — use a `<button>` instead
- [ ] Headings follow a logical hierarchy (h1 > h2 > h3) — don't skip levels
- [ ] Use landmark elements: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<aside>`
- [ ] Lists use `<ul>`/`<ol>` + `<li>`, not styled divs
- [ ] Tables use `<th>` with `scope` attributes for headers

## Forms

- [ ] Every input has a visible `<label>` associated via `htmlFor`/`id` (or use `FormLabel`/`FormControl` from `@mono/ui-web`)
- [ ] Required fields are marked with `aria-required="true"`
- [ ] Hint text uses `aria-describedby` linking to a description element
- [ ] Error messages use `role="alert"` so screen readers announce them immediately (built into `FormMessage`)
- [ ] Invalid fields have `aria-invalid="true"` (built into `FormControl` when an error is present)
- [ ] Form submission status is communicated via an `aria-live` region

## Keyboard

- [ ] All interactive elements are reachable via Tab
- [ ] Focus order matches the visual layout — avoid positive `tabIndex`
- [ ] Focus indicators are visible (Tailwind's `focus-visible:ring-*` classes)
- [ ] Modals trap focus while open and restore it to the trigger on close (Radix Dialog handles this)
- [ ] Escape key closes overlays (dialogs, dropdowns, popovers)
- [ ] Skip navigation link is present on pages with repeated header/nav content

## ARIA

- [ ] Prefer native semantics over ARIA — a `<button>` is better than `<div role="button">`
- [ ] `aria-label` or `aria-labelledby` on elements that have no visible text (icon buttons, etc.)
- [ ] `aria-live="polite"` for dynamic content updates (notifications, status messages)
- [ ] `aria-live="assertive"` only for urgent messages (form errors)
- [ ] `aria-expanded` on triggers that show/hide content (Radix handles this for Dialog/Dropdown)
- [ ] Don't use `aria-hidden="true"` on focusable elements

## Images and Icons

- [ ] Informative images have descriptive `alt` text
- [ ] Decorative images use `alt=""` (empty alt) or `aria-hidden="true"`
- [ ] Icon-only buttons include `<span className="sr-only">Label</span>` for screen readers
- [ ] SVG icons have `aria-hidden="true"` when used alongside text

## Color and Contrast

- [ ] Text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- [ ] Information is never conveyed by color alone — use icons, text, or patterns as well
- [ ] Focus indicators have sufficient contrast against the background
- [ ] UI is usable in forced-colors / high-contrast mode

## Mobile (React Native)

- [ ] Interactive components have `accessibilityRole` ("button", "link", "header", etc.)
- [ ] `accessibilityLabel` provides a concise description for screen readers (VoiceOver/TalkBack)
- [ ] `accessibilityState` reflects `disabled`, `busy`, `selected`, `checked` as appropriate
- [ ] `accessibilityHint` describes the result of an action when the label alone is insufficient
- [ ] Loading states use `accessibilityLiveRegion="polite"` so screen readers announce changes
- [ ] Decorative elements use `importantForAccessibility="no"` (Android) or `accessibilityElementsHidden` (iOS)
- [ ] Touch targets are at least 44x44 points

## Testing

### Automated

- **ESLint**: `eslint-plugin-jsx-a11y` is configured in `@mono/config-eslint/next` — runs on every lint pass for web and admin apps
- **axe-core**: Add `@axe-core/playwright` to e2e tests for automated WCAG checks
- **Lighthouse**: Run the Accessibility audit in Chrome DevTools (target score: 90+)

### Manual

- **Keyboard-only testing**: Unplug the mouse and navigate the entire flow with Tab, Shift+Tab, Enter, Space, Escape, Arrow keys
- **Screen reader testing**:
  - macOS/iOS: VoiceOver (Cmd+F5 to toggle)
  - Android: TalkBack (Settings > Accessibility)
  - Windows: NVDA (free) or Narrator (built-in)
- **Zoom testing**: Verify layout at 200% browser zoom
- **Reduced motion**: Test with `prefers-reduced-motion: reduce` enabled

## Quick Reference: `@mono/ui-web` Built-in Accessibility

| Component | What it provides |
|-----------|-----------------|
| `Button` | Native `<button>`, `focus-visible` ring, disabled state |
| `Dialog` | Focus trap, Escape to close, focus restore, `aria-labelledby`, `aria-describedby`, sr-only close button |
| `DropdownMenu` | Menu role, roving tabindex, arrow key navigation, typeahead, Escape to close |
| `Input` | Native `<input>`, `focus-visible` ring, disabled styling |
| `Label` | Radix Label, `htmlFor` association |
| `FormControl` | `aria-describedby` (links to description or error), `aria-invalid` |
| `FormMessage` | `role="alert"`, `aria-live="assertive"` for immediate screen reader announcement |
| `CardTitle` | `<h3>` for document outline |
| `CardDescription` | `<p>` for semantic text |
| `Toaster` | Close button for keyboard dismissal, aria-live via Sonner |

## Quick Reference: `@mono/ui-mobile` Built-in Accessibility

| Component | What it provides |
|-----------|-----------------|
| `Button` | `accessibilityRole="button"`, `accessibilityState` (disabled, busy), auto `accessibilityLabel` from text children |
| `Card` | `accessibilityRole="button"` when pressable, `accessibilityLabel` prop |
| `TextField` | `accessibilityLabel` from label prop, `accessibilityState` (disabled), `accessibilityHint` with error text |
| `LoadingState` | `accessibilityRole="progressbar"`, `accessibilityLabel`, `accessibilityLiveRegion="polite"` |
| `EmptyState` | `accessibilityRole="summary"`, `accessibilityLabel` combining title and description |

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Accessibility Docs](https://react.dev/reference/react-dom/components#form-components)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
