import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export function EstudoPalavra() {
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);

  const [indiceAtual, setIndiceAtual] = useState(0);

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
    }
  }

  function irParaAnterior() {
    if (indiceAtual > 0) {
      setIndiceAtual(indiceAtual - 1);
    }
  }

  return (
    <div className="w-full max-w-md ">
      <div className="relative rounded-lg bg-zinc-800 p-6 shadow-lg">
        <h2 className="text-center text-4xl font-bold text-white">
          {palavraAtual.palavra_en}
        </h2>
        {/* <p className="text-center text-xl text-zinc-400">
          {palavraAtual.palavra_pt}
        </p> */}
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
