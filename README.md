# 🚀 SPTM Frontend - Production Ready

## 📦 Quick Deploy (Vercel)

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SmartPersonalTaskManager/frontend)

### Manual Deploy
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 🔧 Environment Variables

Set these in Vercel Dashboard:
```env
VITE_API_URL=https://sptm-backend.onrender.com
VITE_USE_MOCK=false
```

## 🏗️ Build Configuration

- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18.x or higher

## ✨ Features

- ✅ Backend Integration (Render)
- ✅ JWT Authentication
- ✅ Session Persistence
- ✅ Toast Notifications
- ✅ Sample Workspace
- ✅ Cross-Device Sync
- ✅ Production Optimized

## 📊 Bundle Size

```
dist/index.html                   0.54 kB
dist/assets/index-DTDXl0wW.css    4.20 kB │ gzip:   1.50 kB
dist/assets/index-BT6QQ22K.js   384.93 kB │ gzip: 109.90 kB
```

## 🔗 Related Repositories

- **Backend:** [SmartPersonalTaskManager/backend](https://github.com/SmartPersonalTaskManager/backend)

## 📝 Documentation

- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

---

**Status:** ✅ Production Ready  
**Last Updated:** 2025-12-26
