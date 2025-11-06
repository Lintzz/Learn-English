import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

function getHojeString() {
  return new Date().toISOString().split("T")[0];
}
function getOntemString() {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  return ontem.toISOString().split("T")[0];
}

export function Header({ user }) {
  const [userData, setUserData] = useState({ streak: 0 });

  useEffect(() => {
    let unsubscribe = () => {};

    if (user) {
      const userDocRef = doc(db, "usuarios", user.uid);

      unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const dados = docSnap.data();
          const hoje = getHojeString();
          const ontem = getOntemString();

          if (dados.lastStudyDay && dados.lastStudyDay < ontem) {
            setUserData({ ...dados, streak: 0 });
          } else {
            setUserData(dados);
          }
        } else {
          setUserData({ streak: 0 });
        }
      });
    } else {
      setUserData({ streak: 0 });
    }

    return () => unsubscribe();
  }, [user]);

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
              to="/diarias"
              className="text-zinc-300 hover:text-emerald-500"
            >
              Desafio Diário
            </Link>
            <Link
              to="/meu-deck"
              className="text-zinc-300 hover:text-emerald-500"
            >
              Meu Deck
            </Link>
            <Link
              to="/decks-tematicos"
              className="text-zinc-300 hover:text-emerald-500"
            >
              Decks Temáticos
            </Link>
          </nav>
        )}
      </div>

      <div>
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-lg text-orange-400">
              <span>🔥</span>
              <span className="font-bold">{userData.streak || 0}</span>
            </div>

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
