import { auth } from "../../services/firebase";
import { getUserData } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "./styles.css";
import { MessageSideBar } from "../../components/messageSideBar";
import {
  getMessagesPage,
  sendMessage,
  listenNewMessages
} from "../../services/conversationService";
import { FaSignOutAlt } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const inputRef = useRef(null);
  const [user, setUser] = useState(undefined);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesContainerRef = useRef(null);

  // LOGIN
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
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

  // ABRIR CONVERSA
  useEffect(() => {
    if (!activeConversation) return;

    setMessages([]);
    setLastDoc(null);
    setHasMore(true);
    setIsLoadingMessages(true);

    loadInitialMessages();
  }, [activeConversation]);

  async function loadInitialMessages() {
    const { messages, lastDoc, hasMore } =
      await getMessagesPage(activeConversation.id);

    setMessages(messages);
    setLastDoc(lastDoc);
    setHasMore(hasMore);
    setIsLoadingMessages(false);

    // Scroll só quando abrir
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  }

  async function loadMoreMessages() {
    if (!hasMore || !lastDoc) return;

    const container = messagesContainerRef.current;
    const previousHeight = container.scrollHeight;

    const { messages: newMessages, lastDoc: newLastDoc, hasMore: more }
      = await getMessagesPage(activeConversation.id, lastDoc);

    setMessages(prev => [...newMessages, ...prev]);
    setLastDoc(newLastDoc);
    setHasMore(more);

    setTimeout(() => {
      container.scrollTop =
        container.scrollHeight - previousHeight;
    }, 50);
  }

  // SCROLL INFINITO
  function handleScroll() {
    const container = messagesContainerRef.current;
    if (container.scrollTop === 0) {
      loadMoreMessages();
    }
  }

  // ESCUTAR MENSAGENS NOVAS
  useEffect(() => {
    if (!activeConversation) return;

    const unsubscribe = listenNewMessages(
      activeConversation.id,
      (newMessage) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    );

    return () => unsubscribe();
  }, [activeConversation]);

  if (user === undefined) return null;
  if (!user || !data) return null;

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>{data.name || data.email}</h3>
          <button className="logout-button" onClick={() =>{
            auth.signOut()
            navigate('/login')}}>
            <FaSignOutAlt style={{ marginRight: 5 }} />
            Logout
          </button>
        </div>
        <MessageSideBar onSelectConversation={setActiveConversation} />
      </div>

      <div className="chat-area">
        {!activeConversation ? (
          <div className="no-chat-selected">
            <p>Ainda nada aqui</p>
          </div>
        ) : (
          <>
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
            <div
              className="messages"
              ref={messagesContainerRef}
              onScroll={handleScroll}
            >

              {isLoadingMessages && <p>Carregando...</p>}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.senderId === user.uid
                    ? "sent"
                    : "received"
                    }`}
                >
                  <p>{message.text}</p>
                </div>
              ))}
            </div>

            <div className="message-input">
              <input
                ref={inputRef}
                placeholder="Digite uma mensagem..."
                type="text"
                value={messageText}
                onChange={(e) =>
                  setMessageText(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(
                      activeConversation.id,
                      messageText
                    );
                    setMessageText("");
                  }
                }}
              />
              <button
                onClick={() => {
                  sendMessage(
                    activeConversation.id,
                    messageText
                  );
                  setMessageText("");
                }}
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;