# Google Drive Automation Scripts

This project contains a collection of Google Apps Script (GAS) utilities designed to automate common Google Drive folder management tasks. These scripts are intended to be deployed as Web Apps and triggered via HTTP POST requests from external automation platforms or custom applications.

## Project Overview

The scripts facilitate the following operations:
-   **Listing Subfolders**: Retrieve a list of second-level folders within a specified master folder.
-   **Folder Cloning**: Recursively copy a folder and all its contents (including subfolders and files) to a new destination.
-   **Project Initialization**: Create a new project folder based on a template, copy root files, and identify specific target files (e.g., a contract or template).

## Files

### 1. `list-l2-folders-in-l1-folder.gs`
Retrieves a list of all subfolders inside a given "Master Folder". This is useful for building dynamic dropdowns or selection lists in automation workflows.

-   **Input**: `masterFolderId`
-   **Output**: A list of folder names and IDs, sorted alphabetically.

### 2. `copy-folder-recursiv.gs`
Performs a deep copy of a source subfolder into a target parent folder. It maintains the internal directory structure and copies all files.

-   **Input**: `sourceSubFolderId`, `targetParentId`
-   **Output**: The ID of the newly created (cloned) folder.

### 3. `folder-and-l1-files.gs`
Creates a new project folder and copies all files from the root of a template folder into it. It also allows searching for a specific file by name (e.g., searching for "Contract" to get its specific ID).

-   **Input**: `masterFolderId`, `destinationParentId`, `newFolderName`, `targetFileName` (optional)
-   **Output**: The new folder ID, a map of all copied root files, and the ID of the specifically targeted file.

## Setup Instructions

1.  **Create a New Script**: Go to [script.google.com](https://script.google.com) and create a new project.
2.  **Add Files**: Create files in the GAS editor matching the names in this repository and paste the corresponding code.
3.  **Authorize**: Select the `doPost` function in each file and run it manually once. You will be prompted to grant the script permission to manage your Google Drive files.
4.  **Deploy as Web App**:
    -   Click **Deploy** > **New deployment**.
    -   Select **Web app**.
    -   Set **Execute as**: `Me`.
    -   Set **Who has access**: `Anyone` (or according to your security requirements).
5.  **Use the URL**: Use the provided Web App URL to send POST requests from your automation tool.

## Known Limits and Timeouts

-   **Execution Time**: Google Apps Script has a maximum execution time limit (typically **6 minutes** for personal accounts and **30 minutes** for Workspace accounts). 
-   **Recursion Depth**: `copy-folder-recursiv.gs` performs a deep copy. If your folder structure is extremely large or deep, the script may exceed the execution time limit and timeout before completing.
-   **HTTP Timeout**: Some external platforms (like automation tools) have their own timeout limits for HTTP requests (often 30-300 seconds). Even if the script continues to run in the background, the calling platform might report a timeout error.
-   **Best Practice**: For very large folders, consider breaking the task into smaller chunks or ensuring the folder size is manageable within the 6-minute window.

## Technical Details

-   **MimeType**: All responses are returned as `application/json`.
-   **Error Handling**: Scripts include try-catch blocks and return a JSON object with `status: "error"` and a descriptive message if something goes wrong.
-   **Input Format**: Scripts expect a JSON payload in the body of the POST request.

---

*Note: These scripts are designed for flexibility and can be integrated with any platform capable of making HTTP requests.*
