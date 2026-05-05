/**
 * PAYLOAD STRUCTURE:
 * {
 *   "masterFolderId": "Template folder ID",
 *   "destinationParentId": "ID of the folder where the new project will be created",
 *   "newFolderName": "Name of the new folder",
 *   "targetFileName": "Text to search for a file in the root (e.g., 'Contract')"
 * }
 *
 * SUCCESS RESPONSE:
 * {
 *   "status": "success",
 *   "newFolderId": "ID of the newly created folder",
 *   "targetFileId": "ID of the found target file (if any)",
 *   "rootFiles": {
 *     "fileName1": "fileId1",
 *     "fileName2": "fileId2"
 *   }
 * }
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    const masterFolderId = data.masterFolderId;
    const destinationParentId = data.destinationParentId;
    const newFolderName = data.newFolderName;
    const targetFileName = data.targetFileName;

    const masterFolder = DriveApp.getFolderById(masterFolderId);
    const parentFolder = DriveApp.getFolderById(destinationParentId);
    
    const newFolder = parentFolder.createFolder(newFolderName);
    const newFolderId = newFolder.getId();

    let rootFiles = {};
    let targetFileId = null;

    const files = masterFolder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const copy = file.makeCopy(file.getName(), newFolder);
      
      const fileName = copy.getName();
      const fileId = copy.getId();
      rootFiles[fileName] = fileId;

      if (targetFileName && fileName.toLowerCase().includes(targetFileName.toLowerCase())) {
        targetFileId = fileId;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "newFolderId": newFolderId,
      "targetFileId": targetFileId,
      "rootFiles": rootFiles
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error", 
      "message": err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}