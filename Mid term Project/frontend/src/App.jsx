import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Signup, Login, VerifyEmail, ForgotPassword, ResetPassword } from "./pages/AuthPages";
import { Home, Shop, ProductDetail, Cart, Checkout, Account, Admin } from "./pages/StorePages";
import Policies from "./pages/Policies";

function Private({children}) { return <ProtectedRoute>{children}</ProtectedRoute>; }
export default function App() {
  return <Routes>
    <Route path="/signup" element={<Signup/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/verify-email" element={<VerifyEmail/>}/>
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/reset-password" element={<ResetPassword/>}/>
    <Route element={<Layout/>}>
      <Route path="/" element={<Navigate to="/signup" replace/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path="/shop" element={<Shop/>}/>
      <Route path="/product/:slug" element={<ProductDetail/>}/>
      <Route path="/cart" element={<Cart/>}/>
      <Route path="/checkout" element={<Private><Checkout/></Private>}/>
      <Route path="/account" element={<Private><Account/></Private>}/>
      <Route path="/admin" element={<Private><Admin/></Private>}/>
      <Route path="/policies" element={<Policies/>}/>
      <Route path="*" element={<Navigate to="/signup" replace/>}/>
    </Route>
  </Routes>;
}
