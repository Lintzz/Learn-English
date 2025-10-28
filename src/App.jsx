import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom"; // 1. Importe o Outlet!
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Header } from "./components/Header";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
        <p className="text-2xl text-white">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center bg-zinc-900 p-4 pt-24">
      <Header user={user} />
      <Outlet context={{ user: user }} />
    </main>
  );
}

export default App;
