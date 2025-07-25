// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import PetProfilePage from './pages/PetProfilePage';
import { ROUTES } from './routes';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>

          <Route path={ROUTES.PET_PROFILE_PATH} element={<PetProfilePage />} />


          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
                <Route path={ROUTES.PRODUCT_DETAIL(':id')} element={<ProductDetailPage />} />
                <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                <Route path={ROUTES.ORDER_CONFIRMATION} element={<OrderConfirmationPage />} />
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
