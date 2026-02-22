import './messageSideBar.css'
import { useEffect, useState } from "react";
import { getUserConversations, createChatWithDev } from "../services/conversationService";
import { auth } from "../services/firebase";

export function MessageSideBar({ onSelectConversation }) {
    const [conversations, setConversations] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribe = getUserConversations(
            user.uid,
            (data) => {
                setConversations(data);
                setIsLoading(false);
            }
        );

        return () => unsubscribe && unsubscribe();
    }, []);

    if (isLoading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    );
    if (conversations === undefined) return null;

    return (
        <div className="chat-list">
            {conversations.length === 0 && (
                <p className="no-conversations">
                    Você não tem nenhuma conversa
                </p>
            )}

            {conversations.map((conv) => {
                const currentUser = auth.currentUser;
                const otherUid = conv.participants.find(
                    (uid) => uid !== currentUser.uid
                );

                const otherUser = conv.participantsInfo?.[otherUid];

                return (
                    <div key={conv.id} className="chat-item" onClick={() => {
                        onSelectConversation(conv)
                    }}>
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
            <div className="talk-to-dev">
                <div
                    className="dev-card"
                    onClick={async () => {
                        const user = auth.currentUser;
                        if (!user) return;

                        const convId = await createChatWithDev(user.uid);

                        // encontra a conversa na lista atual
                        const existingConv = conversations.find(c => c.id === convId);

                        if (existingConv) {
                            onSelectConversation(existingConv);
                        }
                    }}
                >
                    <div className="dev-avatar">DEV</div>
                    <div className="dev-text">
                        <strong>Ninguém pra falar?</strong>
                        <span>Teste o chat com o dev</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
