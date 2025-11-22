# Deployment Guide

## Architecture
- **Frontend**: Static HTML/CSS/JavaScript (deployed on Vercel)
- **Backend**: Spring Boot application (deployed separately on Java hosting)

## Frontend Deployment (Vercel)

1. The frontend files are in `src/main/resources/static/`:
   - `index.html`
   - `styles.css`
   - `script.js`

2. Update the API base URL in `script.js` to point to your Spring Boot backend

3. Push to GitHub and connect to Vercel

## Backend Deployment (Spring Boot)

Deploy your Spring Boot application to:
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean App Platform
- Railway.app
- Render.com
- Any Java-capable hosting

Example with Railway.app:
\`\`\`bash
# Install Railway CLI
npm install -g @railway/cli

# Connect to project
railway link

# Deploy
railway up
\`\`\`

## Environment Variables

Set on your hosting platform:
\`\`\`
DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=inventory_db
DB_USER=inventory_user
DB_PASSWORD=your-secure-password
API_PORT=8080
JWT_SECRET=your-super-secret-key-min-32-chars
\`\`\`

## CORS Configuration

In your Spring Boot `application.yml`:
\`\`\`yaml
server:
  servlet:
    context-path: /api

spring:
  web:
    cors:
      allowed-origins: "https://your-vercel-domain.vercel.app"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true
