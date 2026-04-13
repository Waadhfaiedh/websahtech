import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./i18n.js";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

// Apply saved language direction on load
const savedLang = localStorage.getItem("sahtech_lang") || "fr";
document.documentElement.setAttribute(
  "dir",
  savedLang === "ar" ? "rtl" : "ltr",
);
document.documentElement.setAttribute("lang", savedLang);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={3200}
        closeOnClick
        pauseOnHover
        draggable
      />
    </AuthProvider>
  </React.StrictMode>,
);
