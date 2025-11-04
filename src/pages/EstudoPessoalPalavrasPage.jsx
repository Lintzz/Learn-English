import { Link } from "react-router-dom";
import { EstudoPessoalPalavras } from "../components/EstudoPessoalPalavras";

export function EstudoPessoalPalavrasPage({ userId }) {
  return (
    <div className="w-full max-w-md">
      {/* --- BOTÃO VOLTAR --- */}
      <Link
        to="/meu-deck"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Meu Deck
      </Link>
      <EstudoPessoalPalavras userId={userId} />
    </div>
  );
}
