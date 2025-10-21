import { useContext } from "react";
// --- MUDEI O CAMINHO DA IMPORTAÇÃO ---
import { AuthContext } from "./AuthContext"; 

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};