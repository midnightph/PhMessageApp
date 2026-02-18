import { auth } from "../../services/firebase";
import { getUserData } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles.css";

function Home() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    async function fetchUser() {
      const userData = await getUserData(user.uid);
      setData(userData);
    }

    fetchUser();
  }, [user, navigate]);

  if (!user || !data) return null;

  return (
    <div className="chat-container">
      {/* Sidebar */}
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
