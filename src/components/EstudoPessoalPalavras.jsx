// src/components/EstudoPessoalPalavras.jsx

import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// --- FUNÇÕES AJUDANTES ---
function shuffleArray(array) {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
const srsNiveis = [0, 1, 3, 7, 14, 30, 60];
function getProximaRevisao(nivel) {
  const diasParaAdicionar = srsNiveis[nivel] || 0;
  const data = new Date();
  data.setDate(data.getDate() + diasParaAdicionar);
  return Timestamp.fromDate(data);
}
// --- FIM FUNÇÕES AJUDANTES ---

export function EstudoPessoalPalavras({ userId }) {
  const [deck, setDeck] = useState([]);
  const [studyStatus, setStudyStatus] = useState("loading");
  const [indiceAtual, setIndiceAtual] = useState(0);

  const [opcoes, setOpcoes] = useState([]);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [acertouSelecao, setAcertouSelecao] = useState(false);

  const [escritaInput, setEscritaInput] = useState("");
  const [escritaFeedback, setEscritaFeedback] = useState("neutro");
  const [acertouEscrita, setAcertouEscrita] = useState(false);

  const [errosNaPalavra, setErrosNaPalavra] = useState(0);
  const [acertosSessao, setAcertosSessao] = useState(0);
  const [sessaoConcluida, setSessaoConcluida] = useState(false);

  // EFEITO 1: Carregar Deck de Estudo (SRS Pessoal)
  useEffect(() => {
    async function carregarDeckDeEstudo() {
      if (!userId) return;
      setStudyStatus("loading");

      try {
        // 1. Carregar Deck Pessoal de Palavras
        const pessoalRef = collection(db, "usuarios", userId, "palavras");
        const pessoalSnap = await getDocs(pessoalRef);
        const deckPessoal = pessoalSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 2. Carregar progresso de PALAVRAS
        const progressoRef = collection(
          db,
          "usuarios",
          userId,
          "progressoPalavras" // <-- NOVA COLEÇÃO DE PROGRESSO
        );
        const progressoSnap = await getDocs(progressoRef);
        const progressoMap = new Map();
        progressoSnap.forEach((doc) => {
          progressoMap.set(doc.id, doc.data());
        });

        // 3. FILTRAR
        const hoje = new Date();
        let palavrasNovas = [];
        let palavrasParaRevisar = [];

        for (const palavra of deckPessoal) {
          const progresso = progressoMap.get(palavra.id);
          if (!progresso) {
            palavrasNovas.push(palavra);
          } else if (progresso.proximaRevisao.toDate() <= hoje) {
            palavrasParaRevisar.push({ ...palavra, progresso });
          }
        }

        // 4. Criar Deck de Hoje (Todas para revisar + 5 novas)
        const NOVAS_POR_DIA = 5;
        let deckFinal = [
          ...shuffleArray(palavrasParaRevisar),
          ...shuffleArray(palavrasNovas).slice(0, NOVAS_POR_DIA),
        ];

        if (deckFinal.length > 0) {
          setDeck(deckFinal);
          setStudyStatus("ready");
        } else {
          setStudyStatus("deck_empty");
        }
      } catch (erro) {
        console.error("Erro ao carregar deck pessoal de palavras:", erro);
        setStudyStatus("deck_empty");
      }
    }
    carregarDeckDeEstudo();
  }, [userId]);

  // EFEITO 2: Prepara a tela para a palavra atual
  useEffect(() => {
    if (
      studyStatus !== "ready" ||
      deck.length === 0 ||
      indiceAtual >= deck.length
    )
      return;

    setRespostaSelecionada(null);
    setAcertouSelecao(false);
    setEscritaInput("");
    setEscritaFeedback("neutro");
    setAcertouEscrita(false);
    setErrosNaPalavra(0);

    const palavraCorreta = deck[indiceAtual];
    const respostaCorreta_pt = palavraCorreta.palavra_pt;

    // Pega outras opções do próprio deck pessoal
    const deckFiltrado = deck.filter((p) => p.id !== palavraCorreta.id);
    let novasOpcoes = [respostaCorreta_pt];
    while (novasOpcoes.length < 4 && deckFiltrado.length > 0) {
      const iAleatorio = Math.floor(Math.random() * deckFiltrado.length);
      novasOpcoes.push(deckFiltrado.splice(iAleatorio, 1)[0].palavra_pt);
    }
    setOpcoes(shuffleArray(novasOpcoes));
  }, [studyStatus, deck, indiceAtual]);

  // FUNÇÃO: Salvar Progresso SRS
  async function salvarProgressoSRS(acertou) {
    if (!userId) return;

    const palavra = deck[indiceAtual];
    const progressoAtual = palavra.progresso || { nivel: 0 };

    let novoNivel = progressoAtual.nivel;
    if (acertou) {
      novoNivel = Math.min(novoNivel + 1, srsNiveis.length - 1);
    } else {
      novoNivel = Math.max(novoNivel - 1, 1);
    }

    const proximaRevisao = getProximaRevisao(novoNivel);
    const docRef = doc(db, "usuarios", userId, "progressoPalavras", palavra.id);

    try {
      await setDoc(
        docRef,
        {
          nivel: novoNivel,
          proximaRevisao: proximaRevisao,
          ultimoEstudo: serverTimestamp(),
          palavra_en: palavra.palavra_en,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Erro ao salvar progresso SRS:", error);
    }
  }

  // --- Funções de Interação ---
  function handleFalar(texto) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  function handleVerificarSelecao(opcaoClicada) {
    if (acertouSelecao) return;
    setRespostaSelecionada(opcaoClicada);
    const respostaCorreta = deck[indiceAtual].palavra_pt;
    if (opcaoClicada === respostaCorreta) {
      setAcertouSelecao(true);
    } else {
      setErrosNaPalavra(errosNaPalavra + 1);
    }
  }

  function handleVerificarEscrita() {
    const respostaLimpa = escritaInput.trim().toLowerCase();
    const respostaCorreta = deck[indiceAtual].palavra_en.trim().toLowerCase();
    const acertou = respostaLimpa === respostaCorreta;

    if (acertou) {
      setEscritaFeedback("correto");
      setAcertouEscrita(true);
      if (errosNaPalavra === 0) {
        setAcertosSessao(acertosSessao + 1);
      }
    } else {
      setEscritaFeedback("incorreto");
      setErrosNaPalavra(errosNaPalavra + 1);
    }

    // Salva o progresso SRS
    salvarProgressoSRS(acertou);

    if (indiceAtual + 1 === deck.length) {
      setSessaoConcluida(true);
    }
  }

  function irParaProxima() {
    if (indiceAtual + 1 < deck.length) {
      setIndiceAtual(indiceAtual + 1);
    }
  }

  function irParaAnterior() {
    if (indiceAtual > 0) {
      setIndiceAtual(indiceAtual - 1);
    }
  }

  // --- RENDERIZAÇÃO ---

  if (studyStatus === "loading") {
    return <p className="text-2xl text-white">Carregando deck pessoal...</p>;
  }

  if (studyStatus === "deck_empty") {
    return (
      <div className="w-full max-w-md text-center text-white">
        <div className="rounded-lg bg-zinc-800 p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-sky-500">Deck Vazio</h2>
          <p className="mt-4 text-xl text-zinc-300">
            Você não tem palavras novas ou revisões para hoje.
          </p>
          <p className="mt-2 text-zinc-400">
            Use "Adicionar Palavra" para começar!
          </p>
        </div>
      </div>
    );
  }

  if (sessaoConcluida) {
    return (
      <div className="w-full max-w-md text-center text-white">
        <div className="rounded-lg bg-zinc-800 p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-emerald-500">Parabéns!</h2>
          <p className="mt-4 text-xl text-zinc-300">
            Sessão de revisão concluída.
          </p>
          <div className="mt-6 text-lg">
            Acertos de Primeira:{" "}
            <span className="text-2xl font-bold text-emerald-400">
              {acertosSessao}
            </span>
            {" / "}
            <span className="text-2xl font-bold">{deck.length}</span>
          </div>
        </div>
      </div>
    );
  }

  if (studyStatus === "ready") {
    // ... (O JSX de estudo é idêntico ao EstudoDiarioPalavras)
    const palavraAtual = deck[indiceAtual];
    const totalPalavras = deck.length;
    let corBordaInput = "border-zinc-700 focus:border-emerald-500";
    if (escritaFeedback === "correto") corBordaInput = "border-emerald-500";
    else if (escritaFeedback === "incorreto") corBordaInput = "border-red-500";

    return (
      <div className="w-full max-w-md ">
        {/* Card Principal */}
        <div className="relative rounded-lg bg-zinc-800 p-6 shadow-lg">
          <button
            onClick={() => handleFalar(palavraAtual.palavra_en)}
            className="absolute top-4 right-4 text-zinc-400 hover:text-emerald-500 transition-colors"
            title="Ouvir pronúncia"
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
          <h2 className="text-center text-4xl font-bold text-white">
            {palavraAtual.palavra_en}
          </h2>
          <p className="mt-2 text-center text-lg text-zinc-400">
            Qual a tradução correta?
          </p>
        </div>
        {/* Etapa 1: Múltipla Escolha */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          {opcoes.map((opcao, index) => {
            let corBotao =
              "bg-zinc-700 hover:bg-zinc-600 focus:border-emerald-500";
            if (respostaSelecionada) {
              if (opcao === respostaSelecionada) {
                corBotao =
                  opcao === palavraAtual.palavra_pt
                    ? "bg-emerald-800 border-emerald-500"
                    : "bg-red-800 border-red-500";
              } else if (opcao === palavraAtual.palavra_pt) {
                corBotao = "bg-emerald-800 border-emerald-500";
              }
            }
            return (
              <button
                key={index}
                onClick={() => handleVerificarSelecao(opcao)}
                disabled={acertouSelecao}
                className={`w-full rounded-lg border-2 border-transparent p-4 text-left text-lg text-white transition-all ${corBotao} disabled:opacity-70`}
              >
                {opcao}
              </button>
            );
          })}
        </div>
        {/* Etapa 2: Escrita */}
        {acertouSelecao && (
          <div className="mt-6 animate-fadeIn rounded-lg bg-zinc-800 p-6 shadow-lg">
            <p className="mb-3 text-lg text-zinc-300">
              Excelente! Agora, escreva em inglês:
            </p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={escritaInput}
                onChange={(e) => setEscritaInput(e.target.value)}
                disabled={acertouEscrita}
                className={`flex-1 rounded-lg border-2 bg-zinc-700 p-3 text-lg text-white outline-none transition-colors ${corBordaInput} disabled:opacity-70`}
                placeholder="Digite em inglês..."
              />
              {!acertouEscrita && (
                <button
                  onClick={handleVerificarEscrita}
                  className="rounded-lg bg-emerald-600 px-6 py-2 text-lg text-white transition-colors hover:bg-emerald-500"
                >
                  Verificar
                </button>
              )}
            </div>
          </div>
        )}
        {/* Navegação */}
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
            disabled={!acertouEscrita || indiceAtual + 1 === totalPalavras}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-lg text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
      
    );
  }
  return null;
}
