// src/main.jsx (ATUALIZADO)

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import App from "./App.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { EstudarPalavrasPage } from "./pages/EstudarPalavrasPage.jsx";
import { EstudarFrasesPage } from "./pages/EstudarFrasesPage.jsx";
import { PraticarEscritaPage } from "./pages/PraticarEscritaPage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/estudar-palavras",
        element: (
          <ProtectedRoute>
            {(user) => <EstudarPalavrasPage userId={user.uid} />}
          </ProtectedRoute>
        ),
      },
      {
        path: "/estudar-frases",
        element: (
          <ProtectedRoute>
            {(user) => <EstudarFrasesPage userId={user.uid} />}
          </ProtectedRoute>
        ),
      },
      {
        path: "/praticar-escrita",
        element: (
          <ProtectedRoute>
            {(user) => <PraticarEscritaPage userId={user.uid} />}
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
