/**
 * PAYLOAD STRUCTURE:
 * {
 *   "masterFolderId": "ID of your master folder"
 * }
 *
 * SUCCESS RESPONSE:
 * {
 *   "status": "success",
 *   "count": 5,
 *   "folders": [
 *     { "name": "Folder Name", "id": "Folder ID" }
 *   ]
 * }
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const masterFolderId = data.masterFolderId;
    
    if (!masterFolderId) {
      throw new Error("masterFolderId was not provided in the request");
    }

    const masterFolder = DriveApp.getFolderById(masterFolderId);
    const subFolders = masterFolder.getFolders(); // Get folder iterator
    
    let folderList = [];
    
    while (subFolders.hasNext()) {
      const folder = subFolders.next();
      folderList.push({
        "name": folder.getName(),
        "id": folder.getId()
      });
    }
    
    // Sort by name (optional, to ensure consistent order)
    folderList.sort((a, b) => a.name.localeCompare(b.name));

    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "count": folderList.length,
      "folders": folderList
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * IMPORTANT: After pasting the code, select the 'doPost' function and run it manually once 
 * to authorize the script's access to your Google Drive.
 */