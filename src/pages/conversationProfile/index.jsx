import { useEffect, useState } from "react";
import "./styles.css";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { FaArrowLeft } from "react-icons/fa";

export default function ConversationProfile() {
    const location = useLocation();
    const conversationId = location.state?.conversation;
    const [isLoading, setIsLoading] = useState(true);
    const [conversationDetails, setConversationDetails] = useState(null);

    useEffect(() => {
        if (!conversationId) return;

        const fetchConversationDetails = async () => {
            try {
                const conversationRef = doc(db, "conversations", conversationId);
                const conversationSnap = await getDoc(conversationRef);

                if (conversationSnap.exists()) {
                    setConversationDetails(conversationSnap.data());
                }
            } catch (error) {
                console.error("Erro ao buscar detalhes da conversa:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversationDetails();
    }, [conversationId]);

    function formatDate(timestamp) {
        if (!timestamp?.seconds) return "-";
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString();
    }

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!conversationDetails) {
        return <div className="content">Conversa não encontrada.</div>;
    }

    return (
        <div className="chat-container">
            <div className="profile-card">
                <div className="header">
                    <FaArrowLeft className="back-button" onClick={() => window.history.back()} size={20}/>
                    <h2>Perfil da Conversa</h2>
                </div>

                <div className="info-group">
                    <label>Criada em</label>
                    <span>{formatDate(conversationDetails.createdAt)}</span>
                </div>

                <div className="info-group">
                    <label>Atualizada em</label>
                    <span>{formatDate(conversationDetails.updatedAt)}</span>
                </div>

                <div className="info-group">
                    <label>Última mensagem</label>
                    <span>{conversationDetails.lastMessage || "Nenhuma"}</span>
                </div>

                <div className="info-group">
                    <label>Último remetente</label>
                    <span>{conversationDetails.participantsInfo[conversationDetails.lastMessageSender]?.name || "Desconhecido"}</span>
                </div>

                <div className="participants">
                    <h3>Participantes</h3>

                    {Object.entries(conversationDetails.participantsInfo).map(
                        ([uid, user]) => (
                            <div key={uid} className="participant-card">
                                <img src={user.photo} alt={user.name} />
                                <div>
                                    <strong>{user.name}</strong>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}