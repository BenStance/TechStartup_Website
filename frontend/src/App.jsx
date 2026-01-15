import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import TestComponent from './TestComponent';

// Layout components
import AdminLayout from './layouts/AdminLayout';
import ControllerLayout from './layouts/ControllerLayout';
import ClientLayout from './layouts/ClientLayout';

// Page components
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import VerifyOtp from './pages/VerifyOtp/VerifyOtp';
import ForgetPassword from './pages/ForgetPassword/ForgetPassword';
import AdminHome from './pages/Dashboard/Admin/MainLayout';
import ControllerHome from './pages/Dashboard/Controller/controller';
import ClientHome from './pages/Dashboard/Client/client';
import AdminProfile from './pages/Dashboard/Admin/Profile/Profile';
import Services from './pages/Services/Services';
import Shop from './pages/Shop/Shop';
import Notifications from './pages/Notifications/Notifications';
import Roles from './pages/Roles/Roles';
import Unauthorized from './pages/Unauthorized/Unauthorized';

// Admin page components
import Users from './pages/Dashboard/Admin/Users/Users';
import AdminCreateUser from './pages/Dashboard/Admin/Users/CreateUser';
import UserDetails from './pages/Dashboard/Admin/Users/UserDetails';
import EditUser from './pages/Dashboard/Admin/Users/EditUser';
import AdminProjects from './pages/Dashboard/Admin/Projects/Projects';
import AdminCreateProject from './pages/Dashboard/Admin/Projects/CreateProject';
import ProjectDetails from './pages/Dashboard/Admin/Projects/ProjectDetails';
import EditProject from './pages/Dashboard/Admin/Projects/EditProject';
import AdminServices from './pages/Dashboard/Admin/Services/Services';
import CreateService from './pages/Dashboard/Admin/Services/CreateService';
import ServiceDetails from './pages/Dashboard/Admin/Services/ServiceDetails';
import EditService from './pages/Dashboard/Admin/Services/EditService';
import AdminShop from './pages/Dashboard/Admin/Shop/Shop';
import CreateProduct from './pages/Dashboard/Admin/Shop/CreateProduct';
import EditProduct from './pages/Dashboard/Admin/Shop/EditProduct';
import ProductDetails from './pages/Dashboard/Admin/Shop/ProductDetails';
import AdminRoles from './pages/Dashboard/Admin/Roles/Roles';
import AdminNotifications from './pages/Dashboard/Admin/Notifications/Notifications';
import CreateNotification from './pages/Dashboard/Admin/Notifications/CreateNotification';

// Controller page components
import ControllerProjects from './pages/Dashboard/Controller/Projects/Projects';
import ControllerClients from './pages/Dashboard/Controller/Clients/Clients';
import ControllerClientDetails from './pages/Dashboard/Controller/Clients/ClientDetails';
import ControllerReports from './pages/Dashboard/Controller/Reports/Reports';
import ControllerProjectDetails from './pages/Dashboard/Controller/Projects/ProjectDetails';
import ControllerEditProject from './pages/Dashboard/Controller/Projects/EditProject';
import ControllerServices from './pages/Dashboard/Controller/Services/Services';
import ControllerServiceDetails from './pages/Dashboard/Controller/Services/ServiceDetails';
import ControllerNotifications from './pages/Dashboard/Controller/Notifications/Notifications';
import CreateControllerNotification from './pages/Dashboard/Controller/Notifications/CreateNotification';
import ControllerUploads from './pages/Dashboard/Controller/Uploads/Uploads';

// Controller Selling Components
import SellProducts from './pages/Dashboard/Controller/Selling/SellProducts';
import SalesHistory from './pages/Dashboard/Controller/Selling/SalesHistory';
import ReverseTransaction from './pages/Dashboard/Controller/Selling/ReverseTransaction';

// Admin Selling Components
import AdminSellProducts from './pages/Dashboard/Admin/Selling/SellProducts';
import AdminSalesHistory from './pages/Dashboard/Admin/Selling/SalesHistory';
import AdminReverseTransaction from './pages/Dashboard/Admin/Selling/ReverseTransaction';

// Client page components
import ClientProjects from './pages/Dashboard/Client/Projects/ClientProjects';
import ClientProjectDetails from './pages/Dashboard/Client/Projects/ClientProjectDetails';
import ClientCreateProject from './pages/Dashboard/Client/Projects/ClientCreateProject';
import ClientEditProject from './pages/Dashboard/Client/Projects/ClientEditProject';
import ClientNotifications from './pages/Dashboard/Client/Notifications/ClientNotifications';
import ClientUploads from './pages/Dashboard/Client/Uploads/ClientUploads';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Test route for Tailwind */}
            <Route path="/test" element={<TestComponent />} />

            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminHome />} />
              <Route path="users" element={<Users />} />
              <Route path="users/create" element={<AdminCreateUser />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="users/:id/edit" element={<EditUser />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/create" element={<AdminCreateProject />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="projects/:id/edit" element={<EditProject />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="services/create" element={<CreateService />} />
              <Route path="services/:id" element={<ServiceDetails />} />
              <Route path="services/:id/edit" element={<EditService />} />
              <Route path="shop" element={<AdminShop />} />
              <Route path="product/create" element={<CreateProduct />} />
              <Route path="shop/:id" element={<ProductDetails />} />
              <Route path="shop/edit/:id" element={<EditProduct />} />
              <Route path="selling" element={<AdminSellProducts />} />
              <Route path="selling/history" element={<AdminSalesHistory />} />
              <Route path="selling/history/:id" element={<AdminReverseTransaction />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="notifications/create" element={<CreateNotification />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Controller Dashboard Routes */}
            <Route path="/dashboard/controller" element={
              <ProtectedRoute requiredRole="controller">
                <ControllerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ControllerHome />} />
              <Route path="projects" element={<ControllerProjects />} />
              <Route path="projects/create" element={<AdminCreateProject />} />
              <Route path="projects/:id" element={<ControllerProjectDetails />} />
              <Route path="projects/:id/edit" element={<ControllerEditProject />} />
              <Route path="clients" element={<ControllerClients />} />
              <Route path="clients/:id" element={<ControllerClientDetails />} />
              <Route path="services" element={<ControllerServices />} />
              <Route path="services/:id" element={<ControllerServiceDetails />} />
              <Route path="reports" element={<ControllerReports />} />
              <Route path="notifications" element={<ControllerNotifications />} />
              <Route path="notifications/create" element={<CreateControllerNotification />} />
              <Route path="uploads" element={<ControllerUploads />} />
              <Route path="selling" element={<SellProducts />} />
              <Route path="selling/history" element={<SalesHistory />} />
              <Route path="selling/history/:id" element={<ReverseTransaction />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Client Dashboard Routes */}
            <Route path="/dashboard/client" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ClientHome />} />
              <Route path="projects" element={<ClientProjects />} />
              <Route path="projects/create" element={<ClientCreateProject />} />
              <Route path="projects/:id" element={<ClientProjectDetails />} />
              <Route path="projects/:id/edit" element={<ClientEditProject />} />
              <Route path="notifications" element={<ClientNotifications />} />
              <Route path="uploads" element={<ClientUploads />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            } />

            
           
            
           

            <Route path="/services" element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } />

            <Route path="/shop" element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />

            <Route path="/roles" element={
              <ProtectedRoute requiredRole="admin">
                <Roles />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider >
  );
}

export default App;