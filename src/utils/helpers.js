// Função para embaralhar um array
export function shuffleArray(array) {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Funções de data para o Desafio Diário
export function getHojeString() {
  return new Date().toISOString().split("T")[0];
}

export function getOntemString() {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  return ontem.toISOString().split("T")[0];
}
