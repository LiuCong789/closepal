import React, { useState } from "react";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    // Check if the trimmed message is empty
    if (!trimmedMessage) {
      return;
    }

    setIsSending(true);
    setShowTypingIndicator(true);

    setChatHistory([...chatHistory, { role: "user", content: trimmedMessage }]);
    setMessage("");

    try {
      // Send the user message to the server
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      // Update chat history with the Assistant's response
      setChatHistory((currentChatHistory) => [
        ...currentChatHistory,
        { role: "assistant", content: responseData },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
      setShowTypingIndicator(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">ClosePal - A friend in every tab</div>
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <p
            key={index}
            className={
              msg.role === "user" ? "user-message" : "assistant-message"
            }
          >
            <b>{msg.role === "user" ? "You" : "Assistant"}:</b>
            {msg.content}
          </p>
        ))}
      </div>
      <div>
        {showTypingIndicator && (
          <p className="typing-indicator">
            <i>
              Assistant is typing
              <span className="dot-flashing"></span>
              <span className="dot-flashing"></span>
              <span className="dot-flashing"></span>
            </i>
          </p>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
        />
        <button onClick={sendMessage} disabled={isSending}>
          Send
        </button>
      </div>
      <div className="chat-footer">
        &copy; {new Date().getFullYear()}. Developed by Cong LIU
      </div>
    </div>
  );
}

export default Chatbot;
