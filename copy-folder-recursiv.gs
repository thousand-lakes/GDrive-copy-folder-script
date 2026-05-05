/**
 * PAYLOAD STRUCTURE:
 * {
 *   "sourceSubFolderId": "ID of the specific subfolder from the Master Folder",
 *   "targetParentId": "ID of the new project folder (target destination)"
 * }
 *
 * SUCCESS RESPONSE:
 * {
 *   "status": "success",
 *   "copiedFolderId": "ID of the newly created folder"
 * }
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Use .trim() to remove accidental spaces
    const sourceSubFolderId = data.sourceSubFolderId ? data.sourceSubFolderId.trim() : null;
    const targetParentId = data.targetParentId ? data.targetParentId.trim() : null;

    // Validation: check if IDs were received
    if (!sourceSubFolderId || !targetParentId) {
      throw new Error("One of the IDs is empty! Check the keys in the request. Received: sourceSubFolderId=" + sourceSubFolderId + ", targetParentId=" + targetParentId);
    }

    const sourceFolder = DriveApp.getFolderById(sourceSubFolderId);
    const targetParent = DriveApp.getFolderById(targetParentId);
    
    const newSubFolder = targetParent.createFolder(sourceFolder.getName());
    copyRecursive(sourceFolder, newSubFolder);

    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "copiedFolderId": newSubFolder.getId()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error", 
      "message": err.toString() // Now it will specify which ID is empty
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function copyRecursive(source, target) {
  const files = source.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    f.makeCopy(f.getName(), target);
  }
  const folders = source.getFolders();
  while (folders.hasNext()) {
    const sub = folders.next();
    const newSub = target.createFolder(sub.getName());
    copyRecursive(sub, newSub);
  }
}