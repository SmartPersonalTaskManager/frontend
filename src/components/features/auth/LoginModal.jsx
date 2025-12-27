import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User, ArrowRight } from "lucide-react";

import { useGoogleCalendar } from "../../../hooks/useGoogleCalendar";
import BASE_URL from "../../../services/api";
import Toast from "../../ui/Toast";

export default function LoginModal({ isOpen, onClose, initialView = "login" }) {
    const [isSignUp, setIsSignUp] = useState(initialView === "signup");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const { loginUser, handleLoginFailure } = useGoogleCalendar();

    // Reset view when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsSignUp(initialView === "signup");
            setToast(null); // Clear toast on open
        }
    }, [isOpen, initialView]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setToast(null);

        try {
            if (!isSignUp) {
                // Login Logic

                // --- MOCK LOGIN FOR GITHUB PAGES DEMO ---
                // If the user tries to login as 'admin' with password '1234', we bypass the backend.
                if ((formData.email === "admin" || formData.email === "admin@test.com") && formData.password === "1234") {
                    console.log("Mock login triggered");

                    // Simulate network delay
                    await new Promise(resolve => setTimeout(resolve, 800));

                    const mockUser = {
                        id: 1,
                        name: "Test Admin",
                        email: formData.email,
                        picture: null,
                        credential: "mock-jwt-token-for-testing",
                    };

                    loginUser(mockUser);
                    onClose();
                    return; // Stop execution here, don't hit the API
                }
                // ----------------------------------------
                const response = await fetch(`${BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || "Login failed");
                }

                const data = await response.json();

                const user = {
                    id: data.id,
                    name: data.username,
                    email: data.email,
                    picture: null,
                    credential: data.token,
                };
                loginUser(user);
                onClose();

            } else {
                // Signup Logic
                const response = await fetch(`${BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || "Registration failed");
                }

                setToast({ message: "Registration successful! Please login.", type: "success" });
                localStorage.setItem("sptm_is_fresh_user", "true"); // Semantic Flag for App.jsx
                setIsSignUp(false);
            }
        } catch (error) {
            console.error(error);
            setToast({ message: error.message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                animation: "fadeIn 0.2s ease",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div
                className="glass-panel"
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "2.5rem",
                    margin: "1rem",
                    borderRadius: "var(--radius-xl)",
                    position: "relative",
                    animation: "slideUp 0.3s ease",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "1.25rem",
                        right: "1.25rem",
                        background: "transparent",
                        border: "none",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                        padding: "0.5rem",
                        borderRadius: "50%",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--color-text-muted)";
                    }}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h2
                        className="text-gradient-primary"
                        style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                    >
                        SPTM
                    </h2>
                    <p style={{ color: "var(--color-text-muted)" }}>
                        {isSignUp ? "Create your account" : "Welcome Back"}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                    {isSignUp && (
                        <div style={{ position: "relative" }}>
                            <User
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: "1rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--color-text-muted)",
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Username"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                style={{
                                    width: "100%",
                                    padding: "0.85rem 1rem 0.85rem 2.8rem",
                                    background: "rgba(0, 0, 0, 0.2)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "var(--radius-md)",
                                    color: "#fff",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                            />
                        </div>
                    )}

                    <div style={{ position: "relative" }}>
                        <Mail
                            size={18}
                            style={{
                                position: "absolute",
                                left: "1rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--color-text-muted)",
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{
                                width: "100%",
                                padding: "0.85rem 1rem 0.85rem 2.8rem",
                                background: "rgba(0, 0, 0, 0.2)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "var(--radius-md)",
                                color: "#fff",
                                fontSize: "0.95rem",
                                outline: "none",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                        />
                    </div>

                    <div style={{ position: "relative" }}>
                        <Lock
                            size={18}
                            style={{
                                position: "absolute",
                                left: "1rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--color-text-muted)",
                            }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{
                                width: "100%",
                                padding: "0.85rem 1rem 0.85rem 2.8rem",
                                background: "rgba(0, 0, 0, 0.2)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "var(--radius-md)",
                                color: "#fff",
                                fontSize: "0.95rem",
                                outline: "none",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                        />
                    </div>

                    {!isSignUp && (
                        <div style={{ textAlign: "right" }}>
                            <button
                                type="button"
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--color-text-muted)",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                                onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted)")}
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "0.85rem",
                            background: "linear-gradient(135deg, var(--color-primary) 0%, #a855f7 100%)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "var(--radius-md)",
                            color: "#fff",
                            fontSize: "1rem",
                            fontWeight: 600,
                            cursor: isLoading ? "wait" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 4px 20px -5px rgba(99, 102, 241, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.2)",
                            marginTop: "0.5rem"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 8px 25px -5px rgba(99, 102, 241, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.4)";
                            e.currentTarget.style.transform = "translateY(-1px) scale(1.01)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 4px 20px -5px rgba(99, 102, 241, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.2)";
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                        }}
                    >
                        {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    </span>
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--color-primary)",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginLeft: "0.25rem",
                        }}
                    >
                        {isSignUp ? "Log In" : "Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
