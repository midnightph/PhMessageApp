import './messageSideBar.css'
import { useEffect, useState } from "react";
import { getUserConversations } from "../services/conversationService";
import { auth } from "../services/firebase";

export function MessageSideBar() {
    const [conversations, setConversations] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try{
            const user = auth.currentUser;
            if (!user) return;

            const data = await getUserConversations(user.uid);
            setConversations(data);
            console.log(data)
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        }
    }

        fetchData();
    }, []);

    if (isLoading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    );
    if (conversations === undefined) return null;
    if(conversations.length === 0) return <p className="no-conversations">Você não tem nenhuma conversa</p>;

    return (
        <div className="chat-list">
            {conversations.map((conv) => (
                <div key={conv.id} className="chat-item">
                    <div className="avatar"></div>
                    <div>
                        <h4>{conv.name || "Conversa"}</h4>
                        <p>{conv.lastMessage || "Sem mensagens"}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
