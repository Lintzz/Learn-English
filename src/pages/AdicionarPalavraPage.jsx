import { AdicionarPalavraForm } from "../components/AdicionarPalavraForm";
import { Link } from "react-router-dom";

export function AdicionarPalavraPage() {
  return (
    <div className="w-full max-w-lg">
      <Link
        to="/meu-deck"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Meu Deck
      </Link>

      <h1 className="text-3xl font-bold text-white mb-6">
        Adicionar ao Meu Deck
      </h1>
      <AdicionarPalavraForm />
    </div>
  );
}
