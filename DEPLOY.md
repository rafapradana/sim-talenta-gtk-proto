# Panduan Deploy SIPODI

## Opsi 1: Vercel (Gratis & Mudah)

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/sim-talenta-gtk.git
git push -u origin main
```

### 2. Deploy ke Vercel
1. Buka https://vercel.com
2. Login dengan GitHub
3. Klik "Import Project" → pilih repository
4. Set Environment Variables:
   - `DATABASE_URL` - PostgreSQL connection string (bisa pakai Neon/Supabase gratis)
   - `JWT_SECRET` - Random string untuk JWT
   - `JWT_REFRESH_SECRET` - Random string untuk refresh token
5. Klik Deploy

### 3. Setup Database (Gratis)
Pilih salah satu:
- **Neon** (https://neon.tech) - PostgreSQL gratis
- **Supabase** (https://supabase.com) - PostgreSQL gratis
- **Railway** (https://railway.app) - PostgreSQL gratis

Copy connection string ke Vercel environment variables.

### 4. Custom Domain di Vercel
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `simtalenta.yourdomain.com`
3. Di domain registrar, tambah DNS record:
   - Type: CNAME
   - Name: simtalenta
   - Value: cname.vercel-dns.com

---

## Opsi 2: VPS dengan Docker

### 1. Sewa VPS
- DigitalOcean ($6/bulan)
- Contabo (€4.99/bulan)
- Vultr ($6/bulan)

### 2. Setup Server
```bash
# SSH ke server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin

# Install Nginx & Certbot
apt install nginx certbot python3-certbot-nginx
```

### 3. Clone & Setup Project
```bash
# Clone repository
git clone https://github.com/username/sim-talenta-gtk.git
cd sim-talenta-gtk

# Copy dan edit environment
cp .env.production.example .env
nano .env  # Edit sesuai kebutuhan
```

### 4. Build & Run
```bash
# Build dan jalankan
docker compose up -d

# Jalankan migrasi database (sekali saja)
docker compose --profile setup up migrate

# Seed data awal
docker compose exec app npx tsx lib/db/seed.ts
```

### 5. Setup Domain & SSL
```bash
# Copy nginx config
cp nginx.conf /etc/nginx/sites-available/simtalenta
ln -s /etc/nginx/sites-available/simtalenta /etc/nginx/sites-enabled/

# Edit domain di config
nano /etc/nginx/sites-available/simtalenta
# Ganti simtalenta.yourdomain.com dengan domain kamu

# Test nginx config
nginx -t

# Get SSL certificate
certbot --nginx -d simtalenta.yourdomain.com

# Restart nginx
systemctl restart nginx
```

### 6. DNS Setting
Di domain registrar (Niagahoster, Cloudflare, dll):
- Type: A
- Name: simtalenta (atau @ untuk root domain)
- Value: IP address VPS kamu

---

## Opsi 3: Railway (Mudah, Ada Free Tier)

1. Buka https://railway.app
2. Login dengan GitHub
3. New Project → Deploy from GitHub repo
4. Railway otomatis detect Dockerfile
5. Add PostgreSQL service
6. Set environment variables
7. Generate domain atau add custom domain

---

## Tips Keamanan Production

1. Ganti semua secret keys dengan random string:
```bash
openssl rand -base64 32
```

2. Gunakan password database yang kuat

3. Backup database secara berkala:
```bash
docker compose exec db pg_dump -U simtalenta sim_talenta_gtk > backup.sql
```

4. Monitor logs:
```bash
docker compose logs -f app
```
