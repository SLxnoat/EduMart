import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import customTheme from './theme';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import routes from './routes';
import PrivateRoute from './components/routing/PrivateRoute';
import { useAuth } from './context/AuthContext';

// Safe Theme Fallback: customTheme එක createTheme එකක් හරහා pass කිරීමෙන් MUI Theme Schema එක 100% තහවුරු කරයි
const activeTheme = createTheme(customTheme || {});

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
            {routes.map((route) => {
              // Element එකක් තිබේ නම් එය ගනී, නැතහොත් Component එක Render කරයි
              const Component = route.component;
              const routeElement = route.element || (Component ? <Component /> : null);

              if (route.path === '*') {
                return <Route key={route.path} path={route.path} element={<Navigate to="/404" replace />} />;
              }

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.private ? (
                      <PrivateRoute>{routeElement}</PrivateRoute>
                    ) : (
                      routeElement
                    )
                  }
                />
              );
            })}
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