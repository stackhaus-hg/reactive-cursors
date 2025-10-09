# Accessibility (A11Y) Standards Implementation

This document outlines the accessibility standards implemented in the reactive-cursors package to ensure inclusive design for all users.

## Overview

The reactive-cursors package follows Web Content Accessibility Guidelines (WCAG) 2.1 AA standards and implements comprehensive accessibility features to ensure the cursor component works well for users with diverse needs and preferences.

## Implemented A11Y Features

### 1. Respect for User Preferences

#### Reduced Motion Support

- **Detects**: `prefers-reduced-motion: reduce` media query
- **Action**: Automatically reduces animation durations to 10% of original or maximum 50ms
- **Fallback**: Completely disables cursor if `ignoreAccessibility` is false

#### High Contrast Mode

- **Detects**: `prefers-contrast: high` and `forced-colors: active` media queries
- **Action**: Automatically adjusts colors to high contrast equivalents
- **Fallback**: Uses system colors (`CanvasText`) in forced colors mode

#### Reduced Transparency

- **Detects**: `prefers-reduced-transparency: reduce` media query
- **Action**: Increases opacity values by 50% (capped at 100%) for better visibility

### 2. Device and Input Method Detection

#### Touch Device Handling

- **Detects**: Touch capabilities via `ontouchstart`, `maxTouchPoints`, and `pointer: coarse`
- **Action**: Disables cursor by default on touch devices (unless `allowTouch={true}`)
- **Reasoning**: Custom cursors are not meaningful on touch interfaces

#### Fine Pointer Detection

- **Detects**: `pointer: fine` media query
- **Action**: Ensures cursor only appears when fine pointer input is available
- **Fallback**: Gracefully degrades on devices without precise pointing

### 3. Screen Reader Compatibility

#### ARIA Attributes

- **Implementation**: `role="presentation"` and `aria-hidden="true"` on cursor container
- **Reasoning**: Cursor is purely visual decoration, should not be announced to screen readers

#### Optional Effect Announcements

- **Feature**: `announceEffects` prop enables screen reader notifications for click effects
- **Implementation**: Creates temporary, visually hidden live regions for announcements
- **Usage**: Optional feature for applications where effect feedback is important

#### Semantic Markup

- All dynamically created effect elements include `aria-hidden="true"`
- Proper cleanup of accessibility announcements after 1 second

### 4. Dynamic Accessibility Monitoring

#### Real-time Preference Changes

- **Feature**: `AccessibilityWatcher` class monitors media query changes
- **Implementation**: Automatically updates component behavior when user changes system preferences
- **Supported Queries**: All major accessibility media queries are monitored

#### Graceful Degradation

- **Behavior**: Component automatically disables when accessibility needs are detected
- **Override**: `ignoreAccessibility` prop allows forcing cursor display (use with caution)

## Usage Examples

### Basic Accessible Implementation

```tsx
import ReactiveCursor from "reactive-cursors";

// Automatically respects all user preferences
<ReactiveCursor layers={[{ fill: "blue", size: { width: 20, height: 20 } }]} />;
```

### High Contrast Friendly

```tsx
// Will automatically adjust colors for high contrast mode
<ReactiveCursor
  layers={[
    {
      fill: "#000000", // Will become CanvasText in forced colors mode
      stroke: "#ffffff",
    },
  ]}
  clickEffect={{
    type: "ripple",
    color: "rgba(255,255,255,0.9)", // Auto-adjusted for accessibility
  }}
/>
```

### Touch-Enabled (Use with Caution)

```tsx
// Only enable on touch if absolutely necessary for your use case
<ReactiveCursor allowTouch={true} layers={[{ fill: "red", size: { width: 30, height: 30 } }]} />
```

### Screen Reader Announcements

```tsx
// Announces effects to screen readers (useful for gaming or interactive apps)
<ReactiveCursor
  announceEffects={true}
  clickEffect={[
    { type: "scale", amount: 1.5 },
    { type: "ripple", color: "blue" },
  ]}
/>
```

### Override Accessibility (Not Recommended)

```tsx
// Forces cursor display even with accessibility preferences
// Only use when absolutely necessary and with user consent
<ReactiveCursor
  ignoreAccessibility={true}
  respectSystemPreferences={false}
  layers={[{ fill: "purple" }]}
/>
```

## Testing Accessibility

### Manual Testing

1. **Enable reduced motion** in your OS settings and verify animations are shortened/disabled
2. **Enable high contrast mode** and verify colors adapt appropriately
3. **Test with screen reader** to ensure cursor is not announced
4. **Test on touch devices** to verify cursor is disabled by default
5. **Use keyboard navigation** to ensure cursor doesn't interfere

### Automated Testing

```javascript
// Example axe-core test
import { axe } from "@axe-core/playwright";

test("cursor component is accessible", async ({ page }) => {
  await page.goto("/cursor-demo");
  const results = await axe(page);
  expect(results.violations).toHaveLength(0);
});
```

### Media Query Testing

```javascript
// Test reduced motion
await page.emulateMedia({ reducedMotion: "reduce" });
// Verify cursor behavior adapts

// Test high contrast
await page.emulateMedia({ forcedColors: "active" });
// Verify colors adapt appropriately
```

## Best Practices

### Do's ✅

- Always test with accessibility preferences enabled
- Use the default accessibility-aware settings
- Provide alternative interaction methods for essential functionality
- Test with actual assistive technologies
- Consider the user's context and needs

### Don'ts ❌

- Don't use `ignoreAccessibility={true}` without user consent
- Don't rely solely on cursor effects for critical functionality
- Don't override system preferences without clear user benefit
- Don't use low contrast colors that become invisible in high contrast mode
- Don't announce purely decorative cursor movements to screen readers

## Compliance Standards

This implementation follows:

- **WCAG 2.1 AA**: Level AA compliance for accessibility
- **Section 508**: US Federal accessibility requirements
- **EN 301 549**: European accessibility standard
- **Platform Guidelines**: Respects OS-level accessibility preferences

## Browser Support

Accessibility features are supported in:

- **Modern browsers**: Full support for all media queries and features
- **Legacy browsers**: Graceful degradation with basic functionality
- **Mobile browsers**: Appropriate touch device detection and handling

## Future Enhancements

Planned accessibility improvements:

- Voice control compatibility testing
- Eye tracking device support
- Cognitive accessibility considerations
- Additional customizable announcement patterns
