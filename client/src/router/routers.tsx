import { createBrowserRouter } from "react-router-dom";
import SignUp from "../pages/SignUp";
import SignIn from "../pages/SignIn";
import Home from "../pages/Home";
import Login from "../pages/admin/Login";
import Users from "../pages/admin/Users";
import Dashboard from "../pages/admin/Dashboard";
import Category from "../pages/admin/Category";
import CategoryUsers from "../pages/CategoryUsers";
import History from "../pages/History";

export const routers = createBrowserRouter([
  { path: "/signup", element: <SignUp></SignUp> },
  {path:"/signin", element:<SignIn></SignIn>},
  {path:"/home", element:<Home></Home>},
  {path:"/login", element:<Login></Login>},g
  {path:"/users", element:<Users></Users>},
  {path:"/dashboard", element:<Dashboard></Dashboard>},
  {path:"/category", element:<Category></Category>},
  {path:"/category-users", element:<CategoryUsers></CategoryUsers>},
  {path:"/history", element:<History></History>},
]);
