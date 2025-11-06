import { Progresso } from "../components/Progresso";
import { Link } from "react-router-dom";

export function ProgressoPage() {
  return (
    <div className="w-full max-w-2xl">
      <Link
        to="/diarias"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Desafios Diários
      </Link>
      <Progresso />
    </div>
  );
}
