import { Timestamp } from "firebase/firestore";

// Níveis de SRS (em dias)
const srsNiveis = [0, 1, 3, 7, 14, 30, 60];

// Retorna a data da próxima revisão com base no nível
export function getProximaRevisao(nivel) {
  const diasParaAdicionar = srsNiveis[nivel] || 0;
  const data = new Date();
  data.setDate(data.getDate() + diasParaAdicionar);
  return Timestamp.fromDate(data);
}

// Retorna o novo nível (subir ou descer)
export function calcularNovoNivel(nivelAtual, acertou) {
  if (acertou) {
    return Math.min(nivelAtual + 1, srsNiveis.length - 1);
  } else {
    return Math.max(nivelAtual - 1, 1);
  }
}
