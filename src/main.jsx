import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import App from "./App.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { ProgressoPage } from "./pages/ProgressoPage.jsx";

import { DiariasPage } from "./pages/DiariasPage.jsx";
import { MeuDeckPage } from "./pages/MeuDeckPage.jsx";
import { DecksTematicosPage } from "./pages/DecksTematicosPage.jsx";

import { EstudoDiarioPalavrasPage } from "./pages/EstudoDiarioPalavrasPage.jsx";
import { EstudoDiarioFrasesPage } from "./pages/EstudoDiarioFrasesPage.jsx";
import { EstudoPessoalPalavrasPage } from "./pages/EstudoPessoalPalavrasPage.jsx";
import { EstudoPessoalFrasesPage } from "./pages/EstudoPessoalFrasesPage.jsx";
import { EstudoTematicoPage } from "./pages/EstudoTematicoPage.jsx";

import { GerenciarDeckPage } from "./pages/GerenciarDeckPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },

      {
        path: "/diarias",
        element: <ProtectedRoute>{() => <DiariasPage />}</ProtectedRoute>,
      },
      {
        path: "/diarias/palavras",
        element: (
          <ProtectedRoute>{() => <EstudoDiarioPalavrasPage />}</ProtectedRoute>
        ),
      },
      {
        path: "/diarias/frases",
        element: (
          <ProtectedRoute>{() => <EstudoDiarioFrasesPage />}</ProtectedRoute>
        ),
      },

      {
        path: "/meu-deck",
        element: <ProtectedRoute>{() => <MeuDeckPage />}</ProtectedRoute>,
      },
      {
        path: "/meu-deck/palavras",
        element: (
          <ProtectedRoute>{() => <EstudoPessoalPalavrasPage />}</ProtectedRoute>
        ),
      },
      {
        path: "/meu-deck/frases",
        element: (
          <ProtectedRoute>{() => <EstudoPessoalFrasesPage />}</ProtectedRoute>
        ),
      },

      {
        path: "/decks-tematicos",
        element: (
          <ProtectedRoute>{() => <DecksTematicosPage />}</ProtectedRoute>
        ),
      },
      {
        path: "/decks-tematicos/:themeId",
        element: (
          <ProtectedRoute>{() => <EstudoTematicoPage />}</ProtectedRoute>
        ),
      },

      {
        path: "/progresso",
        element: <ProtectedRoute>{() => <ProgressoPage />}</ProtectedRoute>,
      },

      {
        path: "/meu-deck/gerenciar",
        element: <ProtectedRoute>{() => <GerenciarDeckPage />}</ProtectedRoute>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
