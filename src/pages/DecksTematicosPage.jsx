import { Link } from "react-router-dom";

export function DecksTematicosPage() {
  return (
    <div className="w-full max-w-lg text-center text-white animate-fadeIn">
      <h1 className="text-3xl font-bold">Decks Temáticos</h1>
      <p className="mt-4 text-xl text-zinc-400">
        Esta seção está em desenvolvimento.
      </p>
      <p className="mt-2 text-zinc-400">
        Aqui você poderá estudar vocabulário por categorias, como "Cores",
        "Animais", "Comida", etc.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-lg text-white transition-colors hover:bg-emerald-500"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}
