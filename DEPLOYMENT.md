# ServiceDesk Production Deployment Guide

This guide details the three recommended deployment strategies for running ServiceDesk in production environments.

---

## 1. Environment Configuration Reference

Create `.env` files in your production environment using the following variables:

### Backend Environment Variables (`servicedesk/backend/.env`)
| Variable | Description | Example Production Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment identifier | `production` |
| `PORT` | API listening port | `3000` |
| `MONGODB_URI` | MongoDB Atlas Cloud Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/servicedesk?retryWrites=true&w=majority` |
| `JWT_SECRET` | Strong cryptographic secret for signing JWTs | `a8f9b2c3d4e5f6...` (min 64 chars) |
| `CLIENT_URL` | Allowed frontend origin for CORS | `https://servicedesk.yourdomain.com` |

### Frontend Environment Variables (`frontend/.env`)
| Variable | Description | Example Production Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public URL of backend API | `https://api.servicedesk.yourdomain.com` (or empty if using Nginx reverse proxy) |

---

## 2. Deployment Topology A: Docker Compose (Recommended for VPS / Cloud Instances)

Deploy both frontend and backend on any Linux VPS (AWS EC2, DigitalOcean, Hetzner, Linode) with a single command.

### Prerequisites
* Docker Engine $\ge 24.0$ & Docker Compose $\ge 2.20$ installed.

### Steps
1. **Clone repository onto your server:**
   ```bash
   git clone https://github.com/your-org/servicedesk.git
   cd servicedesk
   ```

2. **Configure Environment:**
   Create `.env` in the root directory:
   ```bash
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.aaiy9h9.mongodb.net/servicedesk?retryWrites=true&w=majority"
   JWT_SECRET="generate_a_random_64_char_secret_key"
   CLIENT_URL="http://your-server-ip-or-domain"
   ```

3. **Build and Launch Containers:**
   ```bash
   docker compose up -d --build
   ```

4. **Verify Deployment:**
   ```bash
   docker compose ps
   docker compose logs -f
   ```
   * Frontend is accessible at `http://your-server-ip:80`
   * Backend API is accessible at `http://your-server-ip:3000`

---

## 3. Deployment Topology B: Cloud PaaS (Vercel + Render / Railway)

Ideal for managed, zero-maintenance cloud hosting.

### Part 1: Backend on Render.com or Railway.app
1. Create a new **Web Service** pointing to `servicedesk/backend`.
2. **Build Command:** `npm install`
3. **Start Command:** `node server.js`
4. **Environment Variables:**
   * `NODE_ENV`: `production`
   * `PORT`: `3000`
   * `MONGODB_URI`: `mongodb+srv://...`
   * `JWT_SECRET`: `your-secure-jwt-secret`
   * `CLIENT_URL`: `https://your-frontend.vercel.app`
5. Note your backend service URL (e.g. `https://servicedesk-api.onrender.com`).

### Part 2: Frontend on Vercel or Netlify
1. Import repository and set root directory to `frontend`.
2. **Framework Preset:** Vite
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variables:**
   * `VITE_API_BASE_URL`: `https://servicedesk-api.onrender.com`
6. Deploy.

---

## 4. Deployment Topology C: Bare-Metal Linux Host (PM2 + Nginx + Certbot SSL)

For dedicated Linux servers running Ubuntu 22.04 / 24.04 LTS.

### 1. Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### 2. Start Backend with PM2
```bash
cd /var/www/servicedesk/servicedesk/backend
npm ci --production
pm2 start server.js --name "servicedesk-api" -i max
pm2 save
pm2 startup
```

### 3. Build & Host Frontend
```bash
cd /var/www/servicedesk/frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/html/
```

### 4. Configure Nginx with SSL (Let's Encrypt)
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## 5. Security & Maintenance Checklist

* [ ] **SSL/TLS Encryption:** Enforce HTTPS on all client and API traffic.
* [ ] **CORS Origin Restriction:** Set `CLIENT_URL` explicitly to your production domain (no wildcards `*`).
* [ ] **MongoDB Backups:** Enable daily automated snapshots in MongoDB Atlas.
* [ ] **File Storage Backups:** Regularly back up the `servicedesk_uploads` Docker volume or `uploads/` directory.
* [ ] **Healthcheck Monitoring:** Connect an uptime monitor (e.g. BetterStack, UptimeRobot) to `/api/v1/health`.
