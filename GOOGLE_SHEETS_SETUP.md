# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the Reform Construction contact form.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Reform Construction - Contact Form Submissions"
4. In the first row, add these column headers:
   - A1: `Timestamp`
   - B1: `Submission ID`
   - C1: `Name`
   - D1: `Email`
   - E1: `Phone`
   - F1: `Service`
   - G1: `Message`

## Step 2: Create Google Apps Script

1. In your Google Sheet, go to `Extensions` → `Apps Script`
2. Delete the default code and paste the following script:

```javascript
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Get parameters from either GET or POST request
    const params = e.parameter || {};
    
    // Log the incoming request for debugging
    console.log('Received request:', params);
    
    // Extract form data
    const timestamp = params.timestamp || new Date().toISOString();
    const submissionId = params.submissionId || `sub_${Date.now()}`;
    const name = params.name || '';
    const email = params.email || '';
    const phone = params.phone || '';
    const service = params.service || '';
    const message = params.message || '';
    
    // Validate required fields
    if (!name || !email || !phone || !message) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Missing required fields'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Add data to the sheet
    sheet.appendRow([
      timestamp,
      submissionId,
      name,
      email,
      phone,
      service,
      message
    ]);
    
    console.log('Data added to sheet successfully');
    
    // Return success response
    const response = {
      success: true,
      message: 'Form submitted successfully',
      timestamp: timestamp,
      submissionId: submissionId
    };
    
    // Handle JSONP callback if provided
    if (params.callback) {
      return ContentService
        .createTextOutput(`${params.callback}(${JSON.stringify(response)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing request:', error);
    
    const errorResponse = {
      success: false,
      error: error.toString(),
      message: 'Server error occurred'
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify setup
function testSetup() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Add a test row
  sheet.appendRow([
    new Date().toISOString(),
    'test_submission',
    'Test User',
    'test@example.com',
    '123-456-7890',
    'Test Service',
    'This is a test message'
  ]);
  
  console.log('Test data added successfully');
}
```

3. Save the script with a name like "Reform Construction Form Handler"

## Step 3: Deploy the Script

1. Click the `Deploy` button in the Apps Script editor
2. Click `New deployment`
3. For "Type", select `Web app`
4. Set the following configuration:
   - **Description**: "Reform Construction Contact Form"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
5. Click `Deploy`
6. You may need to authorize the script:
   - Click `Authorize access`
   - Choose your Google account
   - Click `Advanced` → `Go to [Your Project Name] (unsafe)`
   - Click `Allow`
7. Copy the **Web app URL** that appears

## Step 4: Configure Your Application

1. Open the `.env` file in your project root
2. Replace the `VITE_GOOGLE_SHEETS_URL` value with your Web app URL:

```env
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Fill out and submit the contact form

3. Check your Google Sheet to verify the data appears

## Troubleshooting

### Common Issues

**1. "Script not authorized" error**
- Make sure you completed the authorization process in Step 3
- Try redeploying the script with "Execute as: Me" and "Who has access: Anyone"

**2. Form submits but no data in Google Sheets**
- Check the browser console for errors
- Verify the Web app URL in your `.env` file
- Make sure the Google Sheet has the correct column headers

**3. CORS errors**
- The script uses multiple submission methods to handle CORS issues
- Check the browser console to see which method succeeded

**4. Data appears multiple times**
- This can happen if the form is submitted multiple times quickly
- The submission ID helps track and prevent duplicates

### Testing the Google Apps Script

You can test your Google Apps Script directly:

1. In Apps Script, go to the `testSetup` function
2. Click the play button to run it
3. Check your Google Sheet for a test row

### Viewing Logs

To see detailed logs:

1. In Apps Script, go to `View` → `Logs` or `View` → `Stackdriver Logging`
2. Submit a form and check the logs for any errors

## Security Notes

- The script is set to "Anyone" access, which is necessary for web form submissions
- Only the specific form data is collected and stored
- Consider adding additional validation in the Apps Script if needed

## Data Format

The data will appear in your Google Sheet with these columns:

| Timestamp | Submission ID | Name | Email | Phone | Service | Message |
|-----------|--------------|------|--------|-------|---------|---------|
| 2024-01-15T10:30:00.000Z | sub_1705312200000 | John Doe | john@example.com | 555-0123 | Concrete | Need a new driveway |

This format makes it easy to track submissions, analyze service requests, and follow up with potential customers.
