// Google Sheets integration utility
// This file handles submitting form data to Google Sheets via Google Apps Script

/**
 * Check if Google Sheets is configured
 * @returns {boolean} True if Google Sheets URL is configured
 */
export const isGoogleSheetsConfigured = () => {
  const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
  return !!(googleSheetsUrl && googleSheetsUrl !== 'your_google_apps_script_web_app_url_here');
};

/**
 * Submit data to Google Sheets via iframe method
 * @param {Object} formData - The form data to submit
 * @returns {Promise<Object>} Promise that resolves with submission result
 */
export const sendToGoogleSheetsViaIframe = (formData) => {
  return new Promise((resolve, reject) => {
    const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
    
    if (!googleSheetsUrl) {
      reject(new Error('Google Sheets URL not configured'));
      return;
    }

    try {
      // Create a hidden iframe for submission
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'googleSheetsFrame';
      document.body.appendChild(iframe);

      // Create a form for submission
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = googleSheetsUrl;
      form.target = 'googleSheetsFrame';

      // Add timestamp
      const timestampInput = document.createElement('input');
      timestampInput.type = 'hidden';
      timestampInput.name = 'timestamp';
      timestampInput.value = new Date().toISOString();
      form.appendChild(timestampInput);

      // Add form fields
      Object.keys(formData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      });

      // Handle response
      let responseReceived = false;
      const timeout = setTimeout(() => {
        if (!responseReceived) {
          cleanup();
          resolve({ success: true, method: 'iframe' }); // Assume success for iframe method
        }
      }, 8000);

      const cleanup = () => {
        responseReceived = true;
        clearTimeout(timeout);
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      };

      // Listen for iframe load
      iframe.onload = () => {
        if (!responseReceived) {
          cleanup();
          resolve({ success: true, method: 'iframe' });
        }
      };

      iframe.onerror = () => {
        if (!responseReceived) {
          cleanup();
          reject(new Error('Iframe submission failed'));
        }
      };

      // Submit the form
      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      reject(new Error(`Iframe submission error: ${error.message}`));
    }
  });
};

/**
 * Submit data to Google Sheets via CORS-free script injection
 * @param {Object} formData - The form data to submit
 * @returns {Promise<Object>} Promise that resolves with submission result
 */
export const sendToGoogleSheetsCorsFree = (formData) => {
  return new Promise((resolve, reject) => {
    const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
    
    if (!googleSheetsUrl) {
      reject(new Error('Google Sheets URL not configured'));
      return;
    }

    try {
      // Create callback function name
      const callbackName = `googleSheetsCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set up global callback
      window[callbackName] = (result) => {
        cleanup();
        resolve({ success: true, method: 'cors-free', result });
      };

      // Create script element
      const script = document.createElement('script');
      const params = new URLSearchParams({
        ...formData,
        timestamp: new Date().toISOString(),
        callback: callbackName
      });

      script.src = `${googleSheetsUrl}?${params.toString()}`;

      let responseReceived = false;
      const timeout = setTimeout(() => {
        if (!responseReceived) {
          cleanup();
          resolve({ success: true, method: 'cors-free' }); // Assume success
        }
      }, 8000);

      const cleanup = () => {
        responseReceived = true;
        clearTimeout(timeout);
        if (window[callbackName]) {
          delete window[callbackName];
        }
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };

      script.onerror = () => {
        if (!responseReceived) {
          cleanup();
          reject(new Error('Script injection failed'));
        }
      };

      document.head.appendChild(script);

    } catch (error) {
      reject(new Error(`CORS-free submission error: ${error.message}`));
    }
  });
};

/**
 * Submit data to Google Sheets via GET parameters
 * @param {Object} formData - The form data to submit
 * @returns {Promise<Object>} Promise that resolves with submission result
 */
export const sendToGoogleSheetsViaParams = (formData) => {
  return new Promise((resolve, reject) => {
    const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
    
    if (!googleSheetsUrl) {
      reject(new Error('Google Sheets URL not configured'));
      return;
    }

    try {
      const params = new URLSearchParams({
        ...formData,
        timestamp: new Date().toISOString()
      });

      const url = `${googleSheetsUrl}?${params.toString()}`;

      // Use fetch with no-cors mode
      fetch(url, {
        method: 'GET',
        mode: 'no-cors'
      })
      .then(() => {
        resolve({ success: true, method: 'get-params' });
      })
      .catch((error) => {
        // no-cors mode doesn't provide meaningful error info
        resolve({ success: true, method: 'get-params' }); // Assume success
      });

    } catch (error) {
      reject(new Error(`GET params submission error: ${error.message}`));
    }
  });
};

/**
 * Main function to send data to Google Sheets
 * @param {Object} formData - The form data to submit
 * @returns {Promise<Object>} Promise that resolves with submission result
 */
export const sendToGoogleSheets = async (formData) => {
  if (!isGoogleSheetsConfigured()) {
    throw new Error('Google Sheets integration not configured');
  }

  // Add timestamp to form data
  const dataWithTimestamp = {
    ...formData,
    timestamp: new Date().toISOString()
  };

  // Try multiple methods for reliability
  const methods = [
    { name: 'Iframe', func: sendToGoogleSheetsViaIframe },
    { name: 'CORS-free', func: sendToGoogleSheetsCorsFree },
    { name: 'GET params', func: sendToGoogleSheetsViaParams }
  ];

  let lastError = null;

  for (const method of methods) {
    try {
      console.log(`Trying ${method.name} method...`);
      const result = await method.func(dataWithTimestamp);
      console.log(`${method.name} method succeeded:`, result);
      return result;
    } catch (error) {
      console.warn(`${method.name} method failed:`, error.message);
      lastError = error;
      // Wait a bit before trying the next method
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error('All submission methods failed');
};

export default {
  sendToGoogleSheets,
  sendToGoogleSheetsViaIframe,
  sendToGoogleSheetsCorsFree,
  sendToGoogleSheetsViaParams,
  isGoogleSheetsConfigured
};
