/**
 * Google Apps Script Web App - Find or Create Year/Month Subfolders
 * 
 * ==========================================
 * INPUT DATA FORMAT (HTTP POST Request)
 * ==========================================
 * The script is triggered via an HTTP POST request (typically when deployed as a Web App).
 * The input parameters are passed to the script via the standard Apps Script event object 'e'.
 * 
 * Query Parameters or POST Form Parameters (application/x-www-form-urlencoded):
 * - folderId {string} (Required): The 33-character Google Drive folder ID of the root/parent folder
 *   where the Year and Month subfolders should be located.
 * 
 * Example URL query parameter:
 * https://script.google.com/macros/s/.../exec?folderId=1a2b3c4d5e6f7g8h9i0j...
 * 
 * Example POST body:
 * folderId=1a2b3c4d5e6f7g8h9i0j...
 * 
 * ==========================================
 * OUTPUT DATA FORMAT (Plain Text)
 * ==========================================
 * The script returns plain text content (ContentService.TextOutput) with a content type of text/plain.
 * 
 * 1. Success Scenario:
 *    - Returns: The Google Drive folder ID of the created or found Month subfolder (e.g., "1x2y3z...").
 *    - Content Type: text/plain
 * 
 * 2. Missing parameter Scenario:
 *    - Returns: "Error: Missing folderId parameter."
 *    - Content Type: text/plain
 * 
 * 3. Execution Error Scenario (e.g., Folder not found, permission denied):
 *    - Returns: "Error: <error_message>" (e.g., "Error: Exception: Unexpected error while getting the folder.")
 *    - Content Type: text/plain
 */

/**
 * Handles HTTP POST requests.
 * 
 * @param {Object} e - The Google Apps Script event object.
 * @param {Object} e.parameter - A key-value map of URL query parameters or POST form parameters.
 * @param {string} e.parameter.folderId - The parent folder ID.
 * @return {ContentService.TextOutput} Plain text response containing the month folder ID or an error message.
 */
function doPost(e) {
  const folderId = e.parameter.folderId;
  if (!folderId) {
    return ContentService.createTextOutput("Error: Missing folderId parameter.");
  }
  
  try {
    const resultId = getOrCreateFolderStructure(folderId);
    return ContentService.createTextOutput(resultId);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message);
  }
}


/**
 * Creates or finds the 'YYYY' and 'MM MonthName' subfolders.
 * @param {string} parentId The ID of the root folder.
 * @return {string} The ID of the month folder.
 */
function getOrCreateFolderStructure(parentId) {
  const parentFolder = DriveApp.getFolderById(parentId);
  const now = new Date();
  
  // 1. Handle Year Folder (e.g., '2026')
  const yearName = now.getFullYear().toString();
  const yearFolder = getOrCreateSubFolder(parentFolder, yearName);
  
  // 2. Handle Month Folder (e.g., '05 Mai')
  const estonianMonths = [
    "Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", 
    "Juuli", "August", "September", "Oktoober", "November", "Detsember"
  ];
  
  const monthIndex = now.getMonth(); // 0-indexed
  const monthNum = ("0" + (monthIndex + 1)).slice(-2); // Ensures '05'
  const monthName = estonianMonths[monthIndex];
  const monthFolderName = monthNum + " " + monthName;
  
  const monthFolder = getOrCreateSubFolder(yearFolder, monthFolderName);
  
  return monthFolder.getId();
}

/**
 * Helper to find a subfolder by name or create it if missing.
 */
function getOrCreateSubFolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parent.createFolder(name);
  }
}