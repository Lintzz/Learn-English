import { Link } from "react-router-dom";
import { EstudoPessoalFrases } from "../components/EstudoPessoalFrases";

export function EstudoPessoalFrasesPage({ userId }) {
  return (
    <div className="w-full max-w-lg">
      {/* --- BOTÃO VOLTAR --- */}
      <Link
        to="/meu-deck"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Meu Deck
      </Link>
      <EstudoPessoalFrases userId={userId} />
    </div>
  );
}
