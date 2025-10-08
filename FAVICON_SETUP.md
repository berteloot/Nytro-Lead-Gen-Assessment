# Favicon Setup Documentation

## Overview

This document describes the favicon implementation for the Lead Generation Assessment tool, using the Nytro Marketing logo as the base.

## Files Created

The following favicon files have been generated from `logo_Nytro_color.png`:

### Standard Favicons
- **`favicon.ico`** - Traditional ICO format (32x32) for browser compatibility
- **`favicon.svg`** - Modern SVG format for high-DPI displays
- **`favicon-16x16.png`** - 16x16 PNG for small displays
- **`favicon-32x32.png`** - 32x32 PNG for standard displays

### Mobile & PWA Icons
- **`apple-touch-icon.png`** - 180x180 PNG for iOS home screen
- **`android-chrome-192x192.png`** - 192x192 PNG for Android Chrome
- **`android-chrome-512x512.png`** - 512x512 PNG for Android Chrome

### Web App Manifest
- **`site.webmanifest`** - PWA manifest file with app metadata

## Implementation

### HTML Metadata (app/layout.tsx)
```typescript
export const metadata: Metadata = {
  title: "Lead Generation Assessment | Nytro Marketing",
  description: "...",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
  manifest: "/site.webmanifest",
};
```

### Web App Manifest (public/site.webmanifest)
```json
{
  "name": "Lead Generation Assessment | Nytro Marketing",
  "short_name": "LeadGen Assessment",
  "description": "Elevate your marketing strategy with our comprehensive lead generation assessment.",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#F86A0E",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "scope": "/"
}
```

## Generation Script

### Usage
```bash
npm run generate-favicon
```

### Script Location
- **File:** `scripts/generate-favicon.js`
- **Dependencies:** `sharp` (already installed)

### What it does:
1. Reads the source logo (`logo_Nytro_color.png`)
2. Generates multiple PNG sizes with transparent backgrounds
3. Creates an SVG favicon with the Nytro "N" logo
4. Outputs all files to the `public/` directory

## Browser Support

### Desktop Browsers
- ✅ Chrome/Edge: Uses favicon.ico, favicon.svg, PNG variants
- ✅ Firefox: Uses favicon.ico, favicon.svg, PNG variants
- ✅ Safari: Uses favicon.ico, apple-touch-icon.png

### Mobile Browsers
- ✅ iOS Safari: Uses apple-touch-icon.png for home screen
- ✅ Android Chrome: Uses android-chrome-* icons
- ✅ Other mobile browsers: Falls back to favicon.ico

### PWA Support
- ✅ Web App Manifest: Enables "Add to Home Screen"
- ✅ Theme colors: Matches Nytro brand (#F86A0E)
- ✅ Standalone display: App-like experience

## Brand Consistency

### Colors Used
- **Primary:** #F86A0E (Nytro Orange)
- **Background:** Transparent/White
- **Text:** Nytro "N" in brand orange

### Design Approach
- All favicons maintain the Nytro brand identity
- Consistent "N" logo across all sizes
- Transparent backgrounds for versatility
- High-quality rendering at all resolutions

## Testing

### Manual Testing
1. Open the application in different browsers
2. Check browser tab for favicon display
3. Test "Add to Home Screen" on mobile devices
4. Verify PWA installation works

### Automated Testing
The favicon generation can be re-run anytime:
```bash
npm run generate-favicon
```

## Maintenance

### When to Regenerate
- If the main logo (`logo_Nytro_color.png`) changes
- If brand colors are updated
- If new icon sizes are needed

### Best Practices
- Keep the source logo high resolution (1000x1000+)
- Maintain transparent backgrounds
- Test across different devices and browsers
- Update web app manifest if app details change

## File Sizes
- favicon.ico: ~1.1KB
- favicon.svg: ~275 bytes
- favicon-16x16.png: ~556 bytes
- favicon-32x32.png: ~1.1KB
- apple-touch-icon.png: ~2.5KB
- android-chrome-192x192.png: ~8KB
- android-chrome-512x512.png: ~25KB
- site.webmanifest: ~500 bytes

**Total:** ~39KB for complete favicon package

---

**Created:** October 8, 2025  
**Last Updated:** October 8, 2025  
**Source Logo:** logo_Nytro_color.png (1126x1124)
