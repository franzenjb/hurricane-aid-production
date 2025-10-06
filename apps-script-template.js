/**
 * Hurricane Aid System - Google Apps Script
 * Advanced automation for Google Sheets-based emergency response
 */

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  // Email addresses for alerts
  coordinatorEmails: 'coordinator@yourorg.com,backup@yourorg.com',
  redCrossEmail: 'duty.officer@redcross.org',
  
  // Organization info
  orgName: 'Pinellas County Emergency Response',
  orgWebsite: 'https://franzenjb.github.io/hurricane-aid-production/',
  
  // Map and form URLs
  publicMapUrl: 'https://www.google.com/maps/d/view?mid=YOUR_MAP_ID',
  requestFormUrl: 'https://forms.gle/YOUR_REQUEST_FORM',
  
  // Alert settings
  alertRadius: 3, // miles
  urgentKeywords: ['medical', 'emergency', 'urgent', 'elderly', 'disabled', 'children', 'baby', 'infant']
};

/**
 * Send alert email when new high-priority request is submitted
 * Triggered automatically on form submission
 */
function onNewRequestSubmitted(e) {
  const sheet = e.source.getActiveSheet();
  const row = e.range.getRow();
  
  // Get the submitted data
  const data = sheet.getRange(row, 1, 1, 13).getValues()[0];
  const [timestamp, name, phone, email, address, needType, priority, status, notes, photos, source] = data;
  
  // Auto-assign priority based on keywords in notes
  const autoPriority = calculatePriority(notes, needType);
  if (autoPrivority !== priority) {
    sheet.getRange(row, 7).setValue(autoPrivority); // Update priority column
  }
  
  // Send alert for high-priority requests
  if (['High', 'Emergency'].includes(autoPrivority)) {
    sendRequestAlert({
      name, phone, email, address, needType, 
      priority: autoPrivority, notes, timestamp
    });
  }
  
  // Log the request
  console.log(`New ${autoPrivority} priority request: ${needType} for ${name}`);
}

/**
 * Calculate priority based on keywords and request type
 */
function calculatePriority(notes, needType) {
  if (!notes) return 'Medium';
  
  const notesLower = notes.toLowerCase();
  
  // Check for emergency keywords
  if (CONFIG.urgentKeywords.some(keyword => notesLower.includes(keyword))) {
    return 'Emergency';
  }
  
  // Medical requests default to High
  if (needType === 'Medical/Welfare Check') {
    return 'High';
  }
  
  // Look for urgency indicators
  if (notesLower.includes('asap') || notesLower.includes('today') || notesLower.includes('urgent')) {
    return 'High';
  }
  
  return 'Medium';
}

/**
 * Send email alert for new emergency request
 */
function sendRequestAlert(request) {
  const subject = `🚨 ${request.priority} Priority: ${request.needType} Request`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">🚨 New Emergency Request</h2>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h3 style="color: #dc2626; margin-top: 0;">${request.needType} - ${request.priority} Priority</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${request.name}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;"><a href="tel:${request.phone}">${request.phone}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Address:</td><td style="padding: 8px;"><a href="https://maps.google.com/maps?q=${encodeURIComponent(request.address)}" target="_blank">${request.address}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Submitted:</td><td style="padding: 8px;">${request.timestamp}</td></tr>
        </table>
        
        ${request.notes ? `
        <div style="margin: 15px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #f59e0b;">
          <strong>Details:</strong><br>
          ${request.notes}
        </div>
        ` : ''}
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            📋 View All Requests
          </a>
          
          <a href="${CONFIG.publicMapUrl}" 
             style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-left: 10px;">
            🗺️ View Map
          </a>
        </div>
      </div>
      
      <div style="padding: 15px; background-color: #e5e7eb; text-align: center; font-size: 12px; color: #666;">
        ${CONFIG.orgName} - Automated Alert System<br>
        <a href="${CONFIG.orgWebsite}">Emergency Response Portal</a>
      </div>
    </div>
  `;
  
  try {
    MailApp.sendEmail({
      to: CONFIG.coordinatorEmails,
      subject: subject,
      htmlBody: htmlBody
    });
    
    console.log(`Alert sent for ${request.priority} priority request: ${request.name}`);
  } catch (error) {
    console.error('Failed to send alert email:', error);
  }
}

/**
 * Send resource alert when new resource is added
 * Call this manually or set up trigger
 */
function onNewResourceAdded() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Resources');
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(lastRow, 1, 1, 11).getValues()[0];
  
  const [timestamp, resourceType, name, address, hours, capacity, status, phone, details] = data;
  
  if (status === 'Open') {
    sendResourceAlert({
      type: resourceType,
      name: name,
      address: address,
      hours: hours,
      phone: phone,
      details: details
    });
  }
}

/**
 * Send alert about new resource availability
 */
function sendResourceAlert(resource) {
  const subject = `📍 New ${resource.type} Available: ${resource.name}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">📍 New Resource Available</h2>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h3 style="color: #059669; margin-top: 0;">${resource.type}: ${resource.name}</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Location:</td><td style="padding: 8px;"><a href="https://maps.google.com/maps?q=${encodeURIComponent(resource.address)}" target="_blank">${resource.address}</a></td></tr>
          ${resource.hours ? `<tr><td style="padding: 8px; font-weight: bold;">Hours:</td><td style="padding: 8px;">${resource.hours}</td></tr>` : ''}
          ${resource.phone ? `<tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;"><a href="tel:${resource.phone}">${resource.phone}</a></td></tr>` : ''}
        </table>
        
        ${resource.details ? `
        <div style="margin: 15px 0; padding: 15px; background-color: #d1fae5; border-left: 4px solid #059669;">
          <strong>Details:</strong><br>
          ${resource.details}
        </div>
        ` : ''}
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="${CONFIG.publicMapUrl}" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            🗺️ View on Map
          </a>
        </div>
      </div>
      
      <div style="padding: 15px; background-color: #e5e7eb; text-align: center; font-size: 12px; color: #666;">
        ${CONFIG.orgName} - Resource Alert System<br>
        <a href="${CONFIG.orgWebsite}">Emergency Response Portal</a>
      </div>
    </div>
  `;
  
  // Send to coordinators
  MailApp.sendEmail({
    to: CONFIG.coordinatorEmails,
    subject: subject,
    htmlBody: htmlBody
  });
  
  console.log(`Resource alert sent: ${resource.type} - ${resource.name}`);
}

/**
 * Export data for Red Cross in standardized format
 * Call this manually when needed
 */
function exportForRedCross() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requestsSheet = ss.getSheetByName('Requests');
  const resourcesSheet = ss.getSheetByName('Resources');
  
  // Create export summary
  const totalRequests = requestsSheet.getLastRow() - 1;
  const openRequests = requestsSheet.getRange('H:H').getValues().filter(row => 
    row[0] === 'New' || row[0] === 'In Progress'
  ).length;
  
  const exportSummary = `
RED CROSS DATA EXPORT
Generated: ${new Date().toLocaleString()}

SUMMARY:
- Total Requests: ${totalRequests}
- Open Requests: ${openRequests}
- Active Resources: ${resourcesSheet.getLastRow() - 1}

DIRECT LINKS:
- Requests Data: ${requestsSheet.getParent().getUrl()}#gid=${requestsSheet.getSheetId()}
- Resources Data: ${resourcesSheet.getParent().getUrl()}#gid=${resourcesSheet.getSheetId()}
- Public Map: ${CONFIG.publicMapUrl}

CSV Export Links:
- Requests: ${ss.getUrl()}&output=csv&gid=${requestsSheet.getSheetId()}
- Resources: ${ss.getUrl()}&output=csv&gid=${resourcesSheet.getSheetId()}

Contact for questions: ${CONFIG.coordinatorEmails}

---
${CONFIG.orgName}
  `;
  
  MailApp.sendEmail({
    to: CONFIG.redCrossEmail,
    cc: CONFIG.coordinatorEmails,
    subject: `📊 Emergency Response Data Export - ${new Date().toLocaleDateString()}`,
    body: exportSummary
  });
  
  console.log('Red Cross export sent');
}

/**
 * Daily summary report
 * Set up time-based trigger for this function
 */
function sendDailySummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requestsSheet = ss.getSheetByName('Requests');
  
  // Get today's data
  const today = new Date();
  const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'MM/dd/yyyy');
  
  const allData = requestsSheet.getDataRange().getValues();
  const todayRequests = allData.filter(row => {
    if (row[0] instanceof Date) {
      return Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'MM/dd/yyyy') === todayStr;
    }
    return false;
  });
  
  const summary = `
DAILY SUMMARY - ${todayStr}

New Requests Today: ${todayRequests.length}
Priority Breakdown:
- Emergency: ${todayRequests.filter(r => r[6] === 'Emergency').length}
- High: ${todayRequests.filter(r => r[6] === 'High').length}
- Medium: ${todayRequests.filter(r => r[6] === 'Medium').length}
- Low: ${todayRequests.filter(r => r[6] === 'Low').length}

Request Types:
- Food/Water: ${todayRequests.filter(r => r[5] === 'Food/Water').length}
- Debris Removal: ${todayRequests.filter(r => r[5] === 'Debris Removal').length}
- Muck-out: ${todayRequests.filter(r => r[5] === 'Muck-out/Cleaning').length}
- Medical: ${todayRequests.filter(r => r[5] === 'Medical/Welfare Check').length}
- Other: ${todayRequests.filter(r => r[5] === 'Other').length}

View full data: ${ss.getUrl()}
  `;
  
  MailApp.sendEmail({
    to: CONFIG.coordinatorEmails,
    subject: `📊 Daily Hurricane Aid Summary - ${todayStr}`,
    body: summary
  });
}

/**
 * Set up all triggers for automation
 * Run this once to set up the system
 */
function setupTriggers() {
  // Delete existing triggers
  ScriptApp.getProjectTriggers().forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // Form submission trigger (automatic)
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onNewRequestSubmitted')
    .onEvent(ScriptApp.EventType.ON_FORM_SUBMIT)
    .create();
  
  // Daily summary at 8 PM
  ScriptApp.newTrigger('sendDailySummary')
    .timeBased()
    .everyDays(1)
    .atHour(20)
    .create();
  
  console.log('All triggers set up successfully');
}

/**
 * Test function - run this to test email functionality
 */
function testEmailSystem() {
  const testRequest = {
    name: 'Test User',
    phone: '727-555-0123',
    email: 'test@example.com',
    address: '123 Test St, St Petersburg, FL',
    needType: 'Food/Water',
    priority: 'High',
    notes: 'This is a test of the emergency alert system',
    timestamp: new Date()
  };
  
  sendRequestAlert(testRequest);
  console.log('Test email sent');
}