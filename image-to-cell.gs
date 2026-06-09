/**
 * Image to Cell Converter for Google Sheets
 * 
 * This script scans the "Tracking sheet" (specifically Column I) for plain text image URLs
 * and converts them into embedded cell images. It uses a smart dual-method approach:
 * 1. Attempts to bake the image permanently into the cell using SpreadsheetApp.newCellImage().
 * 2. If blocked or restricted by the host server/CDN, falls back to the =IMAGE() formula.
 * 
 * Includes a safety batch limit (1,000 URLs per run) to prevent Google Apps Script execution timeouts.
 */

/**
 * Automatically creates a custom menu when the Google Sheet is opened.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📸 Image Tools')
    .addItem('Process All New Links Now', 'convertLinksSmart')
    .addToUi();
}

/**
 * Scans the entire "Tracking sheet" Column I for plain text URLs starting with "http".
 * - If native fetch succeeds -> Saves as a permanent static image.
 * - If native fetch fails (Macy's block, etc.) -> Wraps in an =IMAGE() formula.
 * Already processed cells are completely ignored.
 */
function convertLinksSmart() {
  // We keep a safety cap of 1,000 only to prevent Google's 6-minute timeout 
  // during your initial 10k row backlog phase.
  const MAX_PROCESS_PER_RUN = 1000; 

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Tracking sheet");
  
  if (!sheet) {
    console.error("Sheet 'Tracking sheet' not found.");
    return;
  }

  const startRow = 2; 
  const columnNumber = 9; // Column I
  const lastRow = sheet.getLastRow();
  
  if (lastRow < startRow) return;

  // Grabbing the whole range is incredibly fast
  const range = sheet.getRange(startRow, columnNumber, lastRow - startRow + 1, 1);
  const values = range.getValues();
  const urlPattern = /^https?:\/\/.+/i;

  let processedCounter = 0;

  for (let i = 0; i < values.length; i++) {
    if (processedCounter >= MAX_PROCESS_PER_RUN) {
      console.log("Reached batch limit of " + MAX_PROCESS_PER_RUN + " to prevent Google timeout. Stopping safely.");
      break;
    }

    let cellValue = values[i][0].toString().trim();
    
    // CRITICAL: This ONLY matches raw text URLs. 
    // Formulas and native images are skipped in microseconds.
    if (urlPattern.test(cellValue)) {
      processedCounter++;
      let currentRow = startRow + i;
      let targetCell = sheet.getRange(currentRow, columnNumber);
      
      try {
        // 1. Try downloading as a permanent static image
        let cellImage = SpreadsheetApp.newCellImage()
          .setSourceUrl(cellValue)
          .setAltTextDescription("Permanently baked image")
          .build();
        
        targetCell.setValue(cellImage);
        
      } catch (e) {
        // 2. FETCH FAILED (Macy's block, strict CDN, etc.)
        // Convert it to an =IMAGE() formula so the browser renders it!
        targetCell.setFormula(`=IMAGE("${cellValue}")`);
      }
    }
  }
  
  console.log("Run finished. Successfully evaluated " + processedCounter + " plain text URLs.");
}