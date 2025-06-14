# Reform Construction Website

A modern, responsive one-page React website for Reform Construction, a local construction company specializing in residential construction, concrete pouring, and fence building services.

## Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Contact Form**: Fully functional contact form with validation and Google Sheets integration
- **Service Showcase**: Detailed information about construction services
- **Professional Branding**: Consistent visual identity throughout
- **Google Sheets Integration**: Automatic submission of contact form data to Google Sheets

## Services Highlighted

- **Residential Construction**: Custom homes, additions, renovations, and remodeling
- **Concrete Pouring**: Driveways, sidewalks, patios, and foundations
- **Fence Building**: Quality fence installation and repair services

## Technologies Used

- React 18
- Vite (Build tool)
- Modern CSS with Grid and Flexbox
- Form validation with React hooks
- Responsive design principles

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd reform-construction
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## Google Sheets Integration

The contact form can automatically submit data to a Google Sheet for easy tracking and management.

### Setup Google Sheets Integration

1. Follow the detailed instructions in `GOOGLE_SHEETS_SETUP.md`
2. Create a Google Apps Script web app
3. Update the `.env` file with your Google Apps Script URL:
   ```env
   VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

### Features

- **Multiple Submission Methods**: Uses iframe, CORS-free script injection, and GET parameters for reliability
- **Automatic Timestamps**: Each submission includes a timestamp and unique ID
- **Error Handling**: Graceful fallback methods if one approach fails
- **Duplicate Prevention**: Unique submission IDs help prevent duplicate entries

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # Application styles
├── index.css        # Global styles
├── main.jsx         # Application entry point
├── utils/
│   ├── text-content.js    # Website text content
│   └── googleSheets.js    # Google Sheets integration
└── assets/          # Static assets
```

## Contact Information

For any questions about this website or Reform Construction services:

- **Andrew Rish**: andrew@rcrla.com | 225-614-6808
- **Brennyn Granier**: brennyn@rcrla.com | 225-892-3399

## License

This project is created for Reform Construction. All rights reserved.
