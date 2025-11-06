import { Link } from "react-router-dom";
import { EstudoPessoalFrases } from "../components/EstudoPessoalFrases";

export function EstudoPessoalFrasesPage() {
  return (
    <div className="w-full max-w-lg">
      <Link
        to="/meu-deck"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Meu Deck
      </Link>
      <EstudoPessoalFrases />
    </div>
  );
}
