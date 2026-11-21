# Mega Menu Visual Structure

## Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FULL WIDTH DROPDOWN                              │
├───────────────────┬───────────────────────────────────────────────────────────┤
│                   │                                                           │
│   FEATURED        │              CATEGORY SECTIONS (4 COLUMNS)                │
│   IMAGE CARD      │                                                           │
│                   │   ┌──────────┬──────────┬──────────┬──────────┐         │
│   ┌─────────┐     │   │ Section  │ Section  │ Section  │ Section  │         │
│   │         │     │   │   1      │   2      │   3      │   4      │         │
│   │  Image  │     │   │          │          │          │          │         │
│   │         │     │   │ • Link   │ • Link   │ • Link   │ • Link   │         │
│   └─────────┘     │   │ • Link   │ • Link   │ • Link   │ • Link   │         │
│                   │   │ • Link   │ • Link   │ • Link   │ • Link   │         │
│   Title           │   │ • Link   │ • Link   │ • Link   │ • Link   │         │
│   Description     │   │ • Link   │ • Link   │ • Link   │          │         │
│                   │   └──────────┴──────────┴──────────┴──────────┘         │
│   (3 col width)   │              (9 col width total)                         │
│                   │                                                           │
├───────────────────┴───────────────────────────────────────────────────────────┤
│         Quick Links: Free Delivery | Easy Returns | Gift Sets | View All →   │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Layout

```
┌──────────────────────┐
│  ☰ SLIDE-OUT MENU    │
│                      │
│  ┌────────────────┐  │
│  │ Profile Button │  │
│  │ Wishlist Button│  │
│  │ Cart Button    │  │
│  └────────────────┘  │
│                      │
│  ━━━━━━━━━━━━━━━━━  │
│                      │
│  ▼ Shop             │
│    • By Sport       │
│    • By Type        │
│                      │
│  ▼ New In           │
│    • This Week      │
│    • By League      │
│                      │
│  ▼ Brands           │
│    • Top Brands     │
│                      │
│  ▼ Archive          │
│    • By Era         │
│                      │
│  ━━━━━━━━━━━━━━━━━  │
│  Quick Links        │
│  • Free Delivery    │
│  • Easy Returns     │
│  • Gift Sets        │
└──────────────────────┘
```

## Navigation Flow

### Desktop Experience
1. **Hover** on category name → Mega menu appears
2. **Move cursor** into dropdown → Menu stays open
3. **Click** any link → Navigate to page
4. **Move cursor away** → Menu fades out

### Mobile Experience
1. **Tap** hamburger icon → Drawer slides in from left
2. **Tap** category name → Expand/collapse section
3. **Tap** any link → Navigate to page
4. **Tap** X button or backdrop → Menu closes

## Component Hierarchy

```
StorefrontHeader
├── Top Banner (Black)
│   └── "Join our community..."
│
├── Header Bar
│   ├── Mobile Menu Button (< lg)
│   │   └── MobileMenu Component
│   │
│   ├── Desktop Navigation (≥ lg)
│   │   └── MegaMenu Component
│   │       ├── Nav Items
│   │       └── Dropdown Panel
│   │           ├── Featured Section
│   │           ├── Category Grid
│   │           └── Quick Links Bar
│   │
│   ├── Logo (Center)
│   ├── Search Bar (≥ xl)
│   └── Actions (Profile, Wishlist, Cart)
│
└── Mobile Search Bar (< xl)
```

## State Management

### MegaMenu Component
```typescript
const [activeMenu, setActiveMenu] = useState<string | null>(null);
const [isHovering, setIsHovering] = useState(false);

// States:
- null: No menu open
- "Shop": Shop menu open
- "New In": New In menu open
// etc...
```

### MobileMenu Component
```typescript
const [isOpen, setIsOpen] = useState(false);
const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

// States:
- isOpen: Drawer visible/hidden
- expandedCategory: Which accordion is open
```

## Responsive Breakpoints

```
Mobile:     < 640px   (sm)
Tablet:     640-1023px (sm-lg)
Desktop:    ≥ 1024px  (lg)
Wide:       ≥ 1280px  (xl)
Ultra-wide: ≥ 1536px  (2xl)
```

### Component Visibility

| Component          | Mobile | Tablet | Desktop |
|-------------------|--------|--------|---------|
| Mobile Menu Button | ✓      | ✓      | ✗       |
| Desktop Mega Menu  | ✗      | ✗      | ✓       |
| Logo               | ✓      | ✓      | ✓       |
| Search Bar (Top)   | ✗      | ✗      | ✓       |
| Search Bar (Bottom)| ✓      | ✓      | ✗       |
| User Actions       | ✗      | ✓      | ✓       |

## Animation Timings

```css
Menu Fade In:     200ms
Menu Fade Out:    200ms
Hover Effect:     200ms
Mobile Slide:     300ms
Link Transition:  200ms
```

## Color Palette

```
Background:       white
Text Primary:     black
Text Secondary:   neutral-600
Text Tertiary:    neutral-400
Border:           neutral-200
Hover BG:         neutral-50
Featured BG:      neutral-100
Badge BG:         red-500
```

## Grid System

### Desktop Mega Menu
```
Total Columns: 12

Featured Section:  3/12 (25%)
Categories Grid:   9/12 (75%)
  └── 4 columns × equal width
```

### Mobile Grid
```
Actions Buttons:  3 columns (Profile | Wishlist | Cart)
Navigation:       1 column (stacked)
```

## Best Practices Checklist

- ✅ Full-width dropdown for desktop
- ✅ Touch-friendly mobile menu
- ✅ Clear visual hierarchy
- ✅ Smooth animations
- ✅ Keyboard accessible
- ✅ Featured content area
- ✅ Quick links for common actions
- ✅ Consistent spacing (Tailwind system)
- ✅ Semantic HTML
- ✅ ARIA labels for accessibility

## Performance Metrics

**Target Performance:**
- First Paint: < 1s
- Interactive: < 2s
- Animation FPS: 60fps
- Menu Open Delay: < 100ms

**Optimization:**
- Conditional rendering (menu only when needed)
- CSS transitions (GPU accelerated)
- No heavy JavaScript computations
- Lazy load featured images
