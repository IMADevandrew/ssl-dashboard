# SSL Certificate Dashboard - PHP Version

A simple, lightweight SSL certificate expiry tracker using PHP and pure JavaScript. No Node.js required!

## Quick Start

### Requirements
- PHP 7.0+ (with OpenSSL support)
- Web browser
- Windows 10/11

### Setup (3 steps)

**1. Download and install PHP** (if you don't have it):
   - Download: https://windows.php.net/download/
   - Or use PHP installer: https://www.php.net/downloads
   - Add PHP to your System PATH

**2. Run the server:**
   - Double-click `start-php.bat` in `C:\Users\rikki\ssl-dashboard\`
   - You'll see:
     ```
     🚀 Dashboard available at:
     http://localhost:8000
     ```
   - Keep this window open

**3. Open your browser:**
   - Go to `http://localhost:8000`
   - Dashboard loads!

## Features

✅ Add/remove websites to monitor  
✅ Check SSL certificate expiry dates  
✅ Status indicators: Valid, Warning, Critical, Expired  
✅ Real-time statistics dashboard  
✅ Export data to CSV  
✅ One-click bulk checks  
✅ Automatic data persistence (JSON file)  
✅ Clean, responsive design  

## How to Use

1. **Add Website:**
   - Enter URL (e.g., `https://example.com`)
   - Press Enter or click "Add Website"
   - Certificate is checked automatically

2. **Manual Check:**
   - Click "Check" next to any website
   - Or click "Check All Now" to check everything

3. **Export Data:**
   - Click "Export Data" to download CSV file

4. **Delete Website:**
   - Click "Delete" next to any website

## File Structure

```
ssl-dashboard/
├── start-php.bat          # Run this to start the server
├── api.php                # Backend API (PHP)
├── data.json              # Your data (created automatically)
├── public/
│   └── index.html         # Dashboard interface
└── README.md              # This file
```

## Data Storage

All data is stored in `data.json` in the same folder. The file contains:
- Website URLs
- SSL expiry dates
- Days until expiry
- Status (Valid, Warning, Critical, Expired)
- Last checked timestamp

You can backup this file anytime.

## Troubleshooting

**PHP not found:**
```
ERROR: PHP is not installed or not in PATH
```
Solution:
- Download PHP from https://windows.php.net/
- Add PHP folder to your System PATH
- Restart your computer

**Port 8000 already in use:**
```
Address already in use
```
Solution:
- Edit `start-php.bat` line:
  ```
  php -S localhost:8000
  ```
  Change `8000` to another port like `8001`

**Website checks failing:**
- Ensure internet connection is active
- Some networks block SSL connections - try a different network
- Check firewall settings

**Can't find start-php.bat:**
- Make sure you're in `C:\Users\rikki\ssl-dashboard\` folder

## System Requirements

- Windows 10/11
- PHP 7.0 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection for SSL checks

## Performance Notes

- Each SSL check takes 2-10 seconds depending on server response
- Bulk checks run sequentially (all at once would be too slow)
- Data updates automatically every 30 seconds on dashboard

## Support Files

**start-php.bat** - Automatically checks for PHP and starts the server  
**api.php** - Handles all SSL certificate checking and data management  
**data.json** - Where your website list is saved  
**public/index.html** - The beautiful dashboard interface  

## Tips

💡 **Backup your data:** Copy `data.json` somewhere safe  
💡 **Export regularly:** Use "Export Data" to keep CSV backups  
💡 **Keep it running:** Server needs to stay open for dashboard to work  
💡 **Tab navigation:** Leave browser tab open to auto-refresh every 30 seconds  

---

That's it! Simple, lightweight, and works right on your machine. No complicated setup required!
