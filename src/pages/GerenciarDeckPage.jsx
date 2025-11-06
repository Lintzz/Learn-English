import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { EditarItemModal } from "../components/EditarItemModal";
import { AdicionarPalavraForm } from "../components/AdicionarPalavraForm";

export function GerenciarDeckPage() {
  const { user } = useOutletContext();
  const userId = user?.uid;

  const [palavras, setPalavras] = useState([]);
  const [frases, setFrases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState(null);

  useEffect(() => {
    if (!userId) return;
    async function carregarDeck() {
      setLoading(true);
      try {
        const palavrasRef = collection(db, "usuarios", userId, "palavras");
        const palavrasSnap = await getDocs(palavrasRef);
        setPalavras(
          palavrasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        const frasesRef = collection(db, "usuarios", userId, "frases");
        const frasesSnap = await getDocs(frasesRef);
        setFrases(
          frasesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Erro ao carregar deck para gerenciamento:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarDeck();
  }, [userId]);

  async function handleDelete(tipo, docId) {
    if (!userId) return;
    const colecao = tipo === "palavra" ? "palavras" : "frases";
    if (!window.confirm(`Tem certeza que deseja excluir esta ${tipo}?`)) return;
    try {
      const docRef = doc(db, "usuarios", userId, colecao, docId);
      await deleteDoc(docRef);
      if (tipo === "palavra") {
        setPalavras(palavras.filter((p) => p.id !== docId));
      } else {
        setFrases(frases.filter((f) => f.id !== docId));
      }
    } catch (err) {
      console.error("Erro ao deletar item:", err);
      alert(`Falha ao excluir. Tente novamente.`);
    }
  }

  function handleAbrirModal(item) {
    setItemParaEditar(item);
    setIsModalOpen(true);
  }

  function handleFecharModal() {
    setIsModalOpen(false);
    setItemParaEditar(null);
  }

  function handleSalvarEdicao(itemAtualizado) {
    if (itemAtualizado.palavra_chave !== undefined) {
      setFrases(
        frases.map((f) => (f.id === itemAtualizado.id ? itemAtualizado : f))
      );
    } else {
      setPalavras(
        palavras.map((p) => (p.id === itemAtualizado.id ? itemAtualizado : p))
      );
    }
  }

  if (loading) {
    return <p className="text-2xl text-white">Carregando seu deck...</p>;
  }

  return (
    <div className="w-full max-w-2xl text-white animate-fadeIn">
      <Link
        to="/meu-deck"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Meu Deck
      </Link>
      <h1 className="text-3xl font-bold mb-6">Gerenciar Meu Deck</h1>

      {/* 2. ADICIONAR O FORMULÁRIO AQUI */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-emerald-400 mb-4">
          Adicionar Novo Item
        </h2>
        <AdicionarPalavraForm />
      </div>

      {/* Seção de Palavras */}
      <h2 className="text-2xl font-semibold text-sky-400 mb-4">
        Minhas Palavras
      </h2>
      <div className="rounded-lg bg-zinc-800 p-4 mb-6">
        {palavras.length === 0 ? (
          <p className="text-zinc-400">Nenhuma palavra adicionada.</p>
        ) : (
          <ul className="divide-y divide-zinc-700">
            {palavras.map((p) => (
              <li key={p.id} className="flex justify-between items-center p-3">
                <div>
                  <p className="text-lg font-bold">{p.palavra_en}</p>
                  <p className="text-zinc-400">{p.palavra_pt}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAbrirModal(p)}
                    className="rounded-md bg-sky-600 px-3 py-1 text-sm text-white transition-colors hover:bg-sky-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete("palavra", p.id)}
                    className="rounded-md bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-500"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Seção de Frases */}
      <h2 className="text-2xl font-semibold text-sky-400 mb-4">
        Minhas Frases
      </h2>
      <div className="rounded-lg bg-zinc-800 p-4">
        {frases.length === 0 ? (
          <p className="text-zinc-400">Nenhuma frase adicionada.</p>
        ) : (
          <ul className="divide-y divide-zinc-700">
            {frases.map((f) => (
              <li key={f.id} className="flex justify-between items-center p-3">
                <div>
                  <p className="text-lg font-bold">{f.frase_en}</p>
                  <p className="text-zinc-400">{f.frase_pt}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAbrirModal(f)}
                    className="rounded-md bg-sky-600 px-3 py-1 text-sm text-white transition-colors hover:bg-sky-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete("frase", f.id)}
                    className="rounded-md bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-500"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Renderizar o Modal */}
      {isModalOpen && (
        <EditarItemModal
          item={itemParaEditar}
          onClose={handleFecharModal}
          onSave={handleSalvarEdicao}
        />
      )}
    </div>
  );
}
