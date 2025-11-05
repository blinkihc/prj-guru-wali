# PWA (Progressive Web App) - Guru Wali

## 📱 Fitur PWA

Aplikasi Guru Wali sekarang mendukung PWA dengan fitur:

- ✅ **Install ke Home Screen** - Install aplikasi seperti native app
- ✅ **Offline Support** - Akses basic features tanpa internet
- ✅ **Fast Loading** - Cache assets untuk loading lebih cepat
- ✅ **App-like Experience** - Fullscreen tanpa browser UI
- ✅ **Auto Updates** - Service worker auto-update
- ✅ **Push Notifications** - (Future feature)

---

## 🚀 Cara Install

### **Android (Chrome/Edge)**

1. Buka https://guru-wali-app.pages.dev/
2. Klik menu (⋮) → **"Install app"** atau **"Add to Home screen"**
3. Atau klik banner "Install Aplikasi" yang muncul di bottom
4. Confirm installation
5. Icon akan muncul di home screen

### **iOS (Safari)**

1. Buka https://guru-wali-app.pages.dev/
2. Tap tombol Share (⬆️)
3. Scroll dan tap **"Add to Home Screen"**
4. Edit nama jika perlu
5. Tap **"Add"**
6. Icon akan muncul di home screen

### **Desktop (Chrome/Edge)**

1. Buka https://guru-wali-app.pages.dev/
2. Klik icon install (⊕) di address bar
3. Atau klik menu → **"Install Guru Wali"**
4. Confirm installation
5. App akan terbuka di window terpisah

---

## 🔧 Technical Details

### **Files Created**

```
public/
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── icon.svg              # Base icon (SVG)
├── icon-72x72.png        # Icon 72x72
├── icon-96x96.png        # Icon 96x96
├── icon-128x128.png      # Icon 128x128
├── icon-144x144.png      # Icon 144x144
├── icon-152x152.png      # Icon 152x152 (Apple)
├── icon-192x192.png      # Icon 192x192
├── icon-384x384.png      # Icon 384x384
└── icon-512x512.png      # Icon 512x512

components/pwa/
└── pwa-install.tsx       # Install prompt component

app/
├── layout.tsx            # PWA meta tags
└── (main)/layout.tsx     # PWA install component
```

### **Service Worker Strategy**

- **Network First** for HTML pages (with cache fallback)
- **Cache First** for static assets (CSS, JS, images)
- **No Cache** for API requests (always fresh data)
- **Auto Update** when new version available

### **Caching**

```javascript
CACHE_NAME: 'guru-wali-v2.0.0'
RUNTIME_CACHE: 'guru-wali-runtime'

Precached:
- / (homepage)
- /login
- /manifest.json
- Icons
```

---

## 🎨 Customizing Icons

### **Option 1: Use Icon Generator (Recommended)**

1. Go to: https://realfavicongenerator.net/
2. Upload your logo (min 512x512px, square)
3. Configure settings
4. Download generated icons
5. Replace files in `public/` folder

### **Option 2: Manual Creation**

Required sizes:
- 72x72, 96x96, 128x128, 144x144
- 152x152 (Apple Touch Icon)
- 192x192, 384x384, 512x512

Tools:
- Figma, Sketch, Adobe XD
- GIMP, Photoshop
- Online: Canva, Pixlr

### **Option 3: Use Script**

```bash
# Install sharp
npm install sharp

# Generate icons from SVG
node scripts/generate-pwa-icons.js
```

---

## 🧪 Testing PWA

### **Chrome DevTools**

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check:
   - **Manifest** - Verify manifest.json
   - **Service Workers** - Check registration
   - **Cache Storage** - View cached assets
4. Use **Lighthouse** tab:
   - Run PWA audit
   - Check score and recommendations

### **Test Offline**

1. Open app
2. DevTools → Network tab
3. Select **Offline** from throttling dropdown
4. Refresh page
5. App should still load (cached version)

### **Test Install**

1. Open in Incognito/Private mode
2. Install banner should appear
3. Click "Install"
4. Verify app opens in standalone mode

---

## 📊 PWA Checklist

- [x] manifest.json configured
- [x] Service worker registered
- [x] Icons (all sizes)
- [x] Meta tags (viewport, theme-color, etc.)
- [x] HTTPS enabled (Cloudflare Pages)
- [x] Install prompt component
- [x] Offline fallback
- [x] Cache strategy
- [ ] Push notifications (future)
- [ ] Background sync (future)
- [ ] Share target API (future)

---

## 🐛 Troubleshooting

### **Install button not showing**

- Check HTTPS (required for PWA)
- Clear browser cache
- Check manifest.json is accessible
- Verify service worker registered
- Try different browser

### **Service worker not updating**

- Hard refresh (Ctrl+Shift+R)
- Clear cache in DevTools
- Unregister old service worker
- Update CACHE_NAME version

### **Icons not displaying**

- Check file paths in manifest.json
- Verify icons exist in public/ folder
- Check icon sizes match manifest
- Clear browser cache

### **Offline mode not working**

- Check service worker is active
- Verify cache strategy in sw.js
- Check Network tab for failed requests
- Review service worker logs

---

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced SW library
- [PWA Builder](https://www.pwabuilder.com/) - PWA tools and testing

---

## 🔄 Updates

When deploying new version:

1. Update `CACHE_NAME` in `sw.js` (e.g., `guru-wali-v2.0.1`)
2. Deploy to production
3. Users will see "Update tersedia" notification
4. Click "Refresh" to update
5. New service worker activates

---

## 🎯 Next Steps

### **Phase 1 (Current)** ✅
- Basic PWA setup
- Install prompt
- Offline support
- Cache strategy

### **Phase 2 (Future)**
- [ ] Push notifications
- [ ] Background sync
- [ ] Periodic background sync
- [ ] Share target API
- [ ] File handling API
- [ ] Badge API

---

## 📝 Notes

- PWA requires HTTPS (Cloudflare Pages provides this)
- Service worker only works on production domain
- Local development: Use `localhost` (treated as secure)
- Icons should be square and high quality
- Test on multiple devices and browsers
- Monitor PWA metrics in Google Analytics

---

**Created:** 2025-11-06  
**Version:** 2.0.0  
**Status:** ✅ Active
