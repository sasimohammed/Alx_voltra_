import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type User = {
    name: string | null;
    email?: string;
    id?: string;
} | null;

type TokenObject = {
    access: string;
    refresh?: string;
} | null;

type UserContextType = {
    user: User;
    token: TokenObject;
    setUser: (user: User, tokenResponse?: TokenObject | string) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User>(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setTokenState] = useState<TokenObject>(() => {
        const savedToken = localStorage.getItem("token");
        if (!savedToken) return null;
        try {
            const parsed = JSON.parse(savedToken);
            if (parsed?.access) return parsed;
            return null;
        } catch {
            return { access: savedToken };
        }
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSetUser = (newUser: User, tokenResponse?: TokenObject | string) => {
        setUserState(newUser);

        if (tokenResponse) {
            if (typeof tokenResponse === "string") {
                const objToken = { access: tokenResponse };
                setTokenState(objToken);
                localStorage.setItem("token", JSON.stringify(objToken));
            } else {
                setTokenState(tokenResponse);
                localStorage.setItem("token", JSON.stringify(tokenResponse));
            }
        }

        if (!newUser) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setTokenState(null);
        }

        if (newUser) {
            localStorage.setItem("user", JSON.stringify(newUser));
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const currentToken = token?.access;
            if (currentToken) {
                await fetch("https://django-kf3s.vercel.app/api/auth/logout/", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${currentToken}`, "Content-Type": "application/json" },
                    credentials: "include",
                });
            }
        } catch (err) {
            console.error("❌ Logout error:", err);
        } finally {
            handleSetUser(null);
            setIsLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, token, setUser: handleSetUser, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used inside UserProvider");
    return context;
};