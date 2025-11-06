import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export function Progresso() {
  const { user } = useOutletContext();
  const userId = user?.uid;

  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPalavras, setTotalPalavras] = useState(0);
  const [totalFrases, setTotalFrases] = useState(0);

  useEffect(() => {
    async function buscarHistorico() {
      if (!userId) return;
      try {
        const historicoRef = collection(
          db,
          "usuarios",
          userId,
          "historicoDiario"
        );

        const q = query(historicoRef, orderBy("data", "desc"), limit(30));

        const querySnapshot = await getDocs(q);

        const listaHistorico = [];
        let totalP = 0;
        let totalF = 0;

        querySnapshot.forEach((doc) => {
          const dados = doc.data();
          listaHistorico.push({
            id: doc.id,
            ...dados,
          });
          totalP += dados.acertosPalavras || 0;
          totalF += dados.acertosFrases || 0;
        });

        setHistorico(listaHistorico);
        setTotalPalavras(totalP);
        setTotalFrases(totalF);
      } catch (error) {
        console.error("Erro ao buscar histórico: ", error);
      } finally {
        setLoading(false);
      }
    }

    buscarHistorico();
  }, [userId]);

  if (loading) {
    return <p className="text-2xl text-white">Carregando progresso...</p>;
  }

  return (
    <div className="w-full max-w-2xl text-white">
      <h1 className="text-3xl font-bold">Meu Progresso</h1>

      {/* Seção de Totais */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-zinc-800 p-6">
          <p className="text-lg text-zinc-400">Total de Palavras</p>
          <p className="text-4xl font-bold text-emerald-500">{totalPalavras}</p>
        </div>
        <div className="rounded-lg bg-zinc-800 p-6">
          <p className="text-lg text-zinc-400">Total de Frases</p>
          <p className="text-4xl font-bold text-emerald-500">{totalFrases}</p>
        </div>
      </div>

      {/* Seção do Histórico Diário */}
      <h2 className="mt-8 text-2xl font-semibold">Histórico Recente</h2>
      <div className="mt-4 rounded-lg bg-zinc-800 p-4">
        {historico.length === 0 ? (
          <p className="text-zinc-400">
            Nenhum estudo registrado ainda. Comece hoje!
          </p>
        ) : (
          <ul className="divide-y divide-zinc-700">
            {historico.map((dia) => (
              <li key={dia.id} className="flex justify-between p-4">
                <span className="text-lg font-semibold">{dia.id}</span>
                <div className="flex space-x-4">
                  <span>
                    Palavras:{" "}
                    <span className="font-bold text-emerald-400">
                      {dia.acertosPalavras || 0}
                    </span>
                  </span>
                  <span>
                    Frases:{" "}
                    <span className="font-bold text-emerald-400">
                      {dia.acertosFrases || 0}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
