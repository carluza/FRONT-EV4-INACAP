import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginAdmin from "./pages/admin/LoginAdmin";
import LoginCompany from "./pages/company/LoginCompany";
import LoginClient from "./pages/client/LoginClient";
import RegisterCompany from "./pages/company/RegisterCompany";
import RegisterClient from "./pages/client/RegisterClient";
import ResetPassword from "./pages/admin/ResetPasswordAdmin";
import ResetPasswordCompany from "./pages/company/ResetPasswordCompany";
import ResetPasswordClient from "./pages/client/ResetPasswordClient";
import HomeAdmin from "./pages/admin/HomeAdmin";
import HomeCompany from "./pages/company/HomeCompany";
import AddProduct from "./pages/company/AddProduct";
import Requests from "./pages/company/Requests";
import HomeClient from "./pages/client/HomeClient";
import ProtectedRoute from "./components/ProtectedRoute";
import CompaniesAdmin from "./pages/admin/CompaniesAdmin";
import ProductsClient from "./pages/client/ProductsClient";
import CartClient from "./pages/client/CartClient";
import RequestsAdmin from "./pages/admin/RequestsAdmin";
import RequestsClient from "./pages/client/RequestsClient";
import ClientsAdmin from "./pages/admin/ClientsAdmin";
import ProductsAdmin from "./pages/admin/ProductsAdmin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Rutas de Admin */}
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute userType="admin">
              <HomeAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/forgot-password" element={<ResetPassword />} />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute userType="admin">
              <CompaniesAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute userType="admin">
              <RequestsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute userType="admin">
              <ClientsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute userType="admin">
              <ProductsAdmin />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Empresa */}
        <Route path="/company/login" element={<LoginCompany />} />
        <Route path="/company/registerCompany" element={<RegisterCompany />} />
        <Route
          path="/company/forgot-password"
          element={<ResetPasswordCompany />}
        />
        <Route
          path="/company/home"
          element={
            <ProtectedRoute userType="empresa">
              <HomeCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/add-product"
          element={
            <ProtectedRoute userType="empresa">
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/requests"
          element={
            <ProtectedRoute userType="empresa">
              <Requests />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Cliente */}
        <Route path="/client/login" element={<LoginClient />} />
        <Route path="/client/registerClient" element={<RegisterClient />} />
        <Route
          path="/client/forgot-password"
          element={<ResetPasswordClient />}
        />
        <Route
          path="/client/home"
          element={
            <ProtectedRoute userType="cliente">
              <HomeClient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/products"
          element={
            <ProtectedRoute userType="cliente">
              <ProductsClient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/cart"
          element={
            <ProtectedRoute userType="cliente">
              <CartClient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/requests"
          element={
            <ProtectedRoute userType="cliente">
              <RequestsClient />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
