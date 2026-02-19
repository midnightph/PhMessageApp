import './messageSideBar.css'
import { useEffect, useState } from "react";
import { getUserConversations } from "../services/conversationService";
import { auth } from "../services/firebase";

export function MessageSideBar() {
    const [conversations, setConversations] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
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
    if (conversations.length === 0) return <p className="no-conversations">Você não tem nenhuma conversa</p>;

    return (
        <div className="chat-list">
            {conversations.map((conv) => {
                const currentUser = auth.currentUser;
                const otherUid = conv.participants.find(
                    (uid) => uid !== currentUser.uid
                );

                const otherUser = conv.participantInfo?.[otherUid];

                return (
                    <div key={conv.id} className="chat-item">
                        <div className="avatar">
                            {otherUser?.photo && (
                                <img src={otherUser.photo} alt={otherUser.name} />
                            )}
                        </div>
                        <div>
                            <h4>{otherUser?.name || "Usuário"}</h4>
                            <p>{conv.lastMessage || "Sem mensagens"}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
