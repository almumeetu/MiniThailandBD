# Slider Settings Quick Reference

## 🎛️ How to Adjust Slider Speeds

### Hero Slider (`app/_components/hero-slider.tsx`)

**Current Settings:**
```typescript
const timer = window.setInterval(() => {
  nextSlide();
}, 5000); // ⬅️ Change this number (in milliseconds)
```

**Recommended Values:**
- Slow: `6000` (6 seconds)
- Medium: `5000` (5 seconds) ✅ Current
- Fast: `3500` (3.5 seconds)

---

### Instagram Slider (`components/sections/instagram.tsx`)

**Current Settings:**
```typescript
autoplay={{
  delay: 3000, // ⬅️ Time between slides (3 seconds)
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}}
speed={1200} // ⬅️ Transition duration (1.2 seconds)
```

**Recommended Combinations:**
- Slow & Smooth: `delay: 4000, speed: 1500`
- Medium: `delay: 3000, speed: 1200` ✅ Current
- Fast: `delay: 2000, speed: 800`

---

### Brands Slider (`components/sections/brands.tsx`)

**Current Settings:**
```typescript
autoplay={{
  delay: 3500, // ⬅️ Time between slides (3.5 seconds)
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}}
speed={1200} // ⬅️ Transition duration (1.2 seconds)
```

**Recommended Combinations:**
- Slow: `delay: 4500, speed: 1500`
- Medium: `delay: 3500, speed: 1200` ✅ Current
- Fast: `delay: 2500, speed: 900`

---

## 📏 Spacing Adjustments

### Instagram Slider Spacing
```typescript
spaceBetween={12} // ⬅️ Gap between slides (12px)

breakpoints={{
  640: { slidesPerView: 3, spaceBetween: 14 },
  1024: { slidesPerView: 5, spaceBetween: 16 },
  1280: { slidesPerView: 6, spaceBetween: 18 },
}}
```

**Options:**
- Tight: `8-10px`
- Medium: `12-14px` ✅ Current
- Wide: `16-20px`

### Brands Slider Spacing
```typescript
spaceBetween={20} // ⬅️ Gap between slides (20px)

breakpoints={{
  500: { slidesPerView: 3, spaceBetween: 18 },
  768: { slidesPerView: 4, spaceBetween: 20 },
  1024: { slidesPerView: 5, spaceBetween: 24 },
  1280: { slidesPerView: 6, spaceBetween: 28 },
}}
```

**Options:**
- Tight: `12-16px`
- Medium: `20-24px` ✅ Current
- Wide: `28-32px`

---

## 🎨 Number of Visible Slides

### Instagram Slider
```typescript
slidesPerView={2} // Mobile (< 640px)

breakpoints={{
  640: { slidesPerView: 3 },   // Tablet
  1024: { slidesPerView: 5 },  // Desktop
  1280: { slidesPerView: 6 },  // Large Desktop
}}
```

### Brands Slider
```typescript
slidesPerView={2} // Mobile (< 500px)

breakpoints={{
  500: { slidesPerView: 3 },   // Small tablet
  768: { slidesPerView: 4 },   // Tablet
  1024: { slidesPerView: 5 },  // Desktop
  1280: { slidesPerView: 6 },  // Large Desktop
}}
```

**Tips:**
- More slides = faster feel
- Fewer slides = focus on each item
- Consider content size when adjusting

---

## 🔄 Transition Effects

### Current Setup (All Sliders)
```typescript
speed={1200} // Smooth, professional speed
effect="slide" // Slide transition (default)
```

### Available Effects:
1. **slide** - Horizontal slide ✅ Current
2. **fade** - Crossfade effect
3. **cube** - 3D cube rotation
4. **coverflow** - Cover flow effect
5. **flip** - 3D flip

**To Change:**
```typescript
// In the carousel component
import { EffectFade } from "swiper/modules";

<StoreCarousel
  modules={[Autoplay, EffectFade]}
  effect="fade"
  // ... other props
/>
```

---

## ⏸️ Pause Behavior

### Current Settings (All Sliders)
```typescript
pauseOnMouseEnter: true // ⬅️ Pauses when hovering
disableOnInteraction: false // ⬅️ Resumes after interaction
```

**Options:**
- `pauseOnMouseEnter: true` - User-friendly ✅
- `pauseOnMouseEnter: false` - Always play
- `disableOnInteraction: true` - Stop after click

---

## 🔁 Loop Settings

### Instagram Slider
```typescript
loop={true} // Always loops
```

### Brands Slider
```typescript
loop={activeBrands.length >= 3} // Only loops if 3+ items
```

**Best Practices:**
- Enable loop if you have 3+ items
- Disable if you have few items (prevents weird jumps)

---

## 🎯 Navigation Controls

### Hero Slider
- ✅ Arrow buttons (left/right)
- ✅ Dot indicators (bottom right)
- ✅ Progress bar (bottom)
- ✅ Keyboard navigation (arrow keys)

### Instagram & Brands
- ✅ Mouse drag
- ✅ Touch swipe (mobile)
- ✅ Pause/play button (from StoreCarousel)
- ✅ Navigation arrows (from StoreCarousel)

---

## 📱 Mobile Optimization

### Touch Gestures
All sliders support:
- ✅ Swipe left/right
- ✅ Smooth momentum scrolling
- ✅ Snap to slide
- ✅ Pull resistance at edges

### Performance
```css
/* In slider-enhancements.css */
@media (max-width: 768px) {
  .swiper-slide {
    transition-duration: 0.8s; /* Slightly faster on mobile */
  }
}
```

---

## 🚀 Performance Tips

### Best Practices
1. Keep `speed` between 800-1500ms
2. Keep `delay` between 2000-5000ms
3. Don't show too many slides at once
4. Use `loop` wisely (more items needed)
5. Enable `lazy` loading for images

### Lazy Loading Images
```typescript
<Image
  src={image}
  alt={alt}
  fill
  loading="lazy" // ⬅️ Lazy load images
  className="object-cover"
/>
```

---

## 🎨 Custom Animations

### Add Custom CSS
In `slider-enhancements.css`:

```css
/* Custom slide-in effect */
.swiper-slide-active .custom-slide-in {
  animation: slideInCustom 0.8s ease-out;
}

@keyframes slideInCustom {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

Then apply to elements:
```tsx
<div className="custom-slide-in">
  {/* Your content */}
</div>
```

---

## ✅ Quick Troubleshooting

### Slider Too Fast?
- Increase `delay` (e.g., 3000 → 4000)
- Increase `speed` (e.g., 1200 → 1500)

### Slider Too Slow?
- Decrease `delay` (e.g., 5000 → 3500)
- Decrease `speed` (e.g., 1200 → 900)

### Choppy Animation?
- Check if `speed` is too low (< 600ms)
- Enable GPU acceleration (already done in CSS)
- Reduce number of visible slides

### Not Looping?
- Check if you have enough items
- Verify `loop={true}` is set
- For brands, ensure `activeBrands.length >= 3`

### Autoplay Not Working?
- Check browser console for errors
- Verify `autoplay` object is set correctly
- Check if `pauseOnMouseEnter` is interfering

---

## 📊 Recommended Settings Summary

| Slider | Delay | Speed | Slides (Mobile) | Slides (Desktop) |
|--------|-------|-------|----------------|------------------|
| Hero | 5000ms | 1200ms | 1 | 1 |
| Instagram | 3000ms | 1200ms | 2 | 5-6 |
| Brands | 3500ms | 1200ms | 2 | 5-6 |
| Related | 4500ms | - | 2 | 5 |

---

## 🎉 Your Perfect Setup

All sliders are now configured for:
- ✅ **Smooth one-by-one transitions**
- ✅ **Perfect timing (not too fast, not too slow)**
- ✅ **Beautiful animations**
- ✅ **Mobile-optimized**
- ✅ **User-friendly interactions**
- ✅ **High performance**

Enjoy your perfect slider experience! 🚀
