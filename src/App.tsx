/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { InventoryPage } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/estoque" element={<InventoryPage />} />
          <Route path="/vendas" element={<Sales />} />
          <Route path="/financeiro" element={<Finance />} />
          <Route path="/relatorios" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}
