function onFormSubmit(event) {
  const functionName = "onFormSubmit"; 

//get form info
  Logger.log("Getting form info");
  var formResponses = FormApp.getActiveForm().getResponses();
  var lastResponse = formResponses[formResponses.length-1];
  var lastAnswers = lastResponse.getItemResponses();
  //var timestamp = lastResponse.getTimestamp();
 
  //var DESTINATION = lastAnswers[0].getResponse();
  var DESTINATION = "Japan Private Repo (Japan PMOのみ閲覧可能)";  // 20240606 Globalは一旦は使わない方針
  URL = "https://drive.google.com/drive/folders/0ANQ5Ex6IvvzsUk9PVA";
  FOLDER_ID = "0ANQ5Ex6IvvzsUk9PVA";

  //var FOLDER_ID = getIdFromUrl(URL);
  var OPA_ID = lastAnswers[0].getResponse();
  var ProjectName = lastAnswers[1].getResponse();
  var EmailAddress = lastResponse.getRespondentEmail();
  var NEW_FOLDER_NAME = OPA_ID + " " + ProjectName;
  var EXCLUDE = "";
  if (lastAnswers[2] == null) {
    Logger.log("Nothing will be excluded");
  } else {
    EXCLUDE = lastAnswers[2].getResponse().toString();
  }
 
  Logger.log("Form info retrieved");
  Logger.log("Destination = "+DESTINATION);
  Logger.log("URL = "+URL);
  Logger.log("FOLDER_ID = "+FOLDER_ID);
  Logger.log("OPA_ID = "+OPA_ID);
  Logger.log("ProjectName = "+ProjectName);
  Logger.log("EmailAddress = "+EmailAddress);
  Logger.log("NEW_FOLDER_NAME = "+NEW_FOLDER_NAME);
  Logger.log("EXCLUDE: "+EXCLUDE);

//create folders
  Logger.log("Creating new folders");
  var myFolderID   = createFolder(FOLDER_ID, NEW_FOLDER_NAME);
  var myFolderURL  = "https://drive.google.com/drive/folders/"+myFolderID;
  var PreSalesFolder     = createFolder(myFolderID, "00_提案資料");
  var DeliverablesFolder = createFolder(myFolderID, "01_作成資料");
  var CustomerDocsFolder = createFolder(myFolderID, "02_受領資料");
  var MeetingDocsFolder  = createFolder(myFolderID, "03_会議資料");
  var PMDocsFolder       = createFolder(myFolderID, "99_PM");
  Logger.log("New folders created");

//Templates file locations and names
  Logger.log("Retrieving template files");
  var OneStopFile       = DriveApp.getFileById("1aoK6YUdJxmuXxBJCjIomoiYXzBN40GPFaIRB-omh_r0");
  var PreSalesFile      = DriveApp.getFileById("10mtioQat9rtd4EAD1isczsVR944EnYMLofmlhnC7htE");
  var DeliverablesFile  = DriveApp.getFileById("1AYqvaD-IkcNJAr2Cr7Y0DFcHhQNQd_pNIai3jBWPZ7I");
  var MeetingDocsFile   = DriveApp.getFileById("1sD5-2-1786O4UW-RjNb9riaOpy2syMDn_FDfVTiw-Ik");
  var CustomerDocsFile  = DriveApp.getFileById("17ldiFLpSY2fC9rQrSihaFhjpfeJ1FOqlYl8gNqQsiyI");
  var PMDocsFile        = DriveApp.getFileById("1MONChbDlbhIbZ2EBKy1cZaywZVMpSwHNi9N-L5BM6qs");

  var SalesToDelivery     = DriveApp.getFileById("1UdAmxVsqsCWGhsbIfKsaqgdCd4g5qMYpqNW_DmM8gl0");
  var KickoffTemplate     = DriveApp.getFileById("1oooWDoD3SSYGQAiPYgQwsfKfVcnILyJkeQLBN7j5TJM");
  var CloseTemplate       = DriveApp.getFileById("18s-y4d_akcdxub09Egc1pO-O-1nKxsAQEgFcak7EoXg");
  var StakeholderTemplate = DriveApp.getFileById("1Ab2nf0C_eZ17VymzTLyJWoDoOnZCSca9K5WwWkI9Pbk");
  var TimesheetTemplate   = DriveApp.getFileById("1v3zzmoJ7RMOVelhxXE7SgSEl8S9NLOR4zA1EF9hWcnQ");
  var PSATimesheetTemplate= DriveApp.getFileById("1AypCKbzE3tBR0Szj_uaGu7Hbhk0aZEeMvmLZsoUuyxs");
  var RiskIssueTemplate   = DriveApp.getFileById("1PTu-EKcrHarPe-rNFyyQDroY_TFW2QPke6VpTBlgP5g");
  var GlobalRAIDTemplate  = DriveApp.getFileById("1o8FkfJpi6F9ByjWO3QcnojCq66F_zF_dQ7cT706n-aY");
  Logger.log("Template files retrieved");


//populate folders
  Logger.log("Populating folders");

  if (EXCLUDE.includes("説明ファイル")) {
    Logger.log("Skipping folder explanation files");
  } else {
    Logger.log("Creating folder explanation files");
    PreSalesFile.makeCopy(PreSalesFile.getName(), DriveApp.getFolderById(PreSalesFolder));
    DeliverablesFile.makeCopy(DeliverablesFile.getName(), DriveApp.getFolderById(DeliverablesFolder));
    CustomerDocsFile.makeCopy(CustomerDocsFile.getName(), DriveApp.getFolderById(CustomerDocsFolder));
    MeetingDocsFile.makeCopy(MeetingDocsFile.getName(), DriveApp.getFolderById(MeetingDocsFolder));
    PMDocsFile.makeCopy(PMDocsFile.getName(), DriveApp.getFolderById(PMDocsFolder));
  }

  if (EXCLUDE.includes("One Stop")) {
    Logger.log("Skipping One Stop file");
  } else {
    Logger.log("Creating One Stop file");
    OneStopFile.makeCopy("~ "+NEW_FOLDER_NAME+" One Stop ~", DriveApp.getFolderById(myFolderID));
  }

  if (EXCLUDE.includes("テンプレート")) {
    Logger.log("Skipping templates");
  } else {
    Logger.log("Copying templates");
    KickoffTemplate.makeCopy(NEW_FOLDER_NAME + " Kickoff", DriveApp.getFolderById(MeetingDocsFolder));
    CloseTemplate.makeCopy(NEW_FOLDER_NAME + " Project Close", DriveApp.getFolderById(MeetingDocsFolder));

    StakeholderTemplate.makeCopy(NEW_FOLDER_NAME + " Stakeholder Register", DriveApp.getFolderById(PMDocsFolder));
    TimesheetTemplate.makeCopy(NEW_FOLDER_NAME + " Timesheet", DriveApp.getFolderById(PMDocsFolder));
    PSATimesheetTemplate.makeCopy(NEW_FOLDER_NAME + " Timesheet (PSAデータ連動)", DriveApp.getFolderById(PMDocsFolder));
    RiskIssueTemplate.makeCopy(NEW_FOLDER_NAME + " Risks & Issues Log", DriveApp.getFolderById(PMDocsFolder));
    GlobalRAIDTemplate.makeCopy(NEW_FOLDER_NAME + " Global RAID Log", DriveApp.getFolderById(PMDocsFolder))
  }

  if (EXCLUDE.includes("Sales to Delivery")) {
    Logger.log("Skipping Sales to Delivery Transtition Checklist");
  } else {
    Logger.log("Copying Sales to Delivery Transition Checklist");
    SalesToDelivery.makeCopy(SalesToDelivery.getName(), DriveApp.getFolderById(PreSalesFolder));
  }

  Logger.log("Finished populating folders");

  Logger.log("Sending completion email");
  MailApp.sendEmail({to: EmailAddress, subject: OPA_ID + " " + ProjectName + " " + "project folder has been successfully created", body: "Project folder location:" + " " + myFolderURL}); //Send an email to form submitor 

  Logger.log("Done");

}

// regex to retrieve the Google folder ID given a URL
function getIdFromUrl(url) { 
  //url = "https://drive.google.com/drive/folders/1axLoQC_JIo-l-IFkKwqtWtxO_i_InPMD?usp=sharing";
  //url = "https://drive.google.com/drive/u/0/folders/1axLoQC_JIo-l-IFkKwqtWtxO_i_InPMD";
  url = url.match(/[-\w]{25,}/); 
  return url;
}

// creating folder from parent ID https://yagisanatode.com/2018/07/08/
//https://lzomedia.com/blog/how-to-solve-this-problem-when-it-said-typeerror-cannot-read-property-getlastrow-of-null/
//google-apps-script-how-to-create-folders-in-directories-with-driveapp/
//Creates a folder as a child of the Parent folder with the ID: FOLDER_ID
//Create folder if does not exists only

function createFolder(folderID, folderName){
  var parentFolder = DriveApp.getFolderById(folderID);
  var subFolders = parentFolder.getFolders();
  var doesntExists = true;
  var newFolder = '';
  
  // Check if folder already exists.
  while(subFolders.hasNext()){
    var folder = subFolders.next();
    
    //If the name exists return the id of the folder
    if(folder.getName() === folderName){
      doesntExists = false;
      newFolder = folder;
      return newFolder.getId();
    };
  };
  //If the name doesn't exists, then create a new folder
  if(doesntExists == true){
    //If the file doesn't exists
    newFolder = parentFolder.createFolder(folderName);
    return newFolder.getId();
  };
};