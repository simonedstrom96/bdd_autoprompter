document.getElementById("generatePoem")?.addEventListener("click", async () => {

  const poemTextArea = document.getElementById("poem");
  poemTextArea.innerHTML = "Generating poem...";

  try {
    
    const response = await fetch("http://localhost:8080/generate-poem", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      poemTextArea.innerHTML = data.poem;
    } else {
      poemTextArea.innerHTML = "Failed to generate poem.";
    }
  } catch (error) {
    if (error instanceof Error) {
      poemTextArea.innerHTML = "Error: " + error.message;
    } else {
      poemTextArea.innerHTML = "An unknown error occurred.";
    }
  }
});