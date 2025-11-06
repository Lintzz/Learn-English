import { Link } from "react-router-dom";
import { EstudoDiarioFrases } from "../components/EstudoDiarioFrases";

export function EstudoDiarioFrasesPage() {
  return (
    <div className="w-full max-w-lg">
      <Link
        to="/diarias"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Desafios Diários
      </Link>
      <EstudoDiarioFrases />
    </div>
  );
}
