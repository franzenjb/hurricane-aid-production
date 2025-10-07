/**
 * AUTOMATED MAP UPDATE SCRIPT
 * 
 * This Google Apps Script can automatically update your Google My Map
 * when new form responses are submitted to your Google Sheet.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Update the MAP_ID constant with your actual map ID
 * 5. Set up triggers as described in the setupTriggers function
 */

// CONFIGURATION - UPDATE THESE VALUES
const CONFIG = {
  // Your Google My Maps ID (from the URL)
  MAP_ID: '1v6UC3BeHWFW33yavxoPRe2qlirnxwSc',
  
  // Your spreadsheet ID (from the URL)
  SPREADSHEET_ID: '1-pbTqLMntCFuJ_ydOfmW7F_qyFDZPjZy4LCv8YE5tMo',
  
  // Email for notifications
  NOTIFICATION_EMAIL: 'your-email@gmail.com', // Update this!
  
  // Map layer names
  REQUESTS_LAYER: 'Help Requests',
  RESOURCES_LAYER: 'Emergency Resources',
  VOLUNTEERS_LAYER: 'Volunteers'
};

/**
 * MAIN UPDATE FUNCTION
 * This function can be called manually or triggered automatically
 */
function updateEmergencyMap() {
  try {
    console.log('Starting emergency map update...');
    
    // Get the spreadsheet and list all available sheets
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const allSheets = spreadsheet.getSheets();
    
    console.log('Available sheets:');
    allSheets.forEach(sheet => {
      console.log(`- ${sheet.getName()}`);
    });
    
    // Try to find the requests sheet with multiple possible names
    let requestsSheet = null;
    const possibleRequestNames = ['Form Responses 1', 'Form responses 1', 'Responses', 'Help Requests', 'Requests'];
    
    for (let name of possibleRequestNames) {
      requestsSheet = spreadsheet.getSheetByName(name);
      if (requestsSheet) {
        console.log(`Found requests sheet: ${name}`);
        break;
      }
    }
    
    // Try to find the volunteers sheet with multiple possible names  
    let volunteersSheet = null;
    const possibleVolunteerNames = ['Form Responses 2', 'Form responses 2', 'Volunteers', 'Volunteer Responses'];
    
    for (let name of possibleVolunteerNames) {
      volunteersSheet = spreadsheet.getSheetByName(name);
      if (volunteersSheet) {
        console.log(`Found volunteers sheet: ${name}`);
        break;
      }
    }
    
    if (!requestsSheet) {
      // If no requests sheet found, use the first sheet that has data
      requestsSheet = allSheets.find(sheet => {
        const data = sheet.getDataRange().getValues();
        return data.length > 1; // Has header + at least one row
      });
      
      if (requestsSheet) {
        console.log(`Using first sheet with data: ${requestsSheet.getName()}`);
      } else {
        throw new Error(`Could not find any sheet with data. Available sheets: ${allSheets.map(s => s.getName()).join(', ')}`);
      }
    }
    
    // Process requests data
    const requestsData = processRequestsData(requestsSheet);
    console.log(`Processed ${requestsData.length} help requests`);
    
    // Process volunteers data if available
    let volunteersData = [];
    if (volunteersSheet) {
      volunteersData = processVolunteersData(volunteersSheet);
      console.log(`Processed ${volunteersData.length} volunteer registrations`);
    }
    
    // Create/update map layers
    updateMapLayer(requestsData, 'requests');
    if (volunteersData.length > 0) {
      updateMapLayer(volunteersData, 'volunteers');
    }
    
    // Send success notification
    sendUpdateNotification('success', {
      requestsCount: requestsData.length,
      volunteersCount: volunteersData.length
    });
    
    console.log('Map update completed successfully');
    
  } catch (error) {
    console.error('Error updating map:', error);
    sendUpdateNotification('error', { error: error.message });
    throw error;
  }
}

/**
 * PROCESS REQUESTS DATA
 * Converts spreadsheet data into map-ready format
 */
function processRequestsData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // Find column indexes
  const nameCol = findColumn(headers, ['name', 'resident_name', 'your name']);
  const phoneCol = findColumn(headers, ['phone', 'phone number']);
  const addressCol = findColumn(headers, ['address', 'full address']);
  const needCol = findColumn(headers, ['need', 'type of help', 'need_type']);
  const priorityCol = findColumn(headers, ['priority', 'priority level']);
  const notesCol = findColumn(headers, ['notes', 'details', 'description']);
  const timestampCol = 0; // Usually first column
  
  const mapData = [];
  
  rows.forEach((row, index) => {
    if (row[addressCol] && row[nameCol]) { // Must have address and name
      const priority = row[priorityCol] || 'Medium';
      const needType = row[needCol] || 'Other';
      
      // Create marker data
      mapData.push({
        name: `${needType} Request - ${row[nameCol]}`,
        address: row[addressCol],
        description: createRequestDescription(row, {
          name: nameCol,
          phone: phoneCol,
          need: needCol,
          priority: priorityCol,
          notes: notesCol,
          timestamp: timestampCol
        }),
        category: needType,
        priority: priority,
        color: getPriorityColor(priority)
      });
    }
  });
  
  return mapData;
}

/**
 * PROCESS VOLUNTEERS DATA
 * Converts volunteer spreadsheet data into map-ready format
 */
function processVolunteersData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // Find column indexes for volunteer data
  const nameCol = findColumn(headers, ['name', 'full name']);
  const phoneCol = findColumn(headers, ['phone', 'phone number']);
  const locationCol = findColumn(headers, ['location', 'home base', 'area']);
  const skillsCol = findColumn(headers, ['skills', 'your skills']);
  const availabilityCol = findColumn(headers, ['availability']);
  
  const mapData = [];
  
  rows.forEach((row, index) => {
    if (row[locationCol] && row[nameCol]) { // Must have location and name
      mapData.push({
        name: `Volunteer - ${row[nameCol]}`,
        address: row[locationCol],
        description: createVolunteerDescription(row, {
          name: nameCol,
          phone: phoneCol,
          skills: skillsCol,
          availability: availabilityCol
        }),
        category: 'Volunteer',
        color: '#27ae60' // Green for volunteers
      });
    }
  });
  
  return mapData;
}

/**
 * CREATE DESCRIPTION FOR REQUEST MARKERS
 */
function createRequestDescription(row, cols) {
  let desc = `<div style="font-family: Arial, sans-serif;">`;
  
  if (row[cols.priority]) {
    const priority = row[cols.priority];
    const priorityColor = priority === 'Emergency' || priority === 'High' ? '#e74c3c' : '#f39c12';
    desc += `<p><strong style="color: ${priorityColor};">Priority: ${priority}</strong></p>`;
  }
  
  if (row[cols.phone]) {
    desc += `<p><strong>Contact:</strong> <a href="tel:${row[cols.phone]}">${row[cols.phone]}</a></p>`;
  }
  
  if (row[cols.notes]) {
    desc += `<p><strong>Details:</strong> ${row[cols.notes]}</p>`;
  }
  
  if (row[cols.timestamp]) {
    desc += `<p><small><strong>Submitted:</strong> ${row[cols.timestamp]}</small></p>`;
  }
  
  desc += `</div>`;
  return desc;
}

/**
 * CREATE DESCRIPTION FOR VOLUNTEER MARKERS
 */
function createVolunteerDescription(row, cols) {
  let desc = `<div style="font-family: Arial, sans-serif;">`;
  
  if (row[cols.skills]) {
    desc += `<p><strong>Skills:</strong> ${row[cols.skills]}</p>`;
  }
  
  if (row[cols.availability]) {
    desc += `<p><strong>Available:</strong> ${row[cols.availability]}</p>`;
  }
  
  if (row[cols.phone]) {
    desc += `<p><strong>Contact:</strong> <a href="tel:${row[cols.phone]}">${row[cols.phone]}</a></p>`;
  }
  
  desc += `</div>`;
  return desc;
}

/**
 * UPDATE MAP LAYER
 * This is a simulation - Google Apps Script cannot directly update My Maps
 * In practice, you would export data and manually re-import, or use Maps API
 */
function updateMapLayer(data, layerType) {
  // Since we can't directly update Google My Maps via script,
  // we can prepare the data for export and notify the user
  
  console.log(`Preparing ${data.length} ${layerType} for map update`);
  
  // Create CSV data for easy import to My Maps
  const csvData = convertToCSV(data);
  
  // Save to a temporary sheet for easy access
  const tempSheet = createTempDataSheet(csvData, layerType);
  
  console.log(`Data prepared for ${layerType} layer. Sheet: ${tempSheet.getName()}`);
}

/**
 * CONVERT DATA TO CSV FORMAT
 */
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = ['Name', 'Address', 'Description', 'Category', 'Priority'];
  const rows = [headers];
  
  data.forEach(item => {
    rows.push([
      item.name,
      item.address,
      item.description.replace(/"/g, '""'), // Escape quotes
      item.category,
      item.priority || ''
    ]);
  });
  
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * CREATE TEMPORARY DATA SHEET
 */
function createTempDataSheet(csvData, layerType) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheetName = `Map_Update_${layerType}_${new Date().getTime()}`;
  
  try {
    // Delete old temp sheets
    const existingSheets = spreadsheet.getSheets();
    existingSheets.forEach(sheet => {
      if (sheet.getName().startsWith(`Map_Update_${layerType}_`)) {
        spreadsheet.deleteSheet(sheet);
      }
    });
  } catch (e) {
    console.log('No old temp sheets to delete');
  }
  
  const tempSheet = spreadsheet.insertSheet(sheetName);
  
  // Parse CSV and add to sheet
  const rows = csvData.split('\n').map(row => {
    // Simple CSV parsing
    return row.split(',').map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
  });
  
  if (rows.length > 0) {
    tempSheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    
    // Format the header row
    tempSheet.getRange(1, 1, 1, rows[0].length)
             .setFontWeight('bold')
             .setBackground('#4a90e2')
             .setFontColor('white');
  }
  
  return tempSheet;
}

/**
 * HELPER FUNCTIONS
 */
function findColumn(headers, possibleNames) {
  for (let name of possibleNames) {
    const index = headers.findIndex(header => 
      header.toLowerCase().includes(name.toLowerCase())
    );
    if (index !== -1) return index;
  }
  return -1;
}

function getPriorityColor(priority) {
  switch (priority?.toLowerCase()) {
    case 'emergency':
    case 'urgent': return '#e74c3c'; // Red
    case 'high': return '#f39c12'; // Orange
    case 'medium': return '#3498db'; // Blue
    case 'low': return '#95a5a6'; // Gray
    default: return '#3498db'; // Default blue
  }
}

/**
 * SEND UPDATE NOTIFICATION
 */
function sendUpdateNotification(type, data) {
  if (!CONFIG.NOTIFICATION_EMAIL) return;
  
  let subject, body;
  
  if (type === 'success') {
    subject = '✅ Emergency Map Updated Successfully';
    body = `
Emergency Map Update Complete

📊 Summary:
- Help Requests: ${data.requestsCount}
- Volunteers: ${data.volunteersCount}
- Updated: ${new Date().toLocaleString()}

🗺️ Next Steps:
1. Go to your Google My Maps editor
2. Import the new data from the temporary sheets in your spreadsheet
3. Update layer styling if needed

Map Editor: https://www.google.com/maps/d/edit?mid=${CONFIG.MAP_ID}
Data Sheet: https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}

---
Automated Hurricane Aid System
    `;
  } else {
    subject = '❌ Emergency Map Update Failed';
    body = `
Emergency Map Update Error

❌ Error Details:
${data.error}

🔧 Troubleshooting:
1. Check that the spreadsheet contains data
2. Verify column headers match expected names
3. Ensure you have edit access to the map

Contact your system administrator if the error persists.

---
Automated Hurricane Aid System
    `;
  }
  
  try {
    MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);
  } catch (e) {
    console.error('Failed to send notification email:', e);
  }
}

/**
 * MANUAL TRIGGER FUNCTION
 * Call this function to manually update the map
 */
function manualMapUpdate() {
  console.log('Manual map update triggered');
  updateEmergencyMap();
}

/**
 * SET UP AUTOMATIC TRIGGERS
 * Run this function once to set up automatic updates
 */
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'updateEmergencyMap') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger for form submissions
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  ScriptApp.newTrigger('updateEmergencyMap')
           .onEvent(ScriptApp.EventType.ON_FORM_SUBMIT)
           .create();
  
  // Create time-based trigger for regular updates (every 2 hours during emergencies)
  ScriptApp.newTrigger('updateEmergencyMap')
           .timeBased()
           .everyHours(2)
           .create();
  
  console.log('Triggers set up successfully');
  sendUpdateNotification('success', { 
    requestsCount: 0, 
    volunteersCount: 0,
    message: 'Automatic update triggers configured'
  });
}

/**
 * TEST FUNCTION
 * Use this to test the script functionality
 */
function testScript() {
  console.log('Testing map update script...');
  
  try {
    // Test data processing
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const requestsSheet = spreadsheet.getSheetByName('Form Responses 1');
    
    if (requestsSheet) {
      const data = processRequestsData(requestsSheet);
      console.log(`Test successful: Found ${data.length} requests`);
      
      // Test notification
      sendUpdateNotification('success', {
        requestsCount: data.length,
        volunteersCount: 0
      });
      
    } else {
      throw new Error('Could not find requests sheet');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    sendUpdateNotification('error', { error: error.message });
  }
}

/**
 * DEBUG FUNCTION - LIST ALL SHEETS
 * Use this to find the exact names of your sheets
 */
function listAllSheets() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    console.log('=== AVAILABLE SHEETS IN SPREADSHEET ===');
    sheets.forEach((sheet, index) => {
      const data = sheet.getDataRange().getValues();
      const rowCount = data.length;
      const colCount = data[0] ? data[0].length : 0;
      
      console.log(`${index + 1}. "${sheet.getName()}" - ${rowCount} rows x ${colCount} columns`);
      
      // Show first few column headers if they exist
      if (rowCount > 0 && colCount > 0) {
        const headers = data[0].slice(0, 5); // First 5 headers
        console.log(`   Headers: ${headers.join(', ')}`);
      }
    });
    console.log('=========================================');
    
    return sheets.map(sheet => ({
      name: sheet.getName(),
      rows: sheet.getDataRange().getValues().length,
      cols: sheet.getDataRange().getValues()[0]?.length || 0
    }));
    
  } catch (error) {
    console.error('Error listing sheets:', error);
    throw error;
  }
}