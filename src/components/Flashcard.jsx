import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export function Flashcard() {
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [resposta, setResposta] = useState("");
  const [feedback, setFeedback] = useState("neutro");
  const [mostrarResposta, setMostrarResposta] = useState(false);

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
        console.error("erro ao buscar palavras:", erro);
      } finally {
        setLoading(false);
      }
    }
    buscarDeck();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-2xl text-white">Carregando palavras...</p>
      </div>
    );
  }

  if (deck.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-2xl text-red-500">
          Nenhuma palavra encontrada. Você adicionou palavras no Firestore?
        </p>
      </div>
    );
  }

  const palavraAtual = deck[indiceAtual];
  const totalPalavras = deck.length;

  function irParaProxima() {
    if (indiceAtual + 1 < totalPalavras) {
      setIndiceAtual(indiceAtual + 1);
      setResposta("");
      setFeedback("neutro");
      setMostrarResposta(false);
    }
  }

  function irParaAnterior() {
    if (indiceAtual > 0) {
      setIndiceAtual(indiceAtual - 1);
      setResposta("");
      setFeedback("neutro");
      setMostrarResposta(false);
    }
  }

  function verificarResposta() {
    const respostaLimpa = resposta.trim().toLowerCase();
    const respostaCorreta = palavraAtual.palavra_en.trim().toLowerCase();

    if (respostaLimpa === respostaCorreta) {
      setFeedback("correto");
      setMostrarResposta(true);
    } else {
      setFeedback("incorreto");
    }
  }

  let corBordaInput = "border-zinc-700";
  if (feedback === "correto") {
    corBordaInput = "border-emerald-500";
  } else if (feedback === "incorreto") {
    corBordaInput = "border-red-500";
  }

  return (
    <div className="w-full max-w-md ">
      <div className="relative rounded-lg bg-zinc-800 p-6 shadow-lg">
        <button
          onClick={() => setMostrarResposta(!mostrarResposta)}
          className="absolute top-4 right-4 rounded-full bg-zinc-700 p-2 text-zinc-400 hover:text-white"
          title="Mostrar/Ocultar Resposta"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
        {mostrarResposta ? (
          <>
            <h2 className="text-center text-4xl font-bold text-white">
              {palavraAtual.palavra_en}
            </h2>
            <p className="text-center text-xl text-zinc-400">
              {palavraAtual.palavra_pt}
            </p>
            <hr className="my-6 border-zinc-700" />
            <div className="space-y-4">
              <div className="text-lg text-zinc-200">
                <p>{palavraAtual.frase_en}</p>
                <p className="text-sm text-zinc-400">{palavraAtual.frase_pt}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-center text-4xl font-bold text-white">
              {palavraAtual.palavra_pt}
            </h2>
            <p className="text-center text-xl text-zinc-400">
              (Traduza para o Inglês)
            </p>

            <hr className="my-6 border-zinc-700" />

            <div className="space-y-4">
              <div className="text-lg text-zinc-200">
                <p>{palavraAtual.frase_pt}</p>
                <p className="text-sm text-zinc-400">(Frase de exemplo)</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-zinc-800 p-6 shadow-lg">
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
          <p className="mt-3 text-emerald-500">Correto!</p>
        )}
        {feedback === "incorreto" && (
          <p className="mt-3 text-red-500">
            Incorreto. A resposta é: "{palavraAtual.palavra_en}"
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
          Proxima
        </button>
      </div>
    </div>
  );
}
