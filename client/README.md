# EduMart Client

This is the frontend of the EduMart e-commerce platform, built with React.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory: `cd client`
3. Install dependencies: `npm install`

### Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Removes the build tool and copies configuration files

### Environment Variables

Create a `.env` file in the client directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── services/       # API service calls
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── context/        # React Context providers
├── assets/         # Static assets (images, icons)
├── styles/         # CSS and styling files
└── routes/         # Route definitions
```

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).