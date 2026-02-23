import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Home from "../pages/home/index";
import SignUp from "../pages/signUp";
import PrivateRoute from "../components/privateRoute";
import Profile from "../pages/profile";
import ConversationProfile from "../pages/conversationProfile";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/conversationProfile" element={<ConversationProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
