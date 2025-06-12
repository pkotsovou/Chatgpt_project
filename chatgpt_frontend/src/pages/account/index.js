import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function AccountPage() {
    const [formData, setFormData] = useState({
        name: "",
        intro: "",
        nickname: "",
        job: "",
        notes: ""
    });

    const [email, setEmail] = useState(""); // ξεχωριστό state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [traits, setTraits] = useState([]);
    const [isAccountDeleted, setIsAccountDeleted] = useState(false);


    const router = useRouter();

    const [showModal, setShowModal] = useState(false);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || isAccountDeleted) return; // <<-- ✅ check για να ΜΗΝ τρέχουν τα GET μετά το delete

        // 1. Load user profile
        axios
            .get("http://localhost:8080/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                const data = res.data;
                console.log("🔁 Φόρτωση χρήστη:", data);
                setFormData({
                    name: data.name || "",
                    intro: data.customPrompt || "",
                    nickname: data.aboutMe || "",
                    job: data.whatDoYouDo || "",
                    notes: data.anythingElse || ""
                });
                setEmail(data.email || "");
            })
            .catch((err) => {
                console.warn("❌ Αποτυχία GET /me:", err);
                setMessage("Failure to load profile");
            });

        // 2. Load user traits
        axios
            .get("http://localhost:8080/api/traits/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                console.log("🔁 Φόρτωση traits:", res.data);
                setTraits(res.data.traits || []);
            })
            .catch((err) => {
                console.warn("❌ Αποτυχία GET /traits/me:", err);
            });

    }, [isAccountDeleted]); // <<-- ✅ added dependency για να ξανατρέχει ΜΟΝΟ αν αλλάξει το isAccountDeleted



    const handleChange = (e) => {
        const { id, value } = e.target;
        // Αγνόησε το πεδίο email (είναι read-only)
        if (id === "email") return;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.preventDefault();
        if (isAccountDeleted) {
            console.log("Skipping submit, account is deleted.");
            return;
        }
        console.log("👉 Payload που θα σταλεί:", {
            name: formData.name,
            customPrompt: formData.intro,
            aboutMe: formData.nickname,
            whatDoYouDo: formData.job,
            anythingElse: formData.notes
        });
        setLoading(true);
        setMessage(null);

        const token = localStorage.getItem("token");

        try {
            await axios.put(
                "http://localhost:8080/api/users/me",
                {
                    name: formData.name,
                    email: email,
                    customPrompt: formData.intro,
                    aboutMe: formData.nickname,
                    whatDoYouDo: formData.job,
                    anythingElse: formData.notes
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // 2. Save traits
            await axios.post(
                "http://localhost:8080/api/traits/me",
                {
                    traits: traits
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage("Changes saved successfully!");
        } catch (error) {
            const errMsg = error?.response?.data?.message || "Error while saving changes.";
            setMessage(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token"); // 🔐 Διαγραφή JWT
        router.push("/login"); // ⏩ Redirect στο login
    };

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete("http://localhost:8080/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAccountDeleted(true);
            localStorage.removeItem("token");
            router.push("/login");
        } catch (error) {
            setMessage("Failed to delete account.");
        }
    };

    return (
        <>
            <Head>
                <title>Account | Chat App</title>
                <link rel="icon" href="/bootcamp-ico.ico" />
            </Head>

            <div className="page-container">
                <header>
                    <div className="header-content">
                        {/*<div className="header-brand">*/}
                        {/*    <img src="./bootcamp-2025.03-logo.jpg" alt="Logo" className="header-logo"/>*/}
                        {/*    <div className="header-title">Chat Application</div>*/}
                        {/*</div>*/}
                        <a href="/chat" className="header-brand" style={{ textDecoration: "none", color: "inherit" }}>
                            <img src="./bootcamp-2025.03-logo.jpg" alt="Logo" className="header-logo"/>
                            <div className="header-title">Chat Application</div>
                        </a>

                        <div className="profile-dropdown">
                            <input type="checkbox" id="profile-toggle"/>
                            <label htmlFor="profile-toggle" className="profile-icon">
                                <img src="/profile.png" alt="Profile" className="profile-img" />
                            </label>
                            <div className="dropdown-menu">
                                <a href="/account">Profile</a>
                                <a href="/account">Settings</a>
                                <a href="#" onClick={handleLogout}>Logout</a>
                            </div>
                            <label htmlFor="profile-toggle" className="overlay"></label>
                        </div>
                    </div>
                </header>

                <div className="content">
                    <div className="account-settings">
                        <h1>User Profile & Settings</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input type="text" id="name" placeholder="John Doe" value={formData.name}
                                       onChange={handleChange}/>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" value={email}
                                       placeholder="john@example.com" disabled/>
                            </div>

                            <div className="form-group">
                                <label htmlFor="intro">Customize ChatGPT</label>
                                <small>Introduce yourself to get better, more personalized responses</small>
                                <textarea id="intro" rows="3" placeholder="Tell ChatGPT about yourself..."
                                          value={formData.intro}
                                          onChange={handleChange}/>
                            </div>

                            <div className="form-group">
                                <label htmlFor="nickname">What should ChatGPT call you?</label>
                                <input type="text" id="nickname" placeholder="Nickname" value={formData.nickname}
                                       onChange={handleChange}/>
                            </div>

                            <div className="form-group">
                                <label htmlFor="job">What do you do?</label>
                                <input type="text" id="job" placeholder="Interior designer" value={formData.job}
                                       onChange={handleChange}/>
                            </div>

                            <div className="form-group">
                                <label>What traits should ChatGPT have?</label>
                                <div className="traits">
                                    {["Chatty", "Witty", "Straight shooting", "Encouraging", "Gen Z", "Skeptical", "Traditional", "Forward thinking", "Poetic"].map((trait) => (
                                        <label key={trait}>
                                            <input
                                                type="checkbox"
                                                checked={traits.includes(trait)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setTraits([...traits, trait]);
                                                    } else {
                                                        setTraits(traits.filter((t) => t !== trait));
                                                    }
                                                }}
                                            />{" "}
                                            {trait}
                                        </label>
                                    ))}
                                </div>
                            </div>


                            <div className="form-group">
                                <label htmlFor="notes">Anything else ChatGPT should know about you?</label>
                                <textarea id="notes" rows="3" placeholder="Additional details..."
                                          value={formData.notes}
                                          onChange={handleChange}/>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading || isAccountDeleted}>
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                className="delete-btn"
                                style={{
                                    marginTop: "1.5rem",
                                    padding: "0.75rem 1.5rem",
                                    background: "linear-gradient(to right, #dc2626, #ef4444)",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    fontWeight: "600",
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 10px rgba(220, 38, 38, 0.3)",
                                    transition: "all 0.3s ease"
                                }}
                                onClick={() => setShowModal(true)}
                            >
                                Delete Account
                            </button>

                            {showModal && (
                                <div className="modal-overlay">
                                    <div className="modal">
                                        <h2>Confirm Account Deletion</h2>
                                        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                                        <div style={{ marginTop: "1rem" }}>
                                            <button
                                                onClick={handleDeleteAccount}
                                                style={{ backgroundColor: "#dc2626", color: "white", marginRight: "1rem", padding: "0.5rem 1rem" }}
                                            >
                                                Yes, delete account
                                            </button>
                                            <button
                                                onClick={() => setShowModal(false)}
                                                style={{ backgroundColor: "#e5e7eb", padding: "0.5rem 1rem" }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {message && <div style={{ marginBottom: "1rem", color: "#444" }}>{message}</div>}
                        </form>
                    </div>
                </div>

                <footer>© 2025 Chat App, Inc.</footer>
            </div>
        </>
    );
}
