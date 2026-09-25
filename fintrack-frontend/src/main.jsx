import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client";

import App from "./App";
import client from "./services/apollo";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { registrarServiceWorker } from "./services/pwa";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);


registrarServiceWorker();
