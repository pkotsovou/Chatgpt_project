import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("login");

    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirm, setSignupConfirm] = useState("");

    const [message, setMessage] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/chat");
        }
    }, [router]);

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    function showMessage(type, text) {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000); // εξαφανίζεται μετά από 3s
    }

    async function handleLogin(e) {
        e.preventDefault(); // αποτρέπουμε default submit συμπεριφορά

        setLoading(true);
        const credentials = btoa(`${email}:${password}`);

        try {
            const response = await axios.post(
                "http://localhost:8080/api/users/login",
                {}, // no body
                {
                    headers: {
                        "Authorization": `Basic ${credentials}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("✅ Login successful:", response.data);
            localStorage.setItem("token", response.data.token);
            router.push("/chat");

        } catch (error) {
            const msg = error?.response?.data?.message || "Login failed. Please check your credentials.";
            showMessage("error", msg);
            setEmail("");
            setPassword("");

        } finally {
            setLoading(false);
        }
    }

    async function handleSignup(event) {
        event.preventDefault();

        if (signupPassword !== signupConfirm) {
            showMessage("error", "Password do not match.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8080/api/users/register", {
                name: signupName,
                email: signupEmail,
                password: signupPassword
            });

            showMessage("success", "Account created successfully. You can now log in.");

            // Reset πεδία και άνοιξε το login tab
            setSignupName("");
            setSignupEmail("");
            setSignupPassword("");
            setSignupConfirm("");
            setActiveTab("login");

        } catch (error) {
            const msg = error?.response?.data?.message || "Signup failed. Please try again.";
            showMessage("error", msg);
        }
    }


    return (
        <>
            <Head>
                <title>Login | ChatGPT App</title>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/bootcamp-ico.ico" />
            </Head>
            <div className="page-container">
                <header>
                    <div className="header-content">
                        <div className="header-brand">
                            <img src="./bootcamp-2025.03-logo.jpg" alt="Logo" className="header-logo"/>
                            <div className="header-title">Chat Application</div>
                        </div>

                    </div>
                </header>
                {/* Μήνυμα */}
                {message && (
                    <div className={`alert ${message.type}`}>{message.text}</div>
                )}

                <div className="content">
                    <div className="tab-container">
                        <input type="radio" id="tab-login" name="tab" checked={activeTab === "login"}
                               onChange={() => setActiveTab("login")} />
                        <input type="radio" id="tab-signup" name="tab" checked={activeTab === "signup"}
                               onChange={() => setActiveTab("signup")}/>
                        <div className="tabs">
                            <label htmlFor="tab-login">Login</label>
                            <label htmlFor="tab-signup">Sign Up</label>
                        </div>

                        <section className="form-section login">
                            <form onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label htmlFor="login-email">Email</label>
                                    <input type="email" id="login-email" placeholder="you@example.com"
                                           value={email}
                                           onChange={handleEmailChange}
                                           required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="login-password">Password</label>
                                    <input type="password" id="login-password" placeholder="••••••••"
                                           value={password}
                                           onChange={handlePasswordChange}
                                           required
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Signing in..." : "Login"}
                                    </button>
                                    <label htmlFor="tab-signup" className="btn btn-link">Create Account</label>
                                </div>
                            </form>
                        </section>

                        <section className="form-section signup">
                            <form onSubmit={handleSignup}>
                                <div className="form-group">
                                    <label htmlFor="signup-name">Name</label>
                                    <input type="text" id="signup-name" placeholder="John Doe" value={signupName}
                                           onChange={(e) => setSignupName(e.target.value)}
                                           required/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="signup-email">Email</label>
                                    <input type="email" id="signup-email" placeholder="you@example.com" value={signupEmail}
                                           onChange={(e) => setSignupEmail(e.target.value)}
                                           required/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="signup-password">Password</label>
                                    <input type="password" id="signup-password" placeholder="••••••••" value={signupPassword}
                                           onChange={(e) => setSignupPassword(e.target.value)}
                                           required/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="signup-confirm">Confirm Password</label>
                                    <input type="password" id="signup-confirm" placeholder="••••••••" value={signupConfirm}
                                           onChange={(e) => setSignupConfirm(e.target.value)}
                                           required/>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">Create Account</button>
                                    <label htmlFor="tab-login" className="btn btn-link">Login</label>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>

                <footer>© 2025 Chat App, Inc.</footer>
            </div>
        </>
    );
}
