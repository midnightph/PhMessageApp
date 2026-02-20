import { auth } from "../../services/firebase";
import { getUserData } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "./styles.css";
import { useRef } from "react";
import { MessageSideBar } from "../../components/messageSideBar";
import { getMessages, sendMessage } from "../../services/conversationService";

function Home() {
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const inputRef = useRef(null);
  const [user, setUser] = useState(undefined);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        navigate("/login");
        return;
      }

      setUser(currentUser);

      const userData = await getUserData(currentUser.uid);
      setData(userData);

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!activeConversation) return;
    if (activeConversation && inputRef.current) {
      inputRef.current.focus();
    }
    setIsLoadingMessages(true);

    const unsubscribe = getMessages(
      activeConversation.id,
      (msgs) => {
        setMessages(msgs);
        setIsLoadingMessages(false); // aqui sim
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [activeConversation]);

  if (user === undefined) return null;
  if (!user || !data) return null;

  if (isLoading) return (
    <div className="loading-container">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>{data.name || data.email}</h3>
        </div>
        <MessageSideBar onSelectConversation={setActiveConversation} />
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h3>
            {activeConversation
              ? activeConversation.participantsInfo[
                activeConversation.participants.find(
                  (uid) => uid !== user.uid
                )
              ]?.name
              : "Selecione uma conversa"}
          </h3>
        </div>

        {!activeConversation ? (
          <div className="no-chat-selected">
            <p>Ainda nada aqui</p>
          </div>
        ) : isLoadingMessages ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.senderId === user.uid ? "sent" : "received"
                  }`}
              >
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="message-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite uma mensagem..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && messageText.trim()) {
                e.preventDefault();
                await sendMessage(activeConversation.id, messageText);
                setMessageText("");
              }
            }}   />
          <button type="submit" onClick={async () => {
            await sendMessage(activeConversation.id, messageText)
            return setMessageText('')
          }}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
