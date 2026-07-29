import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import customTheme from './theme';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import routes from './routes';
import { useAuth } from './context/AuthContext';

// standard mui theme fallback එකක් සමඟ custom theme merge කිරීම
const defaultTheme = createTheme();
const activeTheme = customTheme || defaultTheme;

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flexGrow: 1 }}>
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AppContent />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;