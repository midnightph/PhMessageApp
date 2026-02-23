import "./styles.css"
import { FaArrowLeft, FaPenSquare } from "react-icons/fa"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserData, updateUserName, handlePhotoChange } from "../../services/profileService";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setupPresence } from "../../services/presenceService";

export default function Profile() {

    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setupPresence();
                try {
                    const docSnap = await getUserData(user);
                    if (docSnap.exists()) {
                        setData(docSnap.data());
                        setLoading(false);
                    } else {
                        console.log("Nenhum dado encontrado!");
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados:", error);
                }
            } else {
                console.log("Usuário não está logado");
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, []);

    async function handleSave() {
        if (!newName.trim()) return;

        try {
            await updateUserName(auth.currentUser.uid, newName);

            setData(prev => ({
                ...prev,
                name: newName
            }));

            setEditing(false);
        } catch (error) {
            console.error("Erro ao atualizar nome:", error);
        }
    }

    async function onPhotoChange(e) {
        setIsLoadingPhoto(true);
        const file = e.target.files[0];
        if (!file) return;

        const url = await handlePhotoChange(file);

        setData(prev => ({
            ...prev,
            photo: url
        }));

        return setIsLoadingPhoto(false);
    }

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="chat-container">
            <div className="sidebar">
                <div className="sidebar-header-profile">
                    <FaArrowLeft size={22} onClick={() => window.history.back()} />
                    <h1 style={{ fontSize: '26px' }} className="title">Perfil</h1>
                </div>


            </div>
            <div className="content">
                <h1>Seu Perfil</h1>

                <div className="photo-wrapper">
                    {isLoadingPhoto ? (
                        <div className="profile-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (<img src={data.photo} alt="Foto de perfil" className="profile-image" />)}
                    <div className="edit-icon-container">
                        <FaPenSquare size={18} className="edit-icon" />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={onPhotoChange}
                            className="file-input"
                        />
                    </div>
                </div>

                <div className="profile-data">
                    <div className="profile-row">
                        <strong>Nome:</strong>

                        {editing ? (
                            <>
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="edit-input"
                                />
                                <button
                                    className="save-btn"
                                    onClick={handleSave}
                                >
                                    Salvar
                                </button>
                            </>
                        ) : (
                            <>
                                <span>{data.name}</span>
                                <button
                                    className="edit-btn"
                                    onClick={() => {
                                        setEditing(true);
                                        setNewName(data.name);
                                    }}
                                >
                                    Editar
                                </button>
                            </>
                        )}
                    </div>

                    <p><strong>Email:</strong> {data.email}</p>
                </div>
            </div>
        </div>
    )
}