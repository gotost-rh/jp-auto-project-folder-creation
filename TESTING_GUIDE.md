# Testing Guide - Japan PM Tools Auto Project Folder Creation

This guide explains how to safely test the script before deploying to production.

## Testing Strategy Overview

Since Google Apps Script runs in Google's cloud environment, you cannot execute it truly locally. However, you can set up a safe test environment to validate changes before deploying to production.

## Option 1: Test Environment (Recommended)

### Setup Steps

#### Step 1: Create Test Folders in Google Drive

1. **Create a Test Destination Folder**
   - Create a new folder in Google Drive called `TEST - Japan PM Projects`
   - Copy the folder ID from the URL
   - This is where test project folders will be created

2. **Create a Test Template Folder**
   - Duplicate your production template folder
   - Rename it to `TEST - Template Project`
   - Copy the folder ID
   - Make any experimental changes here without affecting production

#### Step 2: Create a Test Google Form

1. Duplicate your production form
2. Rename it to `TEST - Project Folder Creation`
3. Keep the same fields:
   - OPA ID
   - Project Name
   - Email (or your test email)

#### Step 3: Create a Test Script Project

1. Open [Google Apps Script](https://script.google.com)
2. Create a new project named `TEST - Japan PM Tools`
3. Copy your `Code.js` content into the script editor
4. **Update the CONFIG to point to test folders:**

```javascript
const CONFIG = {
  DESTINATION_FOLDER_ID: 'YOUR_TEST_DESTINATION_FOLDER_ID',  // ← Test folder
  DESTINATION_NAME: 'TEST - Japan PM Projects',
  TEMPLATE_FOLDER_ID: 'YOUR_TEST_TEMPLATE_FOLDER_ID',  // ← Test template
  TEMPLATE_PLACEHOLDER: '[TEMPLATE]'
};
```

5. Save the project

#### Step 4: Connect Test Form to Test Script

1. In the Test Script Editor, click "Triggers" (clock icon)
2. Add a new trigger:
   - Function: `onFormSubmit`
   - Event source: "From form"
   - Select your TEST form
   - Event type: "On form submit"
3. Authorize the script when prompted

#### Step 5: Test!

1. Submit your test form with test data:
   - OPA ID: `TEST-001`
   - Project Name: `Test Project`
2. Check the test destination folder for the created project
3. Verify files were copied and renamed correctly
4. Check execution logs: Executions → Click on the run → View logs

### Test Environment Structure

```
Production Environment:
├── Production Form → Production Script
├── Production Destination Folder (0ANQ5Ex6IvvzsUk9PVA)
└── Production Template (1t9heIEB3EZI4IrZjlzk2C8lUT3I00W7e)

Test Environment:
├── TEST Form → TEST Script
├── TEST Destination Folder (your test folder ID)
└── TEST Template (your test template ID)
```

### Benefits
- ✅ Safe isolated testing
- ✅ Won't affect production data
- ✅ Can test with real Google Apps Script environment
- ✅ Easy to verify folder creation and file naming
- ✅ Can experiment freely

### Deployment Process

After successful testing:

1. Update production script's `Code.js` with tested changes
2. Update production template folder if needed
3. Test one more time with production script (optional)
4. Monitor first few production runs

## Option 2: Local Development with clasp

`clasp` (Command Line Apps Script Projects) allows you to develop locally and push to Google Apps Script.

### Installing clasp

```bash
# Install clasp globally
npm install -g @google/clasp

# Login to your Google account
clasp login

# Clone your existing script (or create new)
clasp clone <SCRIPT_ID>
```

### Getting Your Script ID

1. Open your Apps Script project in browser
2. Click "Project Settings" (gear icon)
3. Copy the "Script ID"

### Setup for This Project

```bash
cd /home/ssgoto/src/jp-auto-project-folder-creation

# Clone your script
clasp clone YOUR_SCRIPT_ID

# This creates:
# - .clasp.json (configuration)
# - appsscript.json (manifest)
# - Code.js (your script)
```

### Development Workflow with clasp

```bash
# 1. Make changes to Code.js locally in your editor

# 2. Push changes to Google Apps Script
clasp push

# 3. Open in browser to test
clasp open

# 4. View logs
clasp logs

# 5. Test by submitting form or running function manually
```

### clasp.json Configuration

Create or update `.clasp.json`:

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "."
}
```

### Benefits
- ✅ Use your local editor (Cursor, VS Code, etc.)
- ✅ Version control with git
- ✅ Better code completion
- ✅ Still executes in Google's environment

### Limitations
- ⚠️ Still requires pushing to Google to test
- ⚠️ Must have internet connection
- ⚠️ Cannot run truly offline

## Option 3: Manual Testing in Apps Script Editor

The simplest approach for quick tests:

### Steps

1. Open your Apps Script project in browser
2. Make changes directly in the editor
3. Click "Run" → Select `onFormSubmit`
4. Or submit a test form
5. View logs: View → Logs or Executions

### Testing Without Form Submission

You can test individual functions:

```javascript
// Add this temporary test function
function testScript() {
  // Mock form data
  const testFormData = {
    opaId: 'TEST-001',
    projectName: 'Test Project',
    emailAddress: 'your-email@example.com',
    folderName: 'TEST-001 Test Project'
  };
  
  // Test folder creation
  const projectFolderId = createFolder(CONFIG.DESTINATION_FOLDER_ID, testFormData.folderName);
  Logger.log('Created folder ID: ' + projectFolderId);
  
  // Test template copying
  const templateFolder = DriveApp.getFolderById(CONFIG.TEMPLATE_FOLDER_ID);
  const destinationFolder = DriveApp.getFolderById(projectFolderId);
  copyFolderContents(templateFolder, destinationFolder, testFormData.folderName);
  
  Logger.log('Test completed!');
}
```

Run this function to test without submitting a form.

### Benefits
- ✅ Quick and simple
- ✅ No additional setup
- ✅ Direct access to logs

### Limitations
- ⚠️ Manual process
- ⚠️ No version control in editor
- ⚠️ Risk of accidentally modifying production

## Option 4: Unit Testing with Gas-Unit (Advanced)

For comprehensive testing, you can write unit tests.

### Install gas-unit

```bash
npm install -D gas-unit
```

### Example Unit Test

Create `Code.test.js`:

```javascript
// Mock Google Apps Script services
const mockDriveApp = {
  getFolderById: (id) => ({
    getName: () => 'Mock Folder',
    getFolders: () => ({ hasNext: () => false }),
    getFiles: () => ({ hasNext: () => false }),
    createFolder: (name) => ({ getId: () => 'mock-id-123' })
  })
};

// Test placeholder replacement
function testReplaceTemplatePlaceholder() {
  const CONFIG = { TEMPLATE_PLACEHOLDER: '[TEMPLATE]' };
  
  function replaceTemplatePlaceholder(text, replacementText) {
    const escapedPlaceholder = CONFIG.TEMPLATE_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(escapedPlaceholder, 'g'), replacementText);
  }
  
  // Test cases
  const tests = [
    {
      input: '[TEMPLATE] One Stop',
      replacement: 'JP-12345 Test Project',
      expected: 'JP-12345 Test Project One Stop'
    },
    {
      input: '~[TEMPLATE] One Stop~',
      replacement: 'JP-12345 Test',
      expected: '~JP-12345 Test One Stop~'
    },
    {
      input: 'No Template Here',
      replacement: 'JP-12345 Test',
      expected: 'No Template Here'
    }
  ];
  
  tests.forEach(test => {
    const result = replaceTemplatePlaceholder(test.input, test.replacement);
    if (result !== test.expected) {
      throw new Error(`Expected "${test.expected}", got "${result}"`);
    }
    console.log(`✓ Test passed: ${test.input}`);
  });
}

// Run tests
testReplaceTemplatePlaceholder();
```

### Running Unit Tests Locally

```bash
node Code.test.js
```

### Benefits
- ✅ True local testing
- ✅ Fast feedback
- ✅ Good for logic testing

### Limitations
- ⚠️ Cannot test Google Apps Script APIs
- ⚠️ Requires mocking
- ⚠️ More setup required

## Recommended Testing Workflow

### For Small Changes
1. Use manual testing in Apps Script editor
2. Submit test form
3. Verify in logs
4. Deploy to production

### For Major Changes
1. Set up test environment (Option 1)
2. Update test script with changes
3. Test thoroughly with multiple scenarios
4. Use clasp for local development (Option 2)
5. Once verified, update production script
6. Monitor first few production runs

### For Refactoring
1. Write unit tests for critical functions (Option 4)
2. Use clasp for local development (Option 2)
3. Test in test environment (Option 1)
4. Deploy to production

## Testing Checklist

Before deploying to production:

- [ ] Test with typical form data
- [ ] Test with special characters in project name
- [ ] Test with long project names
- [ ] Verify all files are copied
- [ ] Verify `[TEMPLATE]` replacement works correctly
- [ ] Check folder structure matches template
- [ ] Verify confirmation email is sent
- [ ] Review execution logs for errors
- [ ] Test with edge cases (empty fields, special characters, etc.)
- [ ] Verify no impact on existing projects

## Common Test Scenarios

### Test Case 1: Basic Functionality
- OPA ID: `JP-12345`
- Project Name: `Customer ABC Implementation`
- Expected: Folder created with proper name, all files copied and renamed

### Test Case 2: Special Characters
- OPA ID: `JP-67890`
- Project Name: `Project & Co. (Test)`
- Expected: Folder created, special characters handled gracefully

### Test Case 3: Long Names
- OPA ID: `JP-11111`
- Project Name: `Very Long Project Name With Many Words In It`
- Expected: All works correctly, no truncation issues

### Test Case 4: Japanese Characters
- OPA ID: `JP-22222`
- Project Name: `テストプロジェクト顧客名`
- Expected: Japanese characters preserved correctly

### Test Case 5: Files Without [TEMPLATE]
- Verify files without `[TEMPLATE]` are copied with original names
- Example: `~ PM フォルダ内容 ~` stays as-is

## Monitoring Production

After deployment:

1. **Watch first few runs**
   - Check Executions tab
   - Verify logs look good
   - Spot-check created folders

2. **Set up notifications**
   - Apps Script can email you on errors
   - Add error handling to send alerts

3. **Regular audits**
   - Periodically check created folders
   - Ensure template copying works correctly
   - Verify naming conventions are followed

## Rollback Plan

If something goes wrong:

1. **Immediate**: Disable the trigger
   - Go to Triggers
   - Click ⋮ menu → Delete trigger
   - This stops automatic execution

2. **Fix**: Revert to previous version
   - Check git history for last working version
   - Update script in Apps Script editor
   - Test in test environment

3. **Re-enable**: Once fixed
   - Re-create the trigger
   - Monitor closely

## Getting Help

If you encounter issues during testing:

1. Check execution logs first
2. Review error messages carefully
3. Check the MAINTENANCE_GUIDE.md troubleshooting section
4. Verify folder IDs and permissions
5. Try in test environment with simplified template

---

**Remember**: Always test in a safe environment before deploying to production!

**Last Updated**: October 28, 2025

