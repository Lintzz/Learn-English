// src/components/AdicionarPalavraForm.jsx

import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function AdicionarPalavraForm({ userId }) {
  const [tipo, setTipo] = useState("palavra"); // 'palavra' ou 'frase'
  const [ingles, setIngles] = useState("");
  const [portugues, setPortugues] = useState("");
  const [palavraChave, setPalavraChave] = useState(""); // Só para frases
  const [status, setStatus] = useState("neutro"); // 'neutro', 'salvando', 'sucesso', 'erro'

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userId || !ingles || !portugues) return;

    setStatus("salvando");

    try {
      let colecaoRef;
      let dados;

      if (tipo === "palavra") {
        colecaoRef = collection(db, "usuarios", userId, "palavras");
        dados = {
          palavra_en: ingles,
          palavra_pt: portugues,
          criadaEm: serverTimestamp(),
        };
      } else {
        if (!palavraChave) {
          setStatus("erro");
          return;
        }
        colecaoRef = collection(db, "usuarios", userId, "frases");
        dados = {
          frase_en: ingles,
          frase_pt: portugues,
          palavra_chave: palavraChave,
          criadaEm: serverTimestamp(),
        };
      }

      await addDoc(colecaoRef, dados);

      setIngles("");
      setPortugues("");
      setPalavraChave("");
      setStatus("sucesso");

      setTimeout(() => setStatus("neutro"), 2000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setStatus("erro");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-zinc-800 p-6 shadow-lg"
    >
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-zinc-900 p-1">
        <button
          type="button"
          onClick={() => setTipo("palavra")}
          className={`rounded-md px-4 py-2 text-center font-semibold transition-colors ${
            tipo === "palavra" ? "bg-emerald-600 text-white" : "text-zinc-400"
          }`}
        >
          Palavra
        </button>
        <button
          type="button"
          onClick={() => setTipo("frase")}
          className={`rounded-md px-4 py-2 text-center font-semibold transition-colors ${
            tipo === "frase" ? "bg-emerald-600 text-white" : "text-zinc-400"
          }`}
        >
          Frase
        </button>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={ingles}
          onChange={(e) => setIngles(e.target.value)}
          placeholder={
            tipo === "palavra" ? "Palavra em Inglês" : "Frase em Inglês"
          }
          className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700 p-3 text-lg text-white outline-none focus:border-emerald-500"
        />
        <input
          type="text"
          value={portugues}
          onChange={(e) => setPortugues(e.target.value)}
          placeholder={
            tipo === "palavra"
              ? "Tradução em Português"
              : "Tradução em Português"
          }
          className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700 p-3 text-lg text-white outline-none focus:border-emerald-500"
        />
        {tipo === "frase" && (
          <input
            type="text"
            value={palavraChave}
            onChange={(e) => setPalavraChave(e.target.value)}
            placeholder="Palavra-chave (para o 'complete a frase')"
            className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700 p-3 text-lg text-white outline-none focus:border-emerald-500"
          />
        )}
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={status === "salvando"}
          className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-lg text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {status === "salvando" ? "Salvando..." : "Salvar"}
        </button>
        {status === "sucesso" && (
          <p className="mt-3 text-center text-emerald-500">
            Salvo com sucesso!
          </p>
        )}
        {status === "erro" && (
          <p className="mt-3 text-center text-red-500">
            Erro ao salvar. Verifique os campos.
          </p>
        )}
      </div>
    </form>
  );
}
