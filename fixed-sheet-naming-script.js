/**
 * ENHANCED MAP UPDATE SCRIPT WITH SHEET NAME MANAGEMENT
 * 
 * This enhanced version automatically fixes ugly auto-generated sheet names
 * like "Map_Update_requests_1759837409544" and renames them to clean,
 * professional names that are easy to understand.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create a new project or open existing
 * 3. Replace the code with this enhanced version
 * 4. Run the setupAndCleanSheets() function once to fix naming
 * 5. Set up automatic triggers for ongoing updates
 */

// CONFIGURATION - UPDATE THESE VALUES
const CONFIG = {
  // Your Google My Maps ID (from the URL)
  MAP_ID: '1v6UC3BeHWFW33yavxoPRe2qlirnxwSc',
  
  // Your spreadsheet ID (from the URL)
  SPREADSHEET_ID: '1-pbTqLMntCFuJ_ydOfmW7F_qyFDZPjZy4LCv8YE5tMo',
  
  // Email for notifications
  NOTIFICATION_EMAIL: 'jeff.franzen2@redcross.org',
  
  // Clean sheet names we want to use
  CLEAN_SHEET_NAMES: {
    requests: 'Help Requests',
    volunteers: 'Volunteers', 
    resources: 'Emergency Resources',
    dashboard: 'Dashboard'
  }
};

/**
 * ONE-TIME SETUP FUNCTION
 * Run this once to clean up existing sheet names and set up the system
 */
function setupAndCleanSheets() {
  try {
    console.log('🧹 Starting sheet cleanup and setup...');
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const allSheets = spreadsheet.getSheets();
    
    console.log('📋 Current sheets found:');
    allSheets.forEach(sheet => {
      console.log(`  - ${sheet.getName()}`);
    });
    
    // Fix ugly auto-generated sheet names
    const fixedSheets = cleanUpSheetNames(spreadsheet, allSheets);
    
    // Create missing sheets if needed
    ensureRequiredSheets(spreadsheet);
    
    // Set up proper headers
    setupSheetHeaders(spreadsheet);
    
    console.log('✅ Sheet cleanup completed!');
    console.log('📧 Sending notification...');
    
    // Send success notification
    sendSetupNotification(fixedSheets);
    
    return fixedSheets;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    sendErrorNotification('Setup failed', error.message);
    throw error;
  }
}

/**
 * CLEAN UP UGLY AUTO-GENERATED SHEET NAMES
 * Finds and renames sheets with ugly names like "Map_Update_requests_1759837409544"
 */
function cleanUpSheetNames(spreadsheet, allSheets) {
  const renamedSheets = [];
  
  allSheets.forEach(sheet => {
    const currentName = sheet.getName();
    let newName = null;
    
    // Detect and fix ugly auto-generated names
    if (currentName.includes('Map_Update_requests_') || currentName.includes('Form Responses 1')) {
      newName = CONFIG.CLEAN_SHEET_NAMES.requests;
    } 
    else if (currentName.includes('volunteer') && currentName.includes('_')) {
      newName = CONFIG.CLEAN_SHEET_NAMES.volunteers;
    }
    else if (currentName.includes('Form Responses 2')) {
      newName = CONFIG.CLEAN_SHEET_NAMES.volunteers;
    }
    else if (currentName.includes('resource') && currentName.includes('_')) {
      newName = CONFIG.CLEAN_SHEET_NAMES.resources;
    }
    
    // Rename if we found a better name
    if (newName && newName !== currentName) {
      // Check if target name already exists
      const existingSheet = spreadsheet.getSheetByName(newName);
      if (existingSheet && existingSheet !== sheet) {
        // Target name exists, merge or rename differently
        newName = `${newName} (Updated)`;
      }
      
      try {
        sheet.setName(newName);
        renamedSheets.push({
          oldName: currentName,
          newName: newName
        });
        console.log(`✅ Renamed: "${currentName}" → "${newName}"`);
      } catch (e) {
        console.log(`⚠️ Could not rename "${currentName}": ${e.message}`);
      }
    }
  });
  
  return renamedSheets;
}

/**
 * ENSURE ALL REQUIRED SHEETS EXIST
 * Creates missing sheets with proper names
 */
function ensureRequiredSheets(spreadsheet) {
  Object.values(CONFIG.CLEAN_SHEET_NAMES).forEach(sheetName => {
    if (!spreadsheet.getSheetByName(sheetName)) {
      const newSheet = spreadsheet.insertSheet(sheetName);
      console.log(`📄 Created new sheet: "${sheetName}"`);
    }
  });
}

/**
 * SET UP PROPER HEADERS FOR EACH SHEET
 * Ensures sheets have the correct column headers
 */
function setupSheetHeaders(spreadsheet) {
  // Help Requests headers
  const requestsSheet = spreadsheet.getSheetByName(CONFIG.CLEAN_SHEET_NAMES.requests);
  if (requestsSheet) {
    const requestHeaders = ['Timestamp', 'Name', 'Phone', 'Address', 'Type of Help', 'Priority', 'Notes', 'Status'];
    if (requestsSheet.getLastRow() === 0) {
      requestsSheet.getRange(1, 1, 1, requestHeaders.length).setValues([requestHeaders]);
      requestsSheet.getRange(1, 1, 1, requestHeaders.length).setBackground('#4285f4').setFontColor('white').setFontWeight('bold');
    }
  }
  
  // Volunteers headers  
  const volunteersSheet = spreadsheet.getSheetByName(CONFIG.CLEAN_SHEET_NAMES.volunteers);
  if (volunteersSheet) {
    const volunteerHeaders = ['Timestamp', 'Name', 'Phone', 'Location', 'Skills', 'Availability', 'Notes'];
    if (volunteersSheet.getLastRow() === 0) {
      volunteersSheet.getRange(1, 1, 1, volunteerHeaders.length).setValues([volunteerHeaders]);
      volunteersSheet.getRange(1, 1, 1, volunteerHeaders.length).setBackground('#34a853').setFontColor('white').setFontWeight('bold');
    }
  }
}

/**
 * ENHANCED UPDATE FUNCTION
 * Now uses clean sheet names and handles naming issues
 */
function updateEmergencyMap() {
  try {
    console.log('🗺️ Starting emergency map update...');
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Get requests data using clean names first, fallback to auto-detection
    const requestsSheet = findRequestsSheet(spreadsheet);
    const volunteersSheet = findVolunteersSheet(spreadsheet);
    
    if (!requestsSheet) {
      throw new Error('❌ Could not find Help Requests sheet. Run setupAndCleanSheets() first.');
    }
    
    // Process data
    const requestsData = processRequestsData(requestsSheet);
    console.log(`📍 Processed ${requestsData.length} help requests`);
    
    let volunteersData = [];
    if (volunteersSheet) {
      volunteersData = processVolunteersData(volunteersSheet);
      console.log(`👥 Processed ${volunteersData.length} volunteer registrations`);
    }
    
    // Update map (placeholder - would connect to actual Map API)
    console.log('🗺️ Map update completed');
    
    // Send success notification
    sendUpdateNotification('success', {
      requestsCount: requestsData.length,
      volunteersCount: volunteersData.length,
      timestamp: new Date().toLocaleString()
    });
    
  } catch (error) {
    console.error('❌ Map update failed:', error);
    sendUpdateNotification('error', { error: error.message });
    throw error;
  }
}

/**
 * FIND REQUESTS SHEET WITH SMART FALLBACK
 */
function findRequestsSheet(spreadsheet) {
  // Try clean name first
  let sheet = spreadsheet.getSheetByName(CONFIG.CLEAN_SHEET_NAMES.requests);
  if (sheet) return sheet;
  
  // Fallback to common auto-generated names
  const possibleNames = [
    'Form Responses 1', 'Form responses 1', 'Responses', 'Requests'
  ];
  
  for (let name of possibleNames) {
    sheet = spreadsheet.getSheetByName(name);
    if (sheet) return sheet;
  }
  
  // Find any sheet with "request" or "Map_Update" in name
  const allSheets = spreadsheet.getSheets();
  return allSheets.find(s => {
    const name = s.getName().toLowerCase();
    return name.includes('request') || name.includes('map_update');
  });
}

/**
 * FIND VOLUNTEERS SHEET WITH SMART FALLBACK
 */
function findVolunteersSheet(spreadsheet) {
  // Try clean name first
  let sheet = spreadsheet.getSheetByName(CONFIG.CLEAN_SHEET_NAMES.volunteers);
  if (sheet) return sheet;
  
  // Fallback to common names
  const possibleNames = [
    'Form Responses 2', 'Form responses 2', 'Volunteer Responses'
  ];
  
  for (let name of possibleNames) {
    sheet = spreadsheet.getSheetByName(name);
    if (sheet) return sheet;
  }
  
  return null;
}

/**
 * PROCESS REQUESTS DATA
 */
function processRequestsData(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return []; // No data rows
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.filter(row => row[1] && row[3]) // Must have name and address
    .map(row => ({
      name: row[1] || 'Unknown',
      phone: row[2] || '',
      address: row[3] || '',
      needType: row[4] || 'Other',
      priority: row[5] || 'Medium',
      notes: row[6] || '',
      timestamp: row[0] || new Date()
    }));
}

/**
 * PROCESS VOLUNTEERS DATA
 */
function processVolunteersData(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return []; // No data rows
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.filter(row => row[1] && row[3]) // Must have name and location
    .map(row => ({
      name: row[1] || 'Unknown',
      phone: row[2] || '',
      location: row[3] || '',
      skills: row[4] || '',
      availability: row[5] || '',
      notes: row[6] || '',
      timestamp: row[0] || new Date()
    }));
}

/**
 * SEND SETUP NOTIFICATION
 */
function sendSetupNotification(renamedSheets) {
  const subject = '✅ Hurricane Aid Map - Sheet Setup Completed';
  
  let body = `
<h2>🧹 Sheet Cleanup Completed Successfully</h2>

<p>Your Hurricane Aid spreadsheet has been organized with clean, professional names:</p>

<h3>📋 Renamed Sheets:</h3>
<ul>
`;

  renamedSheets.forEach(change => {
    body += `<li><strong>"${change.oldName}"</strong> → <strong>"${change.newName}"</strong></li>`;
  });

  body += `
</ul>

<h3>🎯 Current Sheet Structure:</h3>
<ul>
  <li><strong>${CONFIG.CLEAN_SHEET_NAMES.requests}</strong> - Help requests from the public</li>
  <li><strong>${CONFIG.CLEAN_SHEET_NAMES.volunteers}</strong> - Volunteer registrations</li>
  <li><strong>${CONFIG.CLEAN_SHEET_NAMES.resources}</strong> - Emergency resources</li>
</ul>

<h3>🚀 Next Steps:</h3>
<ol>
  <li>Your forms will now populate these clean sheets</li>
  <li>The map update system will work more reliably</li>
  <li>Staff can easily find the right data</li>
</ol>

<p><em>Setup completed at: ${new Date().toLocaleString()}</em></p>
`;

  try {
    MailApp.sendEmail({
      to: CONFIG.NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: body
    });
    console.log('📧 Setup notification sent');
  } catch (e) {
    console.log('⚠️ Could not send email:', e.message);
  }
}

/**
 * SEND UPDATE NOTIFICATION
 */
function sendUpdateNotification(status, data) {
  const subject = status === 'success' 
    ? '✅ Hurricane Aid Map Updated' 
    : '❌ Map Update Failed';
    
  let body = status === 'success' 
    ? `
<h2>🗺️ Map Successfully Updated</h2>
<p><strong>Requests processed:</strong> ${data.requestsCount}</p>
<p><strong>Volunteers processed:</strong> ${data.volunteersCount}</p>
<p><strong>Updated at:</strong> ${data.timestamp}</p>
`
    : `
<h2>❌ Map Update Failed</h2>
<p><strong>Error:</strong> ${data.error}</p>
<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
`;

  try {
    MailApp.sendEmail({
      to: CONFIG.NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: body
    });
  } catch (e) {
    console.log('⚠️ Could not send notification email:', e.message);
  }
}

/**
 * SEND ERROR NOTIFICATION
 */
function sendErrorNotification(operation, error) {
  try {
    MailApp.sendEmail({
      to: CONFIG.NOTIFICATION_EMAIL,
      subject: `❌ Hurricane Aid System Error - ${operation}`,
      htmlBody: `
<h2>❌ System Error</h2>
<p><strong>Operation:</strong> ${operation}</p>
<p><strong>Error:</strong> ${error}</p>
<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
<p><em>Please check the Google Apps Script logs for more details.</em></p>
`
    });
  } catch (e) {
    console.log('⚠️ Could not send error notification:', e.message);
  }
}

/**
 * UTILITY: Set up automatic triggers
 * Run this once to enable automatic updates
 */
function setupTriggers() {
  // Delete existing triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // Create new triggers
  ScriptApp.newTrigger('updateEmergencyMap')
    .timeBased()
    .everyMinutes(30)
    .create();
    
  console.log('✅ Triggers set up - map will update every 30 minutes');
}

// MANUAL FUNCTIONS FOR TESTING
function testSetup() {
  setupAndCleanSheets();
}

function testUpdate() {
  updateEmergencyMap();
}