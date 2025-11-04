// src/components/EstudoDiarioPalavras.jsx (MODIFICADO)

import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
// ... (imports inalterados)
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  query,
  limit,
  orderBy,
} from "firebase/firestore";

// --- FUNÇÕES AJUDANTES (sem mudanças) ---
function getHojeString() {
  return new Date().toISOString().split("T")[0];
}
function getOntemString() {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  return ontem.toISOString().split("T")[0];
}
function shuffleArray(array) {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
// --- FIM FUNÇÕES AJUDANTES ---

export function EstudoDiarioPalavras({ userId }) {
  const [deck, setDeck] = useState([]);
  const [status, setStatus] = useState("loading");
  const [indiceAtual, setIndiceAtual] = useState(0);

  // ... (outros estados inalterados)
  const [opcoes, setOpcoes] = useState([]);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [acertouSelecao, setAcertouSelecao] = useState(false);
  const [escritaInput, setEscritaInput] = useState("");
  const [escritaFeedback, setEscritaFeedback] = useState("neutro");
  const [acertouEscrita, setAcertouEscrita] = useState(false);
  const [errosNaPalavra, setErrosNaPalavra] = useState(0);
  const [acertosSessao, setAcertosSessao] = useState(0);
  const [sessaoConcluida, setSessaoConcluida] = useState(false);
  const [verRevisao, setVerRevisao] = useState(false);

  // --- NOVO ESTADO GATILHO ---
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // EFEITO 1: Carga do Deck (MODIFICADO para depender do reloadTrigger)
  useEffect(() => {
    async function carregarEstudo() {
      if (!userId) {
        setStatus("deck_empty");
        return;
      }

      setStatus("loading");

      try {
        // 1. VERIFICAR TENTATIVAS
        const hoje = getHojeString();
        const historicoRef = doc(
          db,
          "usuarios",
          userId,
          "historicoDiario",
          hoje
        );
        const historicoSnap = await getDoc(historicoRef);
        const tentativas = historicoSnap.data()?.tentativasPalavras || 0;

        if (tentativas >= 2) {
          setStatus("limited");
          return;
        }

        // 2. Carregar Deck (se não estiver limitado)
        // ... (resto da lógica de carregar o deck inalterada)
        const userDocRef = doc(db, "usuarios", userId);
        const userSnap = await getDoc(userDocRef);
        const studyDay = userSnap.data()?.studyDay || 1;
        const palavrasPorDia = 5;
        const numPalavras = studyDay * palavrasPorDia;
        const palavrasCollection = collection(db, "palavras");
        const q = query(
          palavrasCollection,
          orderBy("palavra_en"),
          limit(numPalavras)
        );
        const snapshot = await getDocs(q);
        const listaDePalavras = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (listaDePalavras.length === 0) {
          setStatus("deck_empty");
        } else {
          setDeck(shuffleArray(listaDePalavras));
          setStatus("ready");
        }
      } catch (erro) {
        console.error("Erro ao carregar estudo:", erro);
        setStatus("deck_empty");
      }
    }

    carregarEstudo();
  }, [userId, reloadTrigger]); // <-- DEPENDÊNCIA ADICIONADA

  // EFEITO 2: Prepara a tela para a palavra atual (sem mudanças)
  useEffect(() => {
    if (status !== "ready" || deck.length === 0 || indiceAtual >= deck.length)
      return;
    // ... (resto da função sem mudanças)
    setRespostaSelecionada(null);
    setAcertouSelecao(false);
    setEscritaInput("");
    setEscritaFeedback("neutro");
    setAcertouEscrita(false);
    setErrosNaPalavra(0);
    const palavraCorreta = deck[indiceAtual];
    const respostaCorreta_pt = palavraCorreta.palavra_pt;
    const deckFiltrado = deck.filter((p) => p.id !== palavraCorreta.id);
    let novasOpcoes = [respostaCorreta_pt];
    while (novasOpcoes.length < 4 && deckFiltrado.length > 0) {
      const iAleatorio = Math.floor(Math.random() * deckFiltrado.length);
      novasOpcoes.push(deckFiltrado.splice(iAleatorio, 1)[0].palavra_pt);
    }
    setOpcoes(shuffleArray(novasOpcoes));
  }, [status, deck, indiceAtual]);

  // FUNÇÃO: Atualiza Streak e "studyDay" (sem mudanças)
  async function atualizarStreakEProgresso(userId) {
    // ... (código idêntico)
    const userDocRef = doc(db, "usuarios", userId);
    const hoje = getHojeString();
    try {
      const userDoc = await getDoc(userDocRef);
      const dados = userDoc.data() || {};
      const lastStudyDay = dados.lastStudyDay;
      if (lastStudyDay === hoje) return;
      const ontem = getOntemString();
      let novaStreak = 1;
      let novoStudyDay = dados.studyDay || 1;
      if (lastStudyDay === ontem) {
        novaStreak = (dados.streak || 0) + 1;
        novoStudyDay = novoStudyDay + 1;
      } else if (!lastStudyDay) {
        novaStreak = 1;
        novoStudyDay = 1;
      } else {
        novaStreak = 1;
        novoStudyDay = (dados.studyDay || 1) + 1;
      }
      await setDoc(
        userDocRef,
        {
          streak: novaStreak,
          lastStudyDay: hoje,
          studyDay: novoStudyDay,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Erro ao atualizar streak:", error);
    }
  }

  // FUNÇÃO: Salva progresso diário (sem mudanças)
  async function salvarProgressoDiario(placarFinal) {
    // ... (código idêntico)
    if (!userId) return;
    const hoje = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "usuarios", userId, "historicoDiario", hoje);
    try {
      const docSnap = await getDoc(docRef);
      let dadosParaSalvar = { data: serverTimestamp() };
      let tentativasAntigas = 0;
      let placarAntigo = 0;
      if (docSnap.exists()) {
        const dadosAtuais = docSnap.data();
        placarAntigo = dadosAtuais.acertosPalavras || 0;
        tentativasAntigas = dadosAtuais.tentativasPalavras || 0;
      }
      dadosParaSalvar.acertosPalavras = Math.max(placarAntigo, placarFinal);
      dadosParaSalvar.tentativasPalavras = tentativasAntigas + 1;
      await setDoc(docRef, dadosParaSalvar, { merge: true });
      await atualizarStreakEProgresso(userId);
    } catch (error) {
      console.error("Erro ao salvar progresso: ", error);
    }
  }

  // FUNÇÃO: Reseta a sessão (MODIFICADA)
  function reiniciarSessao() {
    setDeck([]);
    setIndiceAtual(0);
    setOpcoes([]);
    setRespostaSelecionada(null);
    setAcertouSelecao(false);
    setEscritaInput("");
    setEscritaFeedback("neutro");
    setAcertouEscrita(false);
    setErrosNaPalavra(0);
    setAcertosSessao(0);
    setSessaoConcluida(false);
    setVerRevisao(false);
    setStatus("loading");
    // --- ATIVA O GATILHO ---
    setReloadTrigger((prev) => prev + 1);
  }

  // --- Funções de Interação (sem mudanças) ---
  function handleFalar(texto) {
    // ... (código idêntico)
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }
  function handleVerificarSelecao(opcaoClicada) {
    // ... (código idêntico)
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
    // ... (código idêntico)
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
    if (indiceAtual + 1 === deck.length) {
      setSessaoConcluida(true);
      const placarFinal =
        acertosSessao + (acertou && errosNaPalavra === 0 ? 1 : 0);
      salvarProgressoDiario(placarFinal);
    }
  }
  function irParaProxima() {
    // ... (código idêntico)
    if (indiceAtual + 1 < deck.length) {
      setIndiceAtual(indiceAtual + 1);
    }
  }
  function irParaAnterior() {
    // ... (código idêntico)
    if (indiceAtual > 0) {
      setIndiceAtual(indiceAtual - 1);
    }
  }

  // --- RENDERIZAÇÃO (sem mudanças) ---
  // A lógica de renderização anterior já está correta.
  // O `status` 'limited' será ativado pelo `useEffect`
  // após `reiniciarSessao` disparar o `reloadTrigger`.

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center">
        <p className="text-2xl text-white">Carregando desafio diário...</p>
      </div>
    );
  }

  if (status === "limited") {
    return (
      <div className="w-full max-w-md text-center text-white">
        <div className="rounded-lg bg-zinc-800 p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-red-500">Limite Atingido</h2>
          <p className="mt-4 text-xl text-zinc-300">
            Você já usou suas 2 tentativas de palavras hoje.
          </p>
          <p className="mt-2 text-zinc-400">Volte amanhã!</p>
        </div>
      </div>
    );
  }

  if (status === "deck_empty") {
    return (
      <div className="flex items-center justify-center text-center">
        <div>
          <p className="text-2xl text-red-500">
            Nenhuma palavra encontrada no deck global.
          </p>
          <p className="text-lg text-zinc-400">Execute o script de seed!</p>
        </div>
      </div>
    );
  }

  if (sessaoConcluida) {
    return (
      <div className="w-full max-w-md text-center text-white">
        <div className="rounded-lg bg-zinc-800 p-8 shadow-lg">
          {verRevisao ? (
            // ... (tela de revisão inalterada)
            <div>
              <h2 className="text-2xl font-bold text-emerald-500">
                Revisão da Sessão
              </h2>
              <ul className="mt-4 max-h-60 overflow-y-auto text-left divide-y divide-zinc-700">
                {deck.map((palavra) => (
                  <li key={palavra.id} className="py-2">
                    <span className="font-bold text-white">
                      {palavra.palavra_en}
                    </span>
                    <span className="text-zinc-400">
                      : {palavra.palavra_pt}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setVerRevisao(false)}
                className="mt-6 w-full rounded-lg bg-zinc-700 px-6 py-3 text-lg text-white transition-colors hover:bg-zinc-600"
              >
                Voltar
              </button>
            </div>
          ) : (
            // ... (tela de parabéns inalterada)
            <div>
              <h2 className="text-3xl font-bold text-emerald-500">Parabéns!</h2>
              <p className="mt-4 text-xl text-zinc-300">
                Você concluiu sua sessão do dia!
              </p>
              <div className="mt-6 text-lg">
                Acertos de Primeira:{" "}
                <span className="text-2xl font-bold text-emerald-400">
                  {acertosSessao}
                </span>
                {" / "}
                <span className="text-2xl font-bold">{deck.length}</span>
              </div>
              <p className="mt-2 text-zinc-400">
                Seu progresso e streak foram salvos.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setVerRevisao(true)}
                  className="w-full rounded-lg bg-sky-600 px-6 py-3 text-lg text-white transition-colors hover:bg-sky-500"
                >
                  Ver Revisão
                </button>
                <button
                  onClick={reiniciarSessao}
                  className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-lg text-white transition-colors hover:bg-emerald-500"
                >
                  Estudar Novamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === "ready") {
    // ... (renderização do quiz inalterada)
    const palavraAtual = deck[indiceAtual];
    const totalPalavras = deck.length;
    let corBordaInput = "border-zinc-700 focus:border-emerald-500";
    if (escritaFeedback === "correto") corBordaInput = "border-emerald-500";
    else if (escritaFeedback === "incorreto") corBordaInput = "border-red-500";
    return (
      <div className="w-full max-w-md ">
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
