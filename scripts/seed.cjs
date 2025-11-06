const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://meu-app-ingles.firebaseio.com",
});

const db = admin.firestore();

const decks = [
  {
    id: "cores",
    nome: "Cores 🎨",
    descricao: "Aprenda as cores básicas em inglês.",
    palavras: [
      { palavra_en: "Red", palavra_pt: "Vermelho" },
      { palavra_en: "Blue", palavra_pt: "Azul" },
      { palavra_en: "Green", palavra_pt: "Verde" },
      { palavra_en: "Yellow", palavra_pt: "Amarelo" },
      { palavra_en: "Black", palavra_pt: "Preto" },
      { palavra_en: "White", palavra_pt: "Branco" },
      { palavra_en: "Purple", palavra_pt: "Roxo" },
      { palavra_en: "Orange", palavra_pt: "Laranja" },
      { palavra_en: "Brown", palavra_pt: "Marrom" },
      { palavra_en: "Gray", palavra_pt: "Cinza" },
    ],
  },
  {
    id: "animais",
    nome: "Animais 🐶",
    descricao: "Nomes de animais comuns.",
    palavras: [
      { palavra_en: "Dog", palavra_pt: "Cachorro" },
      { palavra_en: "Cat", palavra_pt: "Gato" },
      { palavra_en: "Bird", palavra_pt: "Pássaro" },
      { palavra_en: "Fish", palavra_pt: "Peixe" },
      { palavra_en: "Horse", palavra_pt: "Cavalo" },
      { palavra_en: "Cow", palavra_pt: "Vaca" },
      { palavra_en: "Lion", palavra_pt: "Leão" },
      { palavra_en: "Tiger", palavra_pt: "Tigre" },
      { palavra_en: "Bear", palavra_pt: "Urso" },
      { palavra_en: "Monkey", palavra_pt: "Macaco" },
    ],
  },
];

async function seedDatabase() {
  console.log("Iniciando o script de seed...");

  for (const deck of decks) {
    console.log(`Processando deck: ${deck.nome}`);

    const deckRef = db.collection("decks").doc(deck.id);
    await deckRef.set({
      nome: deck.nome,
      descricao: deck.descricao,
    });

    const palavrasRef = deckRef.collection("palavras");

    const batch = db.batch();

    deck.palavras.forEach((palavra) => {
      const docRef = palavrasRef.doc();
      batch.set(docRef, palavra);
    });

    await batch.commit();
    console.log(` -> ${deck.palavras.length} palavras adicionadas.`);
  }

  console.log("Seed concluído com sucesso!");
}

seedDatabase().catch((err) => {
  console.error("Erro no script de seed:", err);
});
