import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { useOutletContext } from "react-router-dom";
import { shuffleArray } from "../utils/helpers";
import { getProximaRevisao, calcularNovoNivel } from "../utils/srs";

export function EstudoPessoalFrases() {
  const { user } = useOutletContext();
  const userId = user?.uid;

  const [deckEstudo, setDeckEstudo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indiceAtual, setIndiceAtual] = useState(0);

  const [escritaInput, setEscritaInput] = useState("");
  const [feedback, setFeedback] = useState("neutro");
  const [acertou, setAcertou] = useState(false);

  const [sessaoConcluida, setSessaoConcluida] = useState(false);
  const [acertosSessao, setAcertosSessao] = useState(0);
  const [errosNaFrase, setErrosNaFrase] = useState(0);

  useEffect(() => {
    async function carregarDeckDeEstudo() {
      if (!userId) return;
      setLoading(true);

      try {
        const pessoalRef = collection(db, "usuarios", userId, "frases");
        const pessoalSnap = await getDocs(pessoalRef);
        const deckPessoal = pessoalSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const progressoRef = collection(
          db,
          "usuarios",
          userId,
          "progressoFrases"
        );
        const progressoSnap = await getDocs(progressoRef);
        const progressoMap = new Map();
        progressoSnap.forEach((doc) => {
          progressoMap.set(doc.id, doc.data());
        });

        const hoje = new Date();
        let frasesNovas = [];
        let frasesParaRevisar = [];

        for (const frase of deckPessoal) {
          const progresso = progressoMap.get(frase.id);
          if (!progresso) {
            frasesNovas.push(frase);
          } else if (progresso.proximaRevisao.toDate() <= hoje) {
            frasesParaRevisar.push({ ...frase, progresso });
          }
        }

        const NOVAS_POR_DIA = 5;
        let deckFinal = [
          ...shuffleArray(frasesParaRevisar),
          ...shuffleArray(frasesNovas).slice(0, NOVAS_POR_DIA),
        ];

        if (deckFinal.length > 0) {
          setDeckEstudo(deckFinal);
        }
      } catch (erro) {
        console.error("Erro ao carregar deck de estudo:", erro);
      } finally {
        setLoading(false);
      }
    }
    carregarDeckDeEstudo();
  }, [userId]);

  useEffect(() => {
    if (deckEstudo.length === 0 || indiceAtual >= deckEstudo.length) return;
    setEscritaInput("");
    setFeedback("neutro");
    setAcertou(false);
    setErrosNaFrase(0);
  }, [deckEstudo, indiceAtual]);

  async function salvarProgressoSRS(acertou) {
    if (!userId) return;

    const frase = deckEstudo[indiceAtual];
    const progressoAtual = frase.progresso || { nivel: 0 };

    const novoNivel = calcularNovoNivel(progressoAtual.nivel, acertou);
    const proximaRevisao = getProximaRevisao(novoNivel);
    const docRef = doc(db, "usuarios", userId, "progressoFrases", frase.id);
    try {
      await setDoc(
        docRef,
        {
          nivel: novoNivel,
          proximaRevisao: proximaRevisao,
          ultimoEstudo: serverTimestamp(),
          frase_en: frase.frase_en,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Erro ao salvar progresso SRS:", error);
    }
  }

  function handleFalar(texto) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  function handleVerificarEscrita() {
    const respostaLimpa = escritaInput.trim().toLowerCase();
    const respostaCorreta = deckEstudo[indiceAtual].palavra_chave
      .trim()
      .toLowerCase();
    const acertou = respostaLimpa === respostaCorreta;

    if (acertou) {
      setFeedback("correto");
      setAcertou(true);
      if (errosNaFrase === 0) {
        setAcertosSessao(acertosSessao + 1);
      }
    } else {
      setFeedback("incorreto");
      setErrosNaFrase(errosNaFrase + 1);
    }

    salvarProgressoSRS(acertou);

    if (indiceAtual + 1 === deckEstudo.length) {
      setSessaoConcluida(true);
    }
  }

  function irParaProxima() {
    if (indiceAtual + 1 < deckEstudo.length) {
      setIndiceAtual(indiceAtual + 1);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-2xl text-white">Carregando seu deck pessoal...</p>
      </div>
    );
  }

  if (deckEstudo.length === 0) {
    return (
      <div className="w-full max-w-md text-center text-white">
        <div className="rounded-lg bg-zinc-800 p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-sky-500">
            Deck Pessoal Vazio
          </h2>
          <p className="mt-4 text-xl text-zinc-300">
            Você não tem frases novas ou revisões para hoje no seu deck pessoal.
          </p>
          <p className="mt-2 text-zinc-400">
            Use "Adicionar Palavra" para adicionar frases!
          </p>
        </div>
      </div>
    );
  }

  if (sessaoConcluida) {
    return (
      <div className="w-full max-w-md text-center text-white">
        <div className="rounded-lg bg-zinc-800 p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-emerald-500">
            Sessão Concluída!
          </h2>
          <p className="mt-4 text-xl text-zinc-300">
            Você revisou {deckEstudo.length} frases do seu deck.
          </p>
          <div className="mt-6 text-lg">
            Acertos de Primeira:{" "}
            <span className="text-2xl font-bold text-emerald-400">
              {acertosSessao}
            </span>
            {" / "}
            <span className="text-2xl font-bold">{deckEstudo.length}</span>
          </div>
          <p className="mt-2 text-zinc-400">Seu progresso foi salvo.</p>
        </div>
      </div>
    );
  }

  const fraseAtual = deckEstudo[indiceAtual];
  const totalFrases = deckEstudo.length;

  const palavraChave = fraseAtual.palavra_chave || "ERROR";

  const regexPalavra = new RegExp(palavraChave, "i");
  const fraseComLacuna = fraseAtual.frase_en.replace(regexPalavra, "_______");
  let corBordaInput = "border-zinc-700 focus:border-emerald-500";
  if (feedback === "correto") corBordaInput = "border-emerald-500";
  else if (feedback === "incorreto") corBordaInput = "border-red-500";

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-lg bg-zinc-800 p-6 shadow-lg">
        <p className="mb-4 text-center text-lg text-zinc-400">
          Tradução: "{fraseAtual.frase_pt}"
        </p>
        <div className="flex items-center justify-center space-x-2">
          <h2 className="text-center text-3xl font-bold text-white">
            {fraseComLacuna}
          </h2>
          <button
            onClick={() => handleFalar(fraseAtual.frase_en)}
            className="text-zinc-400 hover:text-emerald-500 transition-colors"
            title="Ouvir frase completa"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
        </div>
        <p className="mt-4 text-center text-lg text-zinc-300">
          Complete com a palavra que falta:
        </p>
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            value={escritaInput}
            onChange={(e) => setEscritaInput(e.target.value)}
            disabled={acertou}
            className={`flex-1 rounded-lg border-2 bg-zinc-700 p-3 text-lg text-white outline-none transition-colors ${corBordaInput} disabled:opacity-70`}
            placeholder="Digite a palavra..."
          />
          {!acertou && (
            <button
              onClick={handleVerificarEscrita}
              className="rounded-lg bg-emerald-600 px-6 py-2 text-lg text-white transition-colors hover:bg-emerald-500"
            >
              Verificar
            </button>
          )}
        </div>
        {feedback === "correto" && (
          <p className="mt-3 text-emerald-500">
            Correto! A palavra é: "{fraseAtual.palavra_chave}"
          </p>
        )}
        {feedback === "incorreto" && (
          <p className="mt-3 text-red-500">
            Incorreto. A resposta correta é: "{fraseAtual.palavra_chave}"
          </p>
        )}
      </div>

      {/* Navegação */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-lg text-zinc-400">
          {indiceAtual + 1} / {totalFrases}
        </div>
        {acertou && (
          <button
            onClick={irParaProxima}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-lg text-white transition-colors hover:bg-emerald-500"
          >
            Próxima
          </button>
        )}
      </div>
    </div>
  );
}
