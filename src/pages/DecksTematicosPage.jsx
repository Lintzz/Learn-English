import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export function DecksTematicosPage() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDecks() {
      try {
        const decksCollection = collection(db, "decks");
        const q = query(decksCollection, orderBy("nome"));
        const snapshot = await getDocs(q);

        const listaDecks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDecks(listaDecks);
      } catch (err) {
        console.error("Erro ao buscar decks temáticos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDecks();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-lg text-center text-white">
        <h1 className="text-3xl font-bold">Decks Temáticos</h1>
        <p className="mt-4 text-xl text-zinc-400">
          Carregando decks disponíveis...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg text-white animate-fadeIn">
      <h1 className="mb-8 text-center text-3xl font-bold">Decks Temáticos</h1>

      {decks.length === 0 ? (
        <p className="mt-4 text-xl text-center text-zinc-400">
          Nenhum deck temático encontrado. (Rode o script de seed!)
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              to={`/decks-tematicos/${deck.id}`}
              className="block w-full rounded-lg bg-zinc-800 p-6 transition-colors hover:bg-zinc-700"
            >
              <h2 className="text-2xl font-bold text-emerald-400">
                {deck.nome}
              </h2>
              <p className="mt-2 text-zinc-400">{deck.descricao}</p>
            </Link>
          ))}
        </div>
      )}

      <Link
        to="/"
        className="mt-8 block text-center text-lg text-zinc-400 hover:text-white"
      >
        &larr; Voltar ao Início
      </Link>
    </div>
  );
}
