import { useEffect, useState } from "react";
import "./styles.css";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { FaArrowLeft } from "react-icons/fa";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function ConversationProfile() {
    const location = useLocation();
    const conversationId = location.state?.conversation;
    const [isLoading, setIsLoading] = useState(true);
    const [conversationDetails, setConversationDetails] = useState(null);

    const [selectedType, setSelectedType] = useState("image");
    const [mediaMessages, setMediaMessages] = useState([]);
    const [loadingMedia, setLoadingMedia] = useState(false);

    async function fetchMedia(type) {
        if (!conversationId) return;

        setLoadingMedia(true);

        try {
            const q = query(
                collection(db, "conversations", conversationId, "messages"),
                where("type", "==", type),
                orderBy("sendAt", "desc")
            );

            const snap = await getDocs(q);
            console.log("Media messages snap:", snap);

            const results = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setMediaMessages(results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMedia(false);
        }
    }

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

    useEffect(() => {
        fetchMedia(selectedType);
    }, [selectedType]);

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
                    <FaArrowLeft className="back-button" onClick={() => window.history.back()} size={20} />
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
                                    <strong>{uid === auth.currentUser.uid ? user.name + " (você)" : user.name}</strong>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
            <div className="chat-area">
                <div className="media-tabs">
                    <div className="media-selector">
                        <button
                            className={selectedType === "image" ? "active" : ""}
                            onClick={() => setSelectedType("image")}
                        >
                            Imagens
                        </button>

                        <button
                            className={selectedType === "video" ? "active" : ""}
                            onClick={() => setSelectedType("video")}
                        >
                            Vídeos
                        </button>

                        <button
                            className={selectedType === "file" ? "active" : ""}
                            onClick={() => setSelectedType("file")}
                        >
                            Arquivos
                        </button>
                    </div>
                    <div className="media-content">

                        {loadingMedia && <p>Carregando...</p>}

                        {!loadingMedia && selectedType === "file" && (
                            <div className="files-list">
                                {mediaMessages.map(msg => (
                                    <div key={msg.id} className="media-item">
                                        <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                                            📎 {msg.fileName}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loadingMedia && selectedType === "image" && (
                            <div className="media-grid">
                                {mediaMessages.map(msg => (
                                    <div key={msg.id} className="media-item">
                                        <img src={msg.fileUrl} alt="" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loadingMedia && selectedType === "video" && (
                            <div className="video-grid">
                                {mediaMessages.map(msg => (
                                    <div key={msg.id} className="media-item">
                                        <video controls>
                                            <source src={msg.fileUrl} />
                                        </video>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loadingMedia && mediaMessages.length === 0 && (
                            <p>Nenhum item encontrado</p>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}