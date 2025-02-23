import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import LoginPage from "./Screens/login";
import RegistPage from "./Screens/register";
import HomePage from "./Screens/home.page";
import Profile from "./Screens/profile";
import EditProfile from "./Screens/edit-profile.page";
import RegisterAdmin from "./Screens/Admin/adminRegister";
import Writepost from "./Screens/post";
// import Content from "./Screens/Content";
import AdminHome from "./Screens/Admin/adminHome";
import Category from "./Screens/category";
import Footer from "./Navbar/footer";
import ForgotPassword from "./Screens/ForgotPassword";
import ResetPassword from "./Screens/ResetPassword";
import Post from "./Screens/post";
import Chat from "./Screens/chat";
import { ChatContextProvider } from "./Screens/ChatContext";
import Navbar2 from "./Navbar/Navbar1";
import Navbar from "./Navbar/Navbar";
import EditPost from "./Screens/edit-post";
// import SearchResults from "./Navbar/SearchResults ";
import HelpCentre from "./Screens/helpcentre";
import Popular from "./Screens/Popular";
import { createContext } from "react";
import { lookInSession } from "./common/session";
import UserAuthForm from "./Screens/UserAuthForm";
import Editor from "./Screens/editor-page";
import SearchPage from "./Screens/search.page";
import PageNotFound from "./Screens/404";
import ProfilePage from "./Screens/ProfilePage";
import BlogPage from "./Screens/blog.page";
import DashboardUser from "./Screens/DashboardUser";
import LoginAdmin from "./Screens/Admin/adminLogin";
import AccountPreferences from "./Screens/AccountPreferences";
// import ForgotPassword from './Screens/Admin/ForgotPassword';
// import VerifyOTP from "./Screens/Admin/VerifyOTP";
// import ResetPassword from './Screens/Admin/ResetPassword';
import SideNav from "./components/sideNavbar";
import ChangPassword from "./Screens/change-password";
import Notifications from "./Screens/notifications.page";
import ManageBlogs from "./Screens/manageblogs";
import ReportCheck from "./Screens/reportCheck";
import NotiSetting from "./Screens/noti-setting";

interface UserContextType {
  userAuth: {
    access_token: string | null;
    _id?: string;
    username?: string;
    fullname?: string;
    profile_picture?: string;
    new_notification_available?: boolean;
  };
  setUserAuth: React.Dispatch<React.SetStateAction<any>>;
  NotificationShow: boolean;
  setNotificationShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = createContext<UserContextType>({
  userAuth: { access_token: null },
  setUserAuth: () => {},
  NotificationShow: true,
  setNotificationShow: () => {},
});

function NavbarLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  const [userAuth, setUserAuth] = useState<{ access_token: string | null }>({
    access_token: null
  });
  const [NotificationShow, setNotificationShow] = useState(false);

  useEffect(() => {
    const userInSession = lookInSession("user");
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);
  
  return (
    <UserContext.Provider value={{ userAuth, setUserAuth,NotificationShow,setNotificationShow  }}>
      <ChatContextProvider>
        <Routes>
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:blog_id" element={<Editor />} />
          <Route element={<NavbarLayout />}>
            <Route path="/signin" element={<UserAuthForm type="เข้าสู่ระบบ" />} />
            <Route path="/signup" element={<UserAuthForm type="สมัครสมาชิก" />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/user/:id" element={<ProfilePage />} />
            <Route path="/search/:query" element={<SearchPage />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/blog/:blog_id" element={<BlogPage />}></Route>
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile/edit-profile/:id" element={<EditProfile />} />
            <Route path="settings" element={<SideNav />}>
              <Route path="edit-profile" element={<EditProfile />}></Route>
              <Route path="change-password" element={<ChangPassword />}></Route>
              <Route path="noti-setting" element={<NotiSetting />} />
              
            </Route>
            <Route path="/posts" element={<Post />} />
            <Route path="/writepost" element={<Writepost />} />
            <Route path="/editpost/:id" element={<EditPost />} />
            <Route path="/footer" element={<Footer />} />
            
            <Route path="dashboard" element={<SideNav />}>
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="reportCheck" element={<ReportCheck />} />
            </Route>

            <Route path="/dashboard/blogs/statistics" element={<DashboardUser />} />
            <Route path="/helpcentre" element={<HelpCentre />} />
            {/* <Route path="/content/:id" element={<Content />} /> */}
            <Route path="/category" element={<Category />} />
            <Route path="/popular" element={<Popular />} />
            {/* <Route path="/search" element={<SearchResults />} /> */}
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/register" element={<RegisterAdmin />} />
          <Route path="/admin/login" element={<LoginAdmin type="admin" />} />
          <Route path="/admin/:adminId" element={<AdminHome />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/account/preference/:id" element={<AccountPreferences />} />
          {/* <Route path="/forgot-password" element={<ForgotPassword />} />
             <Route path="/verify-otp" element={<VerifyOTP />} /> */}
          {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
          <Route path="/chats" element={<Chat />} />
          <Route path="/nav" element={<Navbar2 />} />
        </Routes>
      </ChatContextProvider>
    </UserContext.Provider>
  );
}

export default App;
