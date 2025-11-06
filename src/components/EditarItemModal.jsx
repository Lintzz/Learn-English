import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export function EditarItemModal({ item, onClose, onSave }) {
  const { user } = useOutletContext();
  const userId = user?.uid;

  const [tipo, setTipo] = useState("palavra");
  const [ingles, setIngles] = useState("");
  const [portugues, setPortugues] = useState("");
  const [palavraChave, setPalavraChave] = useState("");
  const [status, setStatus] = useState("neutro");

  useEffect(() => {
    if (item) {
      if (item.palavra_chave !== undefined) {
        setTipo("frase");
        setIngles(item.frase_en);
        setPortugues(item.frase_pt);
        setPalavraChave(item.palavra_chave);
      } else {
        setTipo("palavra");
        setIngles(item.palavra_en);
        setPortugues(item.palavra_pt);
      }
      setStatus("neutro");
    }
  }, [item]);

  async function handleSave(e) {
    e.preventDefault();
    if (!userId || !item) return;

    setStatus("salvando");

    try {
      let colecaoRef;
      let dadosAtualizados;
      let docRef;

      if (tipo === "palavra") {
        colecaoRef = "palavras";
        dadosAtualizados = {
          palavra_en: ingles,
          palavra_pt: portugues,
        };
      } else {
        if (!palavraChave) {
          setStatus("erro");
          return;
        }
        colecaoRef = "frases";
        dadosAtualizados = {
          frase_en: ingles,
          frase_pt: portugues,
          palavra_chave: palavraChave,
        };
      }

      docRef = doc(db, "usuarios", userId, colecaoRef, item.id);

      await updateDoc(docRef, dadosAtualizados);

      setStatus("sucesso");

      onSave({ ...item, ...dadosAtualizados });

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      setStatus("erro");
    }
  }

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          Editar {tipo === "palavra" ? "Palavra" : "Frase"}
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
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
            placeholder="Tradução em Português"
            className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700 p-3 text-lg text-white outline-none focus:border-emerald-500"
          />
          {tipo === "frase" && (
            <input
              type="text"
              value={palavraChave}
              onChange={(e) => setPalavraChave(e.target.value)}
              placeholder="Palavra-chave"
              className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700 p-3 text-lg text-white outline-none focus:border-emerald-500"
            />
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-600 px-6 py-2 text-lg text-white transition-colors hover:bg-zinc-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={status === "salvando"}
              className="rounded-lg bg-emerald-600 px-6 py-2 text-lg text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              {status === "salvando" ? "Salvando..." : "Salvar"}
            </button>
          </div>

          {status === "sucesso" && (
            <p className="mt-3 text-center text-emerald-500">
              Salvo com sucesso!
            </p>
          )}
          {status === "erro" && (
            <p className="mt-3 text-center text-red-500">Erro ao salvar.</p>
          )}
        </form>
      </div>
    </div>
  );
}
