import React from "react";
import ReactDOM from "react-dom/client";
import "bulma/css/bulma.min.css";
import "./styles.css";
import App from "./App";
import faviconUrl from "../assets/icons/BoisLogo_icon.ico?url";

const faviconLink = document.createElement("link");
faviconLink.rel = "icon";
faviconLink.type = "image/x-icon";
faviconLink.href = faviconUrl;
document.head.appendChild(faviconLink);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
