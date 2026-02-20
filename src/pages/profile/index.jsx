import "./styles.css"
import { FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserData } from "../../services/profileService";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Profile() {

    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
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

    if(loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="chat-container">
            <div className="sidebar">
                <div className="sidebar-header-profile">
                    <FaArrowLeft size={22} onClick={() => navigate('/')} />
                    <h1 style={{ fontSize: '26px' }} className="title">Perfil</h1>
                </div>


            </div>
            <div className="content">
                <h1>Seu Perfil</h1>

                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <img src={data.photo} alt="Foto de perfil" className="profile-image" />
                </div>

                <div className="profile-data">
                    <p><strong>Nome:</strong> {data.name}</p>
                    <p><strong>Email:</strong> {data.email}</p>
                </div>
            </div>
        </div>
    )
}