import { createBrowserRouter, Navigate } from "react-router-dom";
import SignUp from "../pages/user/SignUp";
import SignIn from "../pages/user/SignIn";
import Home from "../pages/user/Home";
import Login from "../pages/admin/Login";
import Users from "../pages/admin/Users";
import Dashboard from "../pages/admin/Dashboard";
import Category from "../pages/admin/Category";
import CategoryUsers from "../pages/user/CategoryUsers";
import History from "../pages/user/History";
export const routers = createBrowserRouter([
  { path: "/", element: <Navigate to="/signin" replace /> },
  { path: "/signup", element: <SignUp></SignUp> },
  { path: "/signin", element: <SignIn></SignIn> },
  { path: "/home", element: <Home></Home> },
  // { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login></Login> },
  { path: "/users", element: <Users></Users> },
  { path: "/dashboard", element: <Dashboard></Dashboard> },
  { path: "/category", element: <Category></Category> },
  { path: "/category-users", element: <CategoryUsers /> },
  { path: "/history", element: <History /> },
]);
