# SPTM Production Deployment Checklist

## ✅ Backend Entegrasyon (Render)

### Mevcut Durum
- Backend URL: `https://sptm-backend.onrender.com`
- Database: PostgreSQL (Render)
- JWT Authentication: ✅ Configured

### Gerekli Değişiklikler

#### 1. Backend CORS Ayarları
Backend'de CORS yapılandırması frontend URL'ini kabul etmeli:
- Development: `http://localhost:5173`
- Production: `https://your-domain.com` (GitHub Pages veya Vercel)

#### 2. Environment Variables (Backend - Render)
```env
DB_HOST=<render-postgres-host>
DB_PORT=5432
DB_NAME=sptmdb
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
JWT_SECRET=<secure-random-string-min-32-chars>
JWT_EXPIRATION_MS=86400000
SERVER_PORT=8080
```

## ✅ Frontend Konfigürasyonu

### 1. Environment Variables (.env.production)
```env
VITE_API_URL=https://sptm-backend.onrender.com
VITE_USE_MOCK=false
```

### 2. Build Process
```bash
npm run build
```

### 3. Deployment Options

#### Option A: GitHub Pages
```bash
npm run build
# Configure GitHub repository settings
```

#### Option B: Vercel
```bash
vercel deploy --prod
```

#### Option C: Netlify
```bash
netlify deploy --prod
```

## ✅ Integration Tests

### Test Scenarios
1. ✅ User Registration → Login
2. ✅ Create Task → Update → Delete
3. ✅ Create Mission → Add Submission
4. ✅ Load Sample Workspace
5. ✅ Logout → Re-login (Session Persistence)

## ✅ Security Checklist

- [ ] JWT Secret is secure (min 32 characters)
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS properly configured
- [ ] Database credentials secured (not in git)
- [ ] Rate limiting configured (backend)
- [ ] Input validation implemented

## ✅ Performance Optimizations

- [ ] Frontend bundle size optimized
- [ ] Image assets compressed
- [ ] Lazy loading implemented where applicable
- [ ] Backend database indexed properly
- [ ] API response caching (if applicable)

## 🚀 Deployment Steps

### Phase 1: Backend Verification
1. Verify Render backend is running
2. Test all API endpoints
3. Confirm database connection

### Phase 2: Frontend Build
1. Update .env.production with correct backend URL
2. Run `npm run build`
3. Test production build locally: `npm run preview`

### Phase 3: Deploy
1. Deploy frontend to chosen platform
2. Update CORS settings in backend
3. Test full integration

### Phase 4: Post-Deployment
1. Monitor error logs
2. Test from different devices
3. Verify data persistence
4. Check performance metrics

## 📊 Monitoring

### Backend (Render)
- Health Check: `https://sptm-backend.onrender.com/actuator/health`
- Logs: Render Dashboard

### Frontend
- Browser Console for errors
- Network tab for API calls
- Performance metrics

## 🔄 Rollback Plan

If deployment fails:
1. Revert to previous frontend version
2. Check backend logs
3. Verify database integrity
4. Test API manually

---

**Created:** 2025-12-26
**Status:** Ready for Phase 1
