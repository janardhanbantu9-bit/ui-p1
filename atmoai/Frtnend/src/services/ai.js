async function sendMessage(message) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "AI request failed");
  }

  if (typeof data.reply !== "string") {
    throw new Error("The chat API returned an invalid response.");
  }
  return data.reply;
}

window.sendMessage = sendMessage;
