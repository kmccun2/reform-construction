# DigitalOcean Deployment Guide for Reform Construction Website

## 🚀 Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)

**Easiest option - Perfect for static React sites**

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for DigitalOcean deployment"
   git push origin main
   ```

2. **Go to DigitalOcean App Platform**
   - Visit: https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Choose GitHub as source
   - Select your repository

3. **Configure the app**
   - App name: `reform-construction`
   - Branch: `main`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Instance size: Basic ($5/month)

4. **Deploy**
   - Review settings and click "Create Resources"
   - Your app will be automatically deployed with SSL certificate
   - You'll get a URL like: `https://reform-construction-xyz.ondigitalocean.app`

### Option 2: DigitalOcean Droplet (Traditional Server)

**More control but requires server management**

1. **Create a Droplet**
   - Go to DigitalOcean dashboard
   - Create Droplet > Ubuntu 22.04 LTS
   - Choose $6/month droplet (1GB RAM)
   - Add your SSH key

2. **Connect to your droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install required software**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Nginx
   apt install nginx -y
   
   # Install Node.js (for building)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install nodejs -y
   
   # Start and enable Nginx
   systemctl start nginx
   systemctl enable nginx
   ```

4. **Build and upload your site**
   On your local machine:
   ```bash
   npm run deploy:build
   ```
   
   Upload the generated `reform-construction-deploy.zip` to your droplet:
   ```bash
   scp reform-construction-deploy.zip root@your_droplet_ip:/tmp/
   ```

5. **Deploy on the droplet**
   ```bash
   # Extract files
   cd /var/www/html
   rm -rf *
   unzip /tmp/reform-construction-deploy.zip
   
   # Set permissions
   chown -R www-data:www-data /var/www/html
   chmod -R 755 /var/www/html
   ```

6. **Configure domain (optional)**
   - Point your domain to the droplet IP
   - Install SSL with Let's Encrypt:
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d yourdomain.com
   ```

### Option 3: Docker Container

**Best for scalability and easy updates**

1. **Build Docker image**
   ```bash
   docker build -t reform-construction .
   ```

2. **Run locally to test**
   ```bash
   docker run -p 8080:80 reform-construction
   ```

3. **Deploy to DigitalOcean Container Registry**
   ```bash
   # Install doctl CLI
   # Tag and push image
   docker tag reform-construction registry.digitalocean.com/your-registry/reform-construction
   docker push registry.digitalocean.com/your-registry/reform-construction
   ```

## 💰 Cost Estimates

- **App Platform**: $5/month (includes SSL, automatic deployments)
- **Droplet**: $6/month + domain costs
- **Container**: $12/month (includes registry)

## 🔧 Custom Domain Setup

1. **Buy domain** (if needed) from any registrar
2. **Point DNS to DigitalOcean**:
   - Type: A Record
   - Name: @
   - Value: Your droplet IP or App Platform domain
3. **SSL Certificate**: Automatic with App Platform, manual setup required for droplets

## 📞 Contact Form Configuration

Your contact form uses Google Sheets. Make sure to:
1. Set up the Google Sheets API (see GOOGLE_SHEETS_SETUP.md)
2. Add your production domain to allowed origins
3. Test the contact form after deployment

## 🚀 Quick Start (App Platform)

1. Push code to GitHub
2. Go to DigitalOcean App Platform
3. Connect your repo
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy!

Your site will be live at the provided URL with automatic SSL and deployments on every push to main branch.
