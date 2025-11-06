import { Link, useOutletContext } from "react-router-dom";

export function HomePage() {
  const { user } = useOutletContext();

  return (
    <div className="w-full max-w-xl text-center text-white animate-fadeIn">
      <h1 className="text-5xl font-bold">
        Bem-vindo ao Learn<span className="text-emerald-500">English</span>
      </h1>

      {user ? (
        <div className="mt-10 grid grid-cols-1 gap-6">
          <Link
            to="/diarias"
            className="block w-full rounded-lg bg-zinc-800 p-8 text-center transition-transform hover:scale-105 hover:bg-zinc-700"
          >
            <h2 className="text-3xl font-bold text-emerald-400">
              Desafio Diário
            </h2>
            <p className="mt-2 text-zinc-400">
              Teste seus conhecimentos do dia.
            </p>
          </Link>

          <Link
            to="/meu-deck"
            className="block w-full rounded-lg bg-zinc-800 p-8 text-center transition-transform hover:scale-105 hover:bg-zinc-700"
          >
            <h2 className="text-3xl font-bold text-sky-400">
              Meu Deck Pessoal
            </h2>
            <p className="mt-2 text-zinc-400">
              Revise suas palavras e frases salvas.
            </p>
          </Link>

          <Link
            to="/decks-tematicos"
            className="block w-full rounded-lg bg-zinc-800 p-8 text-center transition-transform hover:scale-105 hover:bg-zinc-700"
          >
            <h2 className="text-3xl font-bold text-orange-400">
              Decks Temáticos
            </h2>
            <p className="mt-2 text-zinc-400">
              Aprenda vocabulário por categoria.
            </p>
          </Link>
        </div>
      ) : (
        <p className="mt-8 text-2xl text-zinc-400">
          Por favor, faça login com o Google no canto superior direito para
          começar.
        </p>
      )}
    </div>
  );
}
