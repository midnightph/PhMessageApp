import './messageSideBar.css'
import { useState } from "react";

export function MessageSideBar() {
    const {conversations, setConversations} = useState([]);
    return (
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
    )
}