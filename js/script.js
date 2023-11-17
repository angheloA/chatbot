document.addEventListener("DOMContentLoaded", function () {
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  let knowledgeBase = {};

  fetch("/conocimiento/knowledge_base.json")
    .then((response) => response.json())
    .then((data) => {
      knowledgeBase = data.preguntas.reduce((acc, { texto, respuesta }) => {
        acc[texto] = respuesta;
        return acc;
      }, {});
    })
    .catch((error) => {
      console.error("Error al cargar knowledge_base.json", error);
    });

  // Cargar la lista de malas palabras
  let badWordsList = [];
  fetch("/conocimiento/bad_words.json")
    .then((response) => response.json())
    .then((data) => {
      badWordsList = data.badWords.map((word) => word.toLowerCase());
      console.log("Bad words loaded:", badWordsList);
    })
    .catch((error) => {
      console.error("Error loading bad_words.json", error);
    });

  function addMessage(sender, message) {
    const msgElement = document.createElement("div");
    msgElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(msgElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function processUserInput() {
    const userMessage = userInput.value.trim();
    if (userMessage === "") return;

    // Verificar malas palabras
    const containsBadWord = badWordsList.some((word) =>
      userMessage.toLowerCase().includes(word)
    );

    if (containsBadWord) {
      addMessage(
        "Bot",
        "Bot: ¡Cuidado con tu lenguaje! Por favor, sé respetuoso."
      );
    } else {
      addMessage("Usuario", userMessage);
      userInput.value = "";

      const botResponse = getBotResponse(userMessage);
      addMessage("Bot", botResponse);
    }
  }

  function getBotResponse(userInput) {
    if (knowledgeBase.hasOwnProperty(userInput)) {
      return `Bot: ${knowledgeBase[userInput]}`;
    } else {
      const newAnswer = prompt(
        "No sé la respuesta. Por favor, ingresa una respuesta:"
      );
      knowledgeBase[userInput] = newAnswer;

      localStorage.setItem("knowledgeBase", JSON.stringify(knowledgeBase));

      return `Bot: Gracias por enseñarme. Ahora sé que ${userInput} es ${newAnswer}`;
    }
  }

  const storedKnowledgeBase = localStorage.getItem("knowledgeBase");
  if (storedKnowledgeBase) {
    knowledgeBase = JSON.parse(storedKnowledgeBase);
  }

  sendButton.addEventListener("click", processUserInput);

  userInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      processUserInput();
    }
  });

});
