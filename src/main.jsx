// src/main.jsx (MODIFICADO)

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import App from "./App.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { ProgressoPage } from "./pages/ProgressoPage.jsx";
import { AdicionarPalavraPage } from "./pages/AdicionarPalavraPage.jsx";

import { DiariasPage } from "./pages/DiariasPage.jsx";
import { MeuDeckPage } from "./pages/MeuDeckPage.jsx";
import { DecksTematicosPage } from "./pages/DecksTematicosPage.jsx";

import { EstudoDiarioPalavrasPage } from "./pages/EstudoDiarioPalavrasPage.jsx";
import { EstudoDiarioFrasesPage } from "./pages/EstudoDiarioFrasesPage.jsx";
import { EstudoPessoalPalavrasPage } from "./pages/EstudoPessoalPalavrasPage.jsx";
import { EstudoPessoalFrasesPage } from "./pages/EstudoPessoalFrasesPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },

      // --- Hub de Desafios Diários ---
      {
        path: "/diarias",
        element: <ProtectedRoute>{() => <DiariasPage />}</ProtectedRoute>,
      },
      {
        path: "/diarias/palavras",
        element: (
          <ProtectedRoute>
            {(user) => <EstudoDiarioPalavrasPage userId={user.uid} />}
          </ProtectedRoute>
        ),
      },
      {
        path: "/diarias/frases",
        element: (
          <ProtectedRoute>
            {(user) => <EstudoDiarioFrasesPage userId={user.uid} />}
          </ProtectedRoute>
        ),
      },

      // --- Hub do Deck Pessoal ---
      {
        path: "/meu-deck",
        element: <ProtectedRoute>{() => <MeuDeckPage />}</ProtectedRoute>,
      },
      {
        path: "/meu-deck/palavras",
        element: (
          <ProtectedRoute>
            {(user) => <EstudoPessoalPalavrasPage userId={user.uid} />}
          </ProtectedRoute>
        ),
      },
      {
        path: "/meu-deck/frases",
        element: (
          <ProtectedRoute>
            {(user) => <EstudoPessoalFrasesPage userId={user.uid} />}
          </ProtectedRoute>
        ),
      },
      // --- ROTA MOVIDA PARA CÁ ---
      {
        path: "/meu-deck/adicionar",
        element: (
          <ProtectedRoute>{() => <AdicionarPalavraPage />}</ProtectedRoute>
        ),
      },

      // --- Outras Rotas ---
      {
        path: "/decks-tematicos",
        element: (
          <ProtectedRoute>{() => <DecksTematicosPage />}</ProtectedRoute>
        ),
      },
      {
        path: "/progresso",
        element: (
          <ProtectedRoute>
            {(user) => <ProgressoPage userId={user.uid} />}
          </ProtectedRoute>
        ),
      },
      // --- ROTA DE /adicionar REMOVIDA DA RAIZ ---
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
