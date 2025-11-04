import { Link } from "react-router-dom";
import { EstudoDiarioPalavras } from "../components/EstudoDiarioPalavras";

export function EstudoDiarioPalavrasPage({ userId }) {
  return (
    <div className="w-full max-w-md">
      {/* --- BOTÃO VOLTAR (Corrigido para o hub correto) --- */}
      <Link
        to="/diarias"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Desafios Diários
      </Link>
      <EstudoDiarioPalavras userId={userId} />
    </div>
  );
}
