import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import routes from './routes';
import PrivateRoute from './components/routing/PrivateRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <Router>
          <div className="App">
            <Header />
            <main>
              <Routes>
                {routes.map((route) => (
                  route.path === '*'
                    ? <Route key={route.path} path={route.path} element={<Navigate to="/404" replace />} />
                    : route.private
                      ? <Route key={route.path} path={route.path} element={<PrivateRoute><route.component /></PrivateRoute>} />
                      : <Route key={route.path} path={route.path} element={route.component} />
                ))}
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;