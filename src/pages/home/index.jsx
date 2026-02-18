import { auth } from "../../services/firebase";
import { getUserData } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "./styles.css";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(undefined);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        navigate("/");
        return;
      }

      setUser(currentUser);

      const userData = await getUserData(currentUser.uid);
      setData(userData);

    });

    return () => unsubscribe();
  }, [navigate]);

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

        <div className="chat-list">
          <div className="chat-item active">
            <div className="avatar"></div>
            <div>
              <h4>João</h4>
              <p>Última mensagem...</p>
            </div>
          </div>

          <div className="chat-item">
            <div className="avatar"></div>
            <div>
              <h4>Maria</h4>
              <p>Oi, tudo bem?</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h3>João</h3>
        </div>

        <div className="messages">
          <div className="message received">
            <p>Fala mano!</p>
          </div>

          <div className="message sent">
            <p>Salve!</p>
          </div>
        </div>

        <div className="message-input">
          <input type="text" placeholder="Digite uma mensagem..." />
          <button>Enviar</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
