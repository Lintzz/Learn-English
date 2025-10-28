// src/components/PraticaEscrita.jsx

import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export function PraticaEscrita({ userId }) {
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [resposta, setResposta] = useState("");
  const [feedback, setFeedback] = useState("neutro");

  useEffect(() => {
    async function buscarDeck() {
      try {
        const palavrasCollection = collection(db, "palavras");
        const snapshot = await getDocs(palavrasCollection);
        const listaDePalavras = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeck(listaDePalavras);
      } catch (erro) {
        console.error("Erro ao buscar palavras:", erro);
      } finally {
        setLoading(false);
      }
    }
    buscarDeck();
  }, []);

  function verificarResposta() {
    const respostaLimpa = resposta.trim().toLowerCase();
    const respostaCorreta = palavraAtual.palavra_en.trim().toLowerCase();
    const acertou = respostaLimpa === respostaCorreta;

    if (acertou) {
      setFeedback("correto");
    } else {
      setFeedback("incorreto");
    }
  }

  function irParaProxima() {
    if (indiceAtual + 1 < deck.length) {
      setIndiceAtual(indiceAtual + 1);
      setResposta("");
      setFeedback("neutro");
    }
  }
  function irParaAnterior() {
    if (indiceAtual > 0) {
      setIndiceAtual(indiceAtual - 1);
      setResposta("");
      setFeedback("neutro");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-2xl text-white">Carregando palavras...</p>
      </div>
    );
  }
  if (deck.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-2xl text-red-500">Nenhuma palavra encontrada.</p>
      </div>
    );
  }

  const palavraAtual = deck[indiceAtual];
  const totalPalavras = deck.length;
  let corBordaInput = "border-zinc-700";
  if (feedback === "correto") {
    corBordaInput = "border-emerald-500";
  } else if (feedback === "incorreto") {
    corBordaInput = "border-red-500";
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg bg-zinc-800 p-6 shadow-lg">
        <p className="mb-3 text-lg text-zinc-300">
          Qual a tradução de:{" "}
          <span className="font-bold text-white">
            "{palavraAtual.palavra_pt}"
          </span>
          ?
        </p>

        <div className="flex space-x-2">
          <input
            type="text"
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            className={`flex-1 rounded-lg border-2 bg-zinc-700 p-3 text-lg text-white outline-none transition-colors ${corBordaInput} focus:border-emerald-500`}
            placeholder="Digite em inglês..."
          />
          <button
            onClick={verificarResposta}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-lg text-white transition-colors hover:bg-emerald-500"
          >
            Verificar
          </button>
        </div>
        {feedback === "correto" && (
          <p className="mt-3 text-emerald-500">
            Correto! A resposta é: "{palavraAtual.palavra_en}"
          </p>
        )}
        {feedback === "incorreto" && (
          <p className="mt-3 text-red-500">
            Incorreto. A resposta correta é: "{palavraAtual.palavra_en}"
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={irParaAnterior}
          disabled={indiceAtual === 0}
          className="rounded-lg bg-zinc-700 px-6 py-2 text-lg text-white transition-colors hover:bg-zinc-600 disabled:opacity-50"
        >
          Anterior
        </button>
        <div className="flex items-center text-lg text-zinc-400">
          {indiceAtual + 1} / {totalPalavras}
        </div>
        <button
          onClick={irParaProxima}
          disabled={indiceAtual + 1 === totalPalavras}
          className="rounded-lg bg-emerald-600 px-6 py-2 text-lg text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
