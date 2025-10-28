import { Link } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export function Header({ user }) {
  async function handleLogin() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (erro) {
      console.error("Erro ao logar com Google:", erro);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (erro) {
      console.error("Erro ao fazer logout:", erro);
    }
  }

  return (
    <header className="absolute top-0 left-0 flex w-full items-center justify-between bg-zinc-800 p-4 shadow-md">
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-2xl font-bold text-white">
          Learn<span className="text-emerald-500">English</span>
        </Link>

        {user && (
          <nav className="flex space-x-4">
            <Link
              to="/estudar-palavras"
              className="text-zinc-300 hover:text-emerald-500"
            >
              Estudar Palavras
            </Link>
            <Link
              to="/estudar-frases"
              className="text-zinc-300 hover:text-emerald-500"
            >
              Estudar Frases
            </Link>
            <Link
              to="/praticar-escrita"
              className="text-zinc-300 hover:text-emerald-500"
            >
              Praticar Escrita
            </Link>
          </nav>
        )}
      </div>

      <div>
        {user ? (
          <div className="flex items-center space-x-4">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="h-10 w-10 rounded-full border-2 border-emerald-500"
              referrerPolicy="no-referrer"
            />
            <p className="text-white">{user.displayName}</p>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-600"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-500"
          >
            Login com Google
          </button>
        )}
      </div>
    </header>
  );
}
