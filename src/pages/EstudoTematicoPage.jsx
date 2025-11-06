import { Link } from "react-router-dom";
import { EstudoTematico } from "../components/EstudoTematico";

export function EstudoTematicoPage() {
  return (
    <div className="w-full max-w-md">
      <Link
        to="/decks-tematicos"
        className="mb-4 inline-block text-zinc-400 hover:text-emerald-500"
      >
        &larr; Voltar para Decks Temáticos
      </Link>

      <EstudoTematico />
    </div>
  );
}
