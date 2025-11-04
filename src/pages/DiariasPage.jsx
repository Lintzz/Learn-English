import { Link } from "react-router-dom";

export function DiariasPage() {
  return (
    <div className="w-full max-w-lg text-white animate-fadeIn">
      <h1 className="mb-8 text-center text-3xl font-bold">Desafio Diário</h1>
      <div className="grid grid-cols-1 gap-6">
        <Link
          to="/diarias/palavras"
          className="block w-full rounded-lg bg-zinc-800 p-6 text-center transition-colors hover:bg-zinc-700"
        >
          <h2 className="text-2xl font-bold text-emerald-400">
            Estudar Palavras
          </h2>
        </Link>

        <Link
          to="/diarias/frases"
          className="block w-full rounded-lg bg-zinc-800 p-6 text-center transition-colors hover:bg-zinc-700"
        >
          <h2 className="text-2xl font-bold text-emerald-400">
            Estudar Frases
          </h2>
        </Link>

        <Link
          to="/"
          className="mt-4 text-center text-lg text-zinc-400 hover:text-white"
        >
          &larr; Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
