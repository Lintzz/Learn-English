import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
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

import { useOutletContext } from "react-router-dom";
import { getHojeString, getOntemString, shuffleArray } from "../utils/helpers";

export function EstudoDiarioFrases() {
  const { user } = useOutletContext();
  const userId = user?.uid;

  const [deckEstudo, setDeckEstudo] = useState([]);
  const [status, setStatus] = useState("loading");
  const [indiceAtual, setIndiceAtual] = useState(0);

  const [escritaInput, setEscritaInput] = useState("");
  const [feedback, setFeedback] = useState("neutro");
  const [acertou, setAcertou] = useState(false);
  const [sessaoConcluida, setSessaoConcluida] = useState(false);
  const [acertosSessao, setAcertosSessao] = useState(0);
  const [errosNaFrase, setErrosNaFrase] = useState(0);

  const [verRevisao, setVerRevisao] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    async function carregarDeckDeEstudo() {
      if (!userId) return;
      setStatus("loading");

      try {
        const hoje = getHojeString();
        const historicoRef = doc(
          db,
          "usuarios",
          userId,
          "historicoDiario",
          hoje
        );
        const historicoSnap = await getDoc(historicoRef);
        const tentativas = historicoSnap.data()?.tentativasFrases || 0;

        if (tentativas >= 2) {
          setStatus("limited");
          return;
        }

        const userDocRef = doc(db, "usuarios", userId);
        const userSnap = await getDoc(userDocRef);
        const studyDay = userSnap.data()?.studyDay || 1;
        const frasesPorDia = 5;
        const numFrases = studyDay * frasesPorDia;
        const globalRef = collection(db, "frases");
        const q = query(globalRef, orderBy("frase_en"), limit(numFrases));
        const globalSnap = await getDocs(q);
        const deckGlobal = globalSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (deckGlobal.length > 0) {
          setDeckEstudo(shuffleArray(deckGlobal));
          setStatus("ready");
        } else {
          setStatus("empty");
        }
      } catch (erro) {
        console.error("Erro ao carregar deck de estudo:", erro);
        setStatus("empty");
      }
    }
    carregarDeckDeEstudo();
  }, [userId, reloadTrigger]);

  useEffect(() => {
    if (deckEstudo.length === 0 || indiceAtual >= deckEstudo.length) return;
    setEscritaInput("");
    setFeedback("neutro");
    setAcertou(false);
    setErrosNaFrase(0);
  }, [deckEstudo, indiceAtual]);

  async function atualizarStreakEProgresso(userId) {
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

  async function salvarProgressoDiario(placarFinal) {
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
        placarAntigo = dadosAtuais.acertosFrases || 0;
        tentativasAntigas = dadosAtuais.tentativasFrases || 0;
      }
      dadosParaSalvar.acertosFrases = Math.max(placarAntigo, placarFinal);
      dadosParaSalvar.tentativasFrases = tentativasAntigas + 1;
      await setDoc(docRef, dadosParaSalvar, { merge: true });
      await atualizarStreakEProgresso(userId);
    } catch (error) {
      console.error("Erro ao salvar progresso: ", error);
    }
  }

  function reiniciarSessao() {
    setDeckEstudo([]);
    setIndiceAtual(0);
    setEscritaInput("");
    setFeedback("neutro");
    setAcertou(false);
    setErrosNaFrase(0);
    setAcertosSessao(0);
    setSessaoConcluida(false);
    setVerRevisao(false);
    setStatus("loading");
    setReloadTrigger((prev) => prev + 1);
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
    if (indiceAtual + 1 === deckEstudo.length) {
      setSessaoConcluida(true);
      const placarFinal =
        acertosSessao + (acertou && errosNaFrase === 0 ? 1 : 0);
      salvarProgressoDiario(placarFinal);
    }
  }

  function irParaProxima() {
    if (indiceAtual + 1 < deckEstudo.length) {
      setIndiceAtual(indiceAtual + 1);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center">
        <p className="text-2xl text-white">Carregando desafio de frases...</p>
      </div>
    );
  }

  if (status === "limited") {
    return (
      <div className="w-full max-w-md text-center text-white">
        <div className="rounded-lg bg-zinc-800 p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-red-500">Limite Atingido</h2>
          <p className="mt-4 text-xl text-zinc-300">
            Você já usou suas 2 tentativas de frases hoje.
          </p>
          <p className="mt-2 text-zinc-400">Volte amanhã!</p>
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="w-full max-w-md text-center text-white">
        <div className="rounded-lg bg-zinc-800 p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-emerald-500">Tudo certo!</h2>
          <p className="mt-4 text-xl text-zinc-300">
            Nenhuma frase global encontrada.
          </p>
          <p className="mt-2 text-zinc-400">Execute o script de seed!</p>
        </div>
      </div>
    );
  }

  if (sessaoConcluida) {
    return (
      <div className="w-full max-w-md text-center text-white">
        <div className="rounded-lg bg-zinc-800 p-8 shadow-lg">
          {verRevisao ? (
            <div>
              <h2 className="text-2xl font-bold text-emerald-500">
                Revisão da Sessão
              </h2>
              <ul className="mt-4 max-h-60 overflow-y-auto text-left divide-y divide-zinc-700">
                {deckEstudo.map((frase) => (
                  <li key={frase.id} className="py-2">
                    <span className="font-bold text-white">
                      {frase.frase_en}
                    </span>
                    <span className="text-zinc-400">: {frase.frase_pt}</span>
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
            <div>
              <h2 className="text-3xl font-bold text-emerald-500">
                Sessão Concluída!
              </h2>
              <p className="mt-4 text-xl text-zinc-300">
                Você estudou {deckEstudo.length} frases hoje.
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

              {/* Botões de Ação */}
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

  if (status === "ready" && !sessaoConcluida) {
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
            <p className="mt-3 text-center text-emerald-500">
              Correto! A palavra é: "{fraseAtual.palavra_chave}"
            </p>
          )}
          {feedback === "incorreto" && (
            <p className="mt-3 text-center text-red-500">
              Incorreto. A resposta correta é: "{fraseAtual.palavra_chave}"
            </p>
          )}
        </div>
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

  return null;
}
