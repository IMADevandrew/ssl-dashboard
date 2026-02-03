# SSL Certificate Dashboard

A real-time HTML dashboard for monitoring SSL certificate expiry dates across multiple websites.

## Features

- 🎨 Beautiful, responsive HTML dashboard
- 📊 Real-time SSL certificate expiry tracking
- 📈 Status dashboard with statistics (Valid, Warning, Critical, Expired)
- ⏰ Automatic daily checks (scheduled at 9:00 AM)
- ➕ Add/remove websites on the fly
- 🔄 Manual certificate checks
- 📥 Export data to CSV
- 💾 Persistent data storage (JSON file)
- 📱 Mobile-responsive design

## Installation

### 1. Prerequisites
- Node.js installed (https://nodejs.org/)
- Windows 10/11

### 2. Setup

1. Navigate to the ssl-dashboard folder
2. Run the start script:
   ```
   start.bat
   ```

3. Install dependencies (automatic on first run)

4. Access the dashboard at: **http://localhost:3000**

## Usage

### Adding Websites
1. Enter the website URL in the input field (e.g., `https://example.com`)
2. Click "Add Website" or press Enter
3. The system automatically checks the SSL certificate

### Manual Checks
- **Check All**: Click "🔄 Check All Now" to check all websites immediately
- **Check Single**: Click "Check" button next to a specific website

### Dashboard Features
- **Status Badges**: Shows the certificate status:
  - 🟢 Valid: Certificate is valid (>30 days remaining)
  - 🟡 Warning: <30 days until expiry
  - 🔴 Critical: <7 days until expiry
  - ⚫ Expired: Certificate has expired
  
- **Statistics**: Top cards show count of each status

- **Export**: Download all data as CSV for records/analysis

### Data Storage
All data is stored in `data.json` file in the ssl-dashboard folder. You can back this up as needed.

## Automatic Scheduling

The system automatically checks all certificates every day at **9:00 AM**. 

To change the schedule time, edit `server.js` line with:
```javascript
schedule.scheduleJob('0 9 * * *', () => {
```

Cron format: `minute hour day-of-month month day-of-week`
- `0 9 * * *` = 9:00 AM daily
- `0 14 * * *` = 2:00 PM daily
- `0 */6 * * *` = Every 6 hours

## API Endpoints

- `GET /api/websites` - Get all websites and their status
- `POST /api/websites` - Add new website
- `DELETE /api/websites/:index` - Delete website
- `POST /api/check/:index` - Check single website
- `POST /api/check-all` - Check all websites

## Troubleshooting

**Dashboard won't load**
- Ensure Node.js is installed: `node --version`
- Check if port 3000 is available
- Try: `start.bat`

**Certificates not checking**
- Check internet connection
- Some corporate networks block SSL connections
- Check server logs in console

**Data not persisting**
- Ensure `data.json` file has write permissions
- Check that ssl-dashboard folder is writable

## System Requirements

- Windows 10/11
- Node.js 14+
- Internet connection for SSL checks
- Port 3000 available

## Notes

- The dashboard refreshes automatically every 30 seconds
- Each check has a 5-second timeout
- Certificate expiry is calculated in days
- Data is stored locally in JSON format for easy backup

## Support

If you encounter issues:
1. Check the browser console (F12) for errors
2. Look at server logs when running `start.bat`
3. Ensure all domains are accessible from your network
