# 📊 Google Sheets Hurricane Aid System - Complete Setup Guide

## 🚀 **30-Minute Setup Instructions**

Follow these steps to have a fully working hurricane aid system using Google Sheets!

---

## **Step 1: Create the Master Google Sheet** ⏱️ *5 minutes*

### 1. Create New Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click "**+ Blank**" to create new sheet
3. Name it: **"Pinellas Hurricane Aid - Master Database"**

### 2. Create Sheet Tabs
Create these tabs (click **+** at bottom):
- **Requests** (rename Sheet1)
- **Volunteers**
- **Resources**
- **Alerts**
- **Dashboard**

### 3. Set up "Requests" Tab
**Column Headers (Row 1):**
```
A: Timestamp
B: Name
C: Phone
D: Email
E: Address
F: Need Type
G: Priority
H: Status
I: Notes
J: Photos
K: Source
L: Assigned To
M: Date Completed
```

**Sample Data (Row 2):**
```
10/6/2025 10:30 AM | John Smith | 727-555-0123 | john@email.com | 123 Main St, St Pete | Food | High | New | Family of 4, no power | [Photo Link] | Phone | Sarah V | 
```

### 4. Set up "Volunteers" Tab
**Column Headers:**
```
A: Timestamp
B: Full Name
C: Phone
D: Email
E: Skills
F: Availability
G: Location/Area
H: Transportation
I: Opt-in Alerts
J: Status
K: Notes
```

### 5. Set up "Resources" Tab
**Column Headers:**
```
A: Timestamp
B: Resource Type
C: Name/Location
D: Address
E: Hours
F: Capacity
G: Status
H: Contact Phone
I: Details
J: Last Updated
K: Notes
```

**Sample Resources:**
```
10/6/2025 9:00 AM | Shelter | Red Cross Shelter | 456 Oak Ave, Clearwater | 24/7 | 200 | Open | 727-555-0199 | Pet-friendly, meals provided
10/6/2025 9:15 AM | Food | Community Kitchen | 789 Pine St, Largo | 11AM-7PM | 500 meals/day | Open | 727-555-0188 | Free hot meals
```

---

## **Step 2: Create Google Forms** ⏱️ *10 minutes*

### **Help Request Form**

1. Go to [forms.google.com](https://forms.google.com)
2. Click **+ Blank form**
3. Title: **"Hurricane Aid Request - Pinellas County"**
4. Description: **"Submit a request for emergency assistance during hurricane recovery"**

**Add These Questions:**

1. **Your Name** *(Short answer, Required)*
2. **Phone Number** *(Short answer, Required)*
3. **Email Address** *(Short answer)*
4. **Full Address** *(Short answer, Required)*
   - Help text: "Include street, city, zip code"
5. **Type of Help Needed** *(Multiple choice, Required)*
   - Food/Water
   - Debris Removal
   - Muck-out/Cleaning
   - Medical/Welfare Check
   - Transportation
   - Other
6. **Priority Level** *(Multiple choice)*
   - Low - Can wait a few days
   - Medium - Needed within 24 hours
   - High - Urgent, needed today
   - Emergency - Immediate assistance required
7. **Details/Notes** *(Paragraph)*
   - Help text: "Describe your situation, special needs, number of people, etc."
8. **Photo Upload** *(File upload)*
   - Help text: "Optional: Upload photos of damage or situation"

**Form Settings:**
- ✅ Collect email addresses
- ✅ Response receipts
- ✅ Allow response editing
- Link to Google Sheet: Your "Requests" tab

### **Volunteer Registration Form**

1. Create another form: **"Volunteer Registration - Hurricane Aid"**

**Questions:**
1. **Full Name** *(Required)*
2. **Phone Number** *(Required)*
3. **Email Address** *(Required)*
4. **Your Skills** *(Checkboxes)*
   - Chainsaw operation
   - Muck-out/cleaning
   - Construction/repair
   - Spanish speaking
   - Medical/first aid
   - Transportation/driving
   - Food preparation
   - Administrative/data entry
   - Other
5. **Availability** *(Multiple choice)*
   - Available now
   - Available today
   - Available this week
   - Weekends only
   - Evenings only
6. **Transportation** *(Multiple choice)*
   - Have own vehicle
   - Have truck/large vehicle
   - Need transportation
7. **Home Base Area** *(Short answer)*
   - Help text: "City or general area where you're based"
8. **Receive Alert Emails?** *(Yes/No)*
9. **Additional Notes** *(Paragraph)*

---

## **Step 3: Create Google My Maps** ⏱️ *8 minutes*

### 1. Create the Map
1. Go to [mymaps.google.com](https://mymaps.google.com)
2. Click **"+ Create A New Map"**
3. Title: **"Pinellas County Hurricane Aid Resources"**
4. Description: **"Live map of emergency resources, shelters, and aid distribution"**

### 2. Import Data from Sheets
1. Click **"Import"** in the left panel
2. Select **"Google Sheets"**
3. Choose your master sheet, "Resources" tab
4. Select columns: **Address, Resource Type, Name/Location, Status**
5. Choose **Address** for location data
6. Click **"Done"**

### 3. Style the Map
1. Click the paint roller icon next to your layer
2. **"Style by data column"** → Select **"Resource Type"**
3. Assign colors:
   - 🏠 Shelter → Red
   - 🍽️ Food → Orange
   - 💧 Water → Blue
   - ⚡ Equipment → Purple
   - 🏥 Medical → Green

### 4. Make Public
1. Click **"Share"**
2. Change to **"Anyone with the link can view"**
3. Copy the link - you'll need this!

---

## **Step 4: Set Up Automated Email Alerts** ⏱️ *7 minutes*

### 1. Create Apps Script
1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Replace default code with this:

```javascript
function sendNewRequestAlert() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(lastRow, 1, 1, 13).getValues()[0];
  
  const [timestamp, name, phone, email, address, needType, priority, status, notes] = data;
  
  // Email settings
  const recipients = 'coordinator@yourorg.com,volunteer1@email.com'; // Update with real emails
  const subject = `🚨 New ${priority} Priority Request: ${needType}`;
  
  const body = `
NEW EMERGENCY REQUEST RECEIVED

Name: ${name}
Phone: ${phone}
Address: ${address}
Need: ${needType}
Priority: ${priority}
Notes: ${notes}

Submitted: ${timestamp}

View all requests: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}

---
Pinellas County Hurricane Aid System
  `;
  
  if (priority === 'Emergency' || priority === 'High') {
    MailApp.sendEmail(recipients, subject, body);
  }
}

function sendResourceAlert(resourceName, address, type) {
  const recipients = 'alerts@yourorg.com'; // Update with real email
  const subject = `📍 New Resource Available: ${type} - ${resourceName}`;
  
  const body = `
NEW RESOURCE ADDED TO MAP

${type}: ${resourceName}
Location: ${address}

View on map: YOUR_MAP_LINK_HERE

This resource has been added to the public aid map and is now visible to residents seeking assistance.

---
Pinellas County Hurricane Aid System
  `;
  
  MailApp.sendEmail(recipients, subject, body);
}
```

### 2. Set Up Triggers
1. Click the clock icon (Triggers)
2. **+ Add Trigger**
3. Function: **sendNewRequestAlert**
4. Event source: **From spreadsheet**
5. Event type: **On form submit**
6. Save

---

## **Step 5: Update Your Website** ⏱️ *2 minutes*

### 1. Get Your URLs
From your setup, collect:
- Request form URL (from Google Forms)
- Volunteer form URL (from Google Forms)  
- Map embed URL (from Google My Maps)
- Master sheet URL (from Google Sheets)

### 2. Update the HTML File
Edit `sheets-version.html` and replace the placeholder URLs in the `SHEETS_CONFIG` object:

```javascript
const SHEETS_CONFIG = {
    requestForm: 'https://forms.gle/YOUR_ACTUAL_REQUEST_FORM_ID',
    volunteerForm: 'https://forms.gle/YOUR_ACTUAL_VOLUNTEER_FORM_ID',
    mapUrl: 'https://www.google.com/maps/d/edit?mid=YOUR_ACTUAL_MAP_ID',
    requestsSheet: 'https://docs.google.com/spreadsheets/d/YOUR_ACTUAL_SHEET_ID/edit#gid=0',
    // ... etc
};
```

---

## **🎉 You're Done! Your System Includes:**

### ✅ **For Residents:**
- Simple request form (no login required)
- Public map showing all resources
- Automatic confirmation emails

### ✅ **For Volunteers:**
- Registration form with skills matching
- Access to request data for coordination
- Email alerts for high-priority requests

### ✅ **For Staff:**
- Real-time dashboard in Google Sheets
- Automatic email notifications
- Easy data export (CSV/Excel)
- Map updating with new resources

### ✅ **For Red Cross:**
- Direct access to Google Sheet
- One-click CSV export
- Real-time coordination data

---

## **🔗 Quick Links Checklist**

After setup, test these links:
- [ ] Request form works and populates sheet
- [ ] Volunteer form works and populates sheet
- [ ] Map displays with sample resources
- [ ] Email alerts trigger on new high-priority requests
- [ ] All sheets are accessible to your team
- [ ] Website loads and all buttons work

---

## **📞 Emergency Contact Updates**

**Important:** Update these in your setup:
1. **Alert email recipients** in Apps Script
2. **Coordinator contact info** in forms
3. **Organization name** in email templates
4. **Website domain** in form confirmations

---

## **🚀 Advanced Features (Optional)**

### **Automatic Priority Assignment**
Add this to your Apps Script to auto-assign priority based on keywords:

```javascript
function autoAssignPriority() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const notes = sheet.getRange(lastRow, 9).getValue(); // Column I = Notes
  
  const urgentKeywords = ['medical', 'emergency', 'elderly', 'children', 'disabled'];
  const notesLower = notes.toLowerCase();
  
  if (urgentKeywords.some(keyword => notesLower.includes(keyword))) {
    sheet.getRange(lastRow, 7).setValue('High'); // Column G = Priority
  }
}
```

### **Duplicate Detection**
Add data validation to flag potential duplicates based on phone numbers.

### **Status Tracking**
Use conditional formatting to highlight new/urgent requests in red.

---

**🎯 Total Setup Time: ~30 minutes**  
**💰 Total Cost: $0**  
**👥 User Complexity: Minimal (just Google account needed)**

Your Google Sheets hurricane aid system is now live and ready for emergency response! 🌀