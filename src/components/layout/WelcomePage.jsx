import React, { useState } from "react";
import LoginModal from "../features/auth/LoginModal";
import { ArrowRight, CheckCircle2, LayoutGrid, Compass } from "lucide-react";

export default function WelcomePage() {
    const [authModal, setAuthModal] = useState({ isOpen: false, view: "login" });

    const openLogin = () => setAuthModal({ isOpen: true, view: "login" });
    const openSignup = () => setAuthModal({ isOpen: true, view: "signup" });
    const closeModal = () => setAuthModal({ ...authModal, isOpen: false });

    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                background: "#0f172a",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative",
            }}
        >
            {/* Background Ambience */}
            <div
                style={{
                    position: "absolute",
                    top: "-10%",
                    left: "-10%",
                    width: "50%",
                    height: "50%",
                    background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(15,23,42,0) 70%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-10%",
                    right: "-10%",
                    width: "60%",
                    height: "60%",
                    background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, rgba(15,23,42,0) 70%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                }}
            />

            {/* Navigator / Header */}
            <header
                style={{
                    padding: "2rem 4rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    zIndex: 10,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: "1.2", paddingBottom: "2px" }} className="text-gradient-primary">
                        SPTM
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "0.1rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Smart Personal Task Manager
                    </div>
                </div>
                <button
                    onClick={openLogin}
                    style={{
                        padding: "0.6rem 1.5rem",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "var(--radius-full)",
                        color: "rgba(255,255,255,0.8)",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                        e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                    }}
                >
                    Sign In
                </button>
            </header>

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    zIndex: 10,
                    padding: "0 2rem",
                }}
                className="fade-in"
            >
                <h1
                    style={{
                        fontSize: "5rem",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.2,
                        paddingBottom: "0.2em",
                        marginBottom: "1rem",
                        background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        maxWidth: "900px",
                    }}
                >
                    Clarity & Focus
                </h1>

                <p
                    style={{
                        fontSize: "1.25rem",
                        color: "var(--color-text-muted)",
                        maxWidth: "550px",
                        lineHeight: 1.6,
                        marginBottom: "3.5rem",
                        fontWeight: 400,
                    }}
                >
                    The essential tool for personal management.<br />
                    Align daily actions with your vision.
                </p>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={openSignup}
                        style={{
                            padding: "1rem 3rem",
                            background: "#fff",
                            color: "#0f172a",
                            borderRadius: "var(--radius-full)",
                            border: "none",
                            fontSize: "1rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 20px 40px -10px rgba(255, 255, 255, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 25px 50px -10px rgba(255, 255, 255, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(255, 255, 255, 0.15)";
                        }}
                    >
                        Get Started <ArrowRight size={18} />
                    </button>
                </div>

                {/* Feature Highlights - Updated opacity and size */}
                <div style={{ marginTop: "6rem", display: "flex", gap: "4rem", opacity: 0.65 }}>
                    <FeatureItem icon={<CheckCircle2 size={20} />} text="GTD Workflow" />
                    <FeatureItem icon={<LayoutGrid size={20} />} text="Covey's Matrix" />
                    <FeatureItem icon={<Compass size={20} />} text="Personal Compass" />
                </div>
            </main>

            <LoginModal
                isOpen={authModal.isOpen}
                onClose={closeModal}
                initialView={authModal.view}
            />
        </div>
    );
}

function FeatureItem({ icon, text }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--color-text-muted)", fontSize: "1rem", letterSpacing: "0.02em" }}>
            {icon}
            <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
    )
}
