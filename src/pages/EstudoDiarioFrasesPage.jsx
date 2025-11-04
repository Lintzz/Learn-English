import { Link } from "react-router-dom";
import { EstudoDiarioFrases } from "../components/EstudoDiarioFrases";

export function EstudoDiarioFrasesPage({ userId }) {
  return (
    <div className="w-full max-w-lg">
      {/* --- BOTÃO VOLTAR --- */}
      <Link
        to="/diarias"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Desafios Diários
      </Link>
      <EstudoDiarioFrases userId={userId} />
    </div>
  );
}
