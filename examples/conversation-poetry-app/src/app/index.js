document.getElementById("sendMessage")?.addEventListener("click", sendMessage);

document.getElementById("messageInput")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

async function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const conversationDiv = document.getElementById("conversation");
  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  // Append user message to conversation display
  const userMsgElem = document.createElement("p");
  userMsgElem.textContent = "User: " + userMessage;
  conversationDiv.appendChild(userMsgElem);

  // Clear input
  messageInput.value = "";

  // Send message to backend
  try {
    const response = await fetch("http://localhost:8080/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });
    if (response.ok) {
      const data = await response.json();
      const assistantMsgElem = document.createElement("p");
      assistantMsgElem.textContent = "Assistant: " + data.response;
      conversationDiv.appendChild(assistantMsgElem);
    } else {
      const errorMsgElem = document.createElement("p");
      errorMsgElem.textContent = "Error sending message.";
      conversationDiv.appendChild(errorMsgElem);
    }
  } catch (error) {
    const errorMsgElem = document.createElement("p");
    errorMsgElem.textContent = "Error: " + error.message;
    conversationDiv.appendChild(errorMsgElem);
  }
}

document.getElementById("generatePoem")?.addEventListener("click", async () => {
  const poemOutput = document.getElementById("poemOutput");
  poemOutput.textContent = "Generating poem...";

  try {
    const response = await fetch("http://localhost:8080/generate-poem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      poemOutput.textContent = data.poem;
    } else {
      poemOutput.textContent = "Failed to generate poem.";
    }
  } catch (error) {
    poemOutput.textContent = "Error: " + error.message;
  }
});

document.getElementById("resetConversation")?.addEventListener("click", async () => {
  const conversationDiv = document.getElementById("conversation");
  const poemOutput = document.getElementById("poemOutput");
  try {
    const response = await fetch("http://localhost:8080/reset-conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      conversationDiv.innerHTML = "";
      poemOutput.textContent = "Your poem will appear here...";
    } else {
      alert("Failed to reset conversation.");
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
});