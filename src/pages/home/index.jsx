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
import { FaSignOutAlt, FaUserCircle, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { setupPresence } from "../../services/presenceService";
import { getDatabase, ref, onValue } from "firebase/database";

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
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const isLoadingMoreRef = useRef(false);
  const messagesContainerRef = useRef(null);
  const [otherUserStatus, setOtherUserStatus] = useState({
    state: "offline",
  });

  useEffect(() => {
    if (!activeConversation || !user) return;

    const otherUid = activeConversation.participants.find(
      uid => uid !== user.uid
    );

    if (!otherUid) return;

    const database = getDatabase();
    const statusRef = ref(database, `status/${otherUid}`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      setOtherUserStatus(data);
    });

    return () => unsubscribe();
  }, [activeConversation, user]);

  // LOGIN
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setupPresence();

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

  useEffect(() => {
    if (!activeConversation || isLoadingMessages) return;

    // pequeno delay pra garantir que o input já renderizou
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

  }, [activeConversation, isLoadingMessages]);

  useEffect(() => {
    if (!activeConversation) return;

    const unsubscribe = listenNewMessages(
      activeConversation.id,
      (newMessage) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;

          const updated = [...prev, newMessage];

          // Scroll só para mensagens novas
          setTimeout(() => {
            const container = messagesContainerRef.current;
            if (!container) return;

            container.scrollTop = container.scrollHeight;
          }, 0);

          return updated;
        });
      }
    );

    return () => unsubscribe();
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
    }, 5);
  }

  async function loadMoreMessages() {
    if (!hasMore || !lastDoc || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;

    const container = messagesContainerRef.current;
    const previousHeight = container.scrollHeight;

    const {
      messages: newMessages,
      lastDoc: newLastDoc,
      hasMore: more
    } = await getMessagesPage(activeConversation.id, lastDoc);

    if (newMessages.length === 0) {
      isLoadingMoreRef.current = false;
      return;
    }

    setMessages(prev => [...newMessages, ...prev]);
    setLastDoc(newLastDoc);
    setHasMore(more);

    requestAnimationFrame(() => {
      container.scrollTop =
        container.scrollHeight - previousHeight;

      isLoadingMoreRef.current = false;
    });
  }

  // SCROLL INFINITO
  function handleScroll() {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (container.scrollTop <= 0 && !isLoadingMoreRef.current && hasMore) {
      loadMoreMessages();
    }
  }

  function formatLastSeen(timestamp) {
    if (!timestamp) return "Offline";

    const lastDate = new Date(timestamp);
    const now = new Date();

    const isToday =
      lastDate.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      lastDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Visto por último às ${lastDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    if (isYesterday) {
      return `Visto ontem às ${lastDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return `Visto em ${lastDate.toLocaleDateString()} às ${lastDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

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
          <div className="header">
            <button className="logout-button" style={{ backgroundColor: 'rgba(255, 255, 255, 0.47)' }} onClick={() => navigate('/profile')}>
              <FaUserCircle />
            </button>
            <button className="logout-button" onClick={() => {
              auth.signOut()
              navigate('/login')
            }}>
              <FaSignOutAlt />
            </button>
          </div>
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
              <div className="chat-header-info">
                <div>
                <h3>
                  {activeConversation.participantsInfo[
                    activeConversation.participants.find(
                      (uid) => uid !== user.uid
                    )
                  ]?.name}
                </h3>

                <span className={`status ${otherUserStatus?.state}`}>
                  {otherUserStatus?.state === "online"
                    ? "Online"
                    : formatLastSeen(otherUserStatus?.lastChanged)}
                </span>
                </div>
                <FaInfoCircle style={{ marginLeft: "10px" }} />
              </div>
            </div>

            {!isLoadingMessages ? (
              <div
                className="messages"
                ref={messagesContainerRef}
                onScroll={handleScroll}
              >
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      layout
                      key={message.id}
                      className={`message ${message.senderId === user.uid
                        ? "sent"
                        : "received"
                        }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p>{message.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>) : (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            )}

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