import { Link } from "react-router-dom";

export function MeuDeckPage() {
  return (
    <div className="w-full max-w-lg text-white animate-fadeIn">
      <h1 className="mb-8 text-center text-3xl font-bold">Meu Deck Pessoal</h1>
      <div className="grid grid-cols-1 gap-6">
        <Link
          to="/meu-deck/palavras"
          className="block w-full rounded-lg bg-zinc-800 p-6 text-center transition-colors hover:bg-zinc-700"
        >
          <h2 className="text-2xl font-bold text-sky-400">
            Revisar Minhas Palavras
          </h2>
        </Link>

        <Link
          to="/meu-deck/frases"
          className="block w-full rounded-lg bg-zinc-800 p-6 text-center transition-colors hover:bg-zinc-700"
        >
          <h2 className="text-2xl font-bold text-sky-400">
            Revisar Minhas Frases
          </h2>
        </Link>

        <Link
          to="/meu-deck/gerenciar"
          className="block w-full rounded-lg bg-zinc-800 p-6 text-center transition-colors hover:bg-zinc-700"
        >
          <h2 className="text-2xl font-bold text-yellow-500">
            Gerenciar Meu Deck (Adicionar/Ver/Excluir)
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
