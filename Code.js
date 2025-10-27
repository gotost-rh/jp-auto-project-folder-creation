/**
 * Configuration constants for the project folder creation automation
 */
const CONFIG = {
  DESTINATION_FOLDER_ID: '0ANQ5Ex6IvvzsUk9PVA',
  DESTINATION_NAME: 'Japan Private Repo (Japan PMOのみ閲覧可能)',
  
  // Template folder to copy from
  TEMPLATE_FOLDER_ID: '1t9heIEB3EZI4IrZjlzk2C8lUT3I00W7e',
  
  // Template placeholder to replace in file names
  TEMPLATE_PLACEHOLDER: '[TEMPLATE]'
};

/**
 * Main form submission handler
 * Triggered when a new form response is submitted
 * 
 * @param {Object} event - Form submission event (not currently used)
 */
function onFormSubmit(event) {
  Logger.log('Starting project folder creation process');
  
  try {
    const formData = getFormData();
    logFormData(formData);
    
    // Create root project folder
    const projectFolderId = createFolder(CONFIG.DESTINATION_FOLDER_ID, formData.folderName);
    const projectFolderUrl = `https://drive.google.com/drive/folders/${projectFolderId}`;
    
    // Copy entire template folder structure
    const templateFolder = DriveApp.getFolderById(CONFIG.TEMPLATE_FOLDER_ID);
    const destinationFolder = DriveApp.getFolderById(projectFolderId);
    
    // Pass the full folder name (OPA_ID + ProjectName) for template replacement
    copyFolderContents(templateFolder, destinationFolder, formData.folderName);
    
    sendConfirmationEmail(formData, projectFolderUrl);
    
    Logger.log('Project folder creation completed successfully');
  } catch (error) {
    Logger.log(`Error in onFormSubmit: ${error.message}`);
    throw error;
  }
}

/**
 * Extracts and parses form submission data
 * 
 * @returns {Object} Form data including OPA ID, project name, email, and folder name
 */
function getFormData() {
  const formResponses = FormApp.getActiveForm().getResponses();
  const lastResponse = formResponses[formResponses.length - 1];
  const itemResponses = lastResponse.getItemResponses();
  
  const opaId = itemResponses[0].getResponse();
  const projectName = itemResponses[1].getResponse();
  const emailAddress = lastResponse.getRespondentEmail();
  
  return {
    opaId,
    projectName,
    emailAddress,
    folderName: `${opaId} ${projectName}`
  };
}

/**
 * Logs form data for debugging purposes
 * 
 * @param {Object} formData - The parsed form data
 */
function logFormData(formData) {
  Logger.log(`OPA ID: ${formData.opaId}`);
  Logger.log(`Project Name: ${formData.projectName}`);
  Logger.log(`Email: ${formData.emailAddress}`);
  Logger.log(`New Folder Name: ${formData.folderName}`);
}

/**
 * Recursively copies all contents from source folder to destination folder
 * Recreates folder structure and copies all files with name replacements
 * 
 * @param {GoogleAppsScript.Drive.Folder} sourceFolder - Source template folder
 * @param {GoogleAppsScript.Drive.Folder} destinationFolder - Destination folder
 * @param {string} replacementText - Text to replace [TEMPLATE] placeholder with (OPA_ID + ProjectName)
 */
function copyFolderContents(sourceFolder, destinationFolder, replacementText) {
  Logger.log(`Copying contents from "${sourceFolder.getName()}" to "${destinationFolder.getName()}"`);
  
  // Copy all files in the current folder
  const files = sourceFolder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const originalFileName = file.getName();
    const newFileName = replaceTemplatePlaceholder(originalFileName, replacementText);
    
    Logger.log(`Copying file: "${originalFileName}" as "${newFileName}"`);
    file.makeCopy(newFileName, destinationFolder);
  }
  
  // Recursively copy all subfolders
  const subFolders = sourceFolder.getFolders();
  while (subFolders.hasNext()) {
    const subFolder = subFolders.next();
    const subFolderName = subFolder.getName();
    
    Logger.log(`Creating subfolder: "${subFolderName}"`);
    const newSubFolder = destinationFolder.createFolder(subFolderName);
    
    // Recursively copy the subfolder's contents
    copyFolderContents(subFolder, newSubFolder, replacementText);
  }
}

/**
 * Replaces the [TEMPLATE] placeholder in a string with the replacement text
 * 
 * @param {string} text - Original text containing [TEMPLATE] placeholder
 * @param {string} replacementText - Text to replace placeholder with (OPA_ID + ProjectName)
 * @returns {string} Text with placeholder replaced
 */
function replaceTemplatePlaceholder(text, replacementText) {
  // Escape special regex characters in the placeholder (particularly the square brackets)
  const escapedPlaceholder = CONFIG.TEMPLATE_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escapedPlaceholder, 'g'), replacementText);
}

/**
 * Sends confirmation email to the form submitter
 * 
 * @param {Object} formData - Form data including email address
 * @param {string} folderUrl - URL of the created project folder
 */
function sendConfirmationEmail(formData, folderUrl) {
  Logger.log('Sending confirmation email');
  
  const subject = `${formData.opaId} ${formData.projectName} project folder has been successfully created`;
  const body = `Project folder location: ${folderUrl}`;
  
  MailApp.sendEmail({
    to: formData.emailAddress,
    subject: subject,
    body: body
  });
}

/**
 * Extracts the Google Drive folder ID from a URL using regex
 * 
 * @param {string} url - Google Drive folder URL
 * @returns {string|null} Extracted folder ID or null if not found
 */
function getIdFromUrl(url) { 
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

/**
 * Creates a folder in Google Drive if it doesn't already exist
 * If the folder exists, returns the existing folder's ID
 * 
 * @param {string} parentFolderId - ID of the parent folder
 * @param {string} folderName - Name of the folder to create
 * @returns {string} ID of the created or existing folder
 */
function createFolder(parentFolderId, folderName) {
  const parentFolder = DriveApp.getFolderById(parentFolderId);
  const subFolders = parentFolder.getFolders();
  
  // Check if folder already exists
  while (subFolders.hasNext()) {
    const folder = subFolders.next();
    
    if (folder.getName() === folderName) {
      Logger.log(`Folder "${folderName}" already exists`);
      return folder.getId();
    }
  }
  
  // Create new folder if it doesn't exist
  Logger.log(`Creating new folder: "${folderName}"`);
  const newFolder = parentFolder.createFolder(folderName);
      return newFolder.getId();
}