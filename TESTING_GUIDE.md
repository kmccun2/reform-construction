# Google Sheets Integration Testing Guide

## Quick Test

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the website at `http://localhost:5173`

3. Fill out the contact form with test data:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Phone**: 555-123-4567
   - **Service**: Concrete
   - **Message**: This is a test submission

4. Submit the form

5. Check the browser console for submission status messages

6. Check your Google Sheet to verify the data appears

## Verifying Google Sheets Setup

### Check the .env file
Make sure your `.env` file contains a valid Google Apps Script URL:
```env
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec
```

### Test Google Apps Script directly
You can test your Google Apps Script by visiting the URL directly in your browser. It should return a response indicating it's working.

### Expected Console Output
When submitting the form, you should see console messages like:
```
📝 Submitting form data to Google Sheets...
Trying Iframe method...
✅ Form submitted successfully: {success: true, method: 'iframe'}
```

## Troubleshooting

### Form submits but no data appears in Google Sheets
1. Check the browser console for error messages
2. Verify the Google Apps Script is deployed correctly
3. Make sure the Google Sheet has the correct column headers
4. Check the Google Apps Script logs for errors

### Console shows "Google Sheets integration not configured"
1. Check that the `.env` file exists in the project root
2. Verify the `VITE_GOOGLE_SHEETS_URL` is set correctly
3. Restart the development server after changing the `.env` file

### CORS or network errors
The integration uses multiple submission methods to handle CORS issues. If one method fails, it automatically tries the next one.

## Data Format in Google Sheets

Your Google Sheet should have columns in this order:
1. **Timestamp** - ISO date string
2. **Submission ID** - Unique identifier
3. **Name** - Contact's name
4. **Email** - Contact's email
5. **Phone** - Contact's phone number
6. **Service** - Selected service type
7. **Message** - Contact's message

Example row:
```
2024-01-15T10:30:00.000Z | sub_1705312200000 | John Doe | john@example.com | 555-0123 | Concrete | Need a new driveway
```
