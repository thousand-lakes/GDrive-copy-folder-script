/**
 * PAYLOAD STRUCTURE:
 * {
 *   "fileId": "ID of the Google Sheet",
 *   "tabName": "Name of the specific tab/sheet to convert"
 * }
 *
 * SUCCESS RESPONSE:
 * {
 *   "status": "success",
 *   "pdfId": "ID of the created PDF file",
 *   "fileName": "Name of the PDF file"
 * }
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const fileId = data.fileId;
    const tabName = data.tabName;

    // 1. Open the original Spreadsheet
    const ss = SpreadsheetApp.openById(fileId);
    const sheet = ss.getSheetByName(tabName);
    if (!sheet) throw new Error("Tab '" + tabName + "' not found.");

    const fileName = ss.getName();

    // 2. Create a temporary spreadsheet for a high-fidelity export
    // This avoids the 'export URL' which ruins transparency
    const tempSS = SpreadsheetApp.create("Temp_PDF_Export");
    const tempId = tempSS.getId();
    
    // 3. Copy the specific tab to the temp file
    const copiedSheet = sheet.copyTo(tempSS);
    copiedSheet.setName(tabName);
    
    // Remove the default empty sheet created with the new file
    tempSS.deleteSheet(tempSS.getSheets()[0]);

    // 4. Generate the PDF using the native engine (preserves transparency)
    // This mimics the manual "File > Download > PDF" behavior
    const pdfBlob = tempSS.getAs('application/pdf').setName(fileName + ".pdf");

    // 5. Save to the same folder as the original (Shared Drive compatible)
    const file = DriveApp.getFileById(fileId);
    const parents = file.getParents();
    let folder = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
    
    const pdfFile = folder.createFile(pdfBlob);

    // 6. Cleanup: Trash the temporary spreadsheet
    DriveApp.getFileById(tempId).setTrashed(true);

    return ContentService.createTextOutput(JSON.stringify({
      "pdfId": pdfFile.getId(),
      "status": "success",
      "fileName": pdfFile.getName()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}