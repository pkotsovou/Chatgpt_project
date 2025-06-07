import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import {useRouter} from "next/router";


export default function ChatPage() {


    const [threads, setThreads] = useState([]);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [selectedModel, setSelectedModel] = useState("llama3-8b-8192");
    const [newMessageContent, setNewMessageContent] = useState("");
    const messagesEndRef = useRef(null);
    const [activeOptionsThreadId, setActiveOptionsThreadId] = useState(null);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [threadIdToRename, setThreadIdToRename] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [threadIdToDelete, setThreadIdToDelete] = useState(null);




    const router = useRouter();

    // Φερνουμε τα threads
    useEffect(() => {
        console.log("ChatPage mounted");

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        fetch("http://localhost:8080/threads/user/me", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch threads");
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched threads:", data);
                setThreads(data);
                if (data.length > 0) {
                    setActiveThreadId(data[0].id); // Set first thread as active
                }
            })
            .catch(error => {
                console.error("Error fetching threads:", error);
            });
    }, []);

    // Φορτώνουμε τα messages όταν αλλάζει το activeThreadId
    useEffect(() => {
        if (activeThreadId == null) return;

        const token = localStorage.getItem("token");

        fetch(`http://localhost:8080/messages/thread/${activeThreadId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch messages");
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched messages:", data);
                setMessages(data);
            })
            .catch(error => {
                console.error("Error fetching messages:", error);
            });
    }, [activeThreadId]);


    // στέλνουμε νέο message
    const handleSendMessage = () => {
        const token = localStorage.getItem("token");

        if (!newMessageContent.trim() || activeThreadId == null) return;

        fetch("http://localhost:8080/messages", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: null, // userId δεν το στέλνεις αν το βγάζει από το token
                threadId: activeThreadId,
                content: newMessageContent,
                model: selectedModel
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to send message");
                }
                return response.json();
            })
            .then(data => {
                console.log("LLM response:", data);

                // Προσθέτουμε το user message και το LLM message στο chat
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Math.random(), // temp id
                        content: newMessageContent,
                        isLLMGenerated: false
                    },
                    data // το LLM message από το backend
                ]);

                setNewMessageContent("");
            })
            .catch(error => {
                console.error("Error sending message:", error);
            });
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messages]);

    const handleLogout = () => {
        localStorage.removeItem("token"); // 🔐 Διαγραφή JWT
        router.push("/login"); // ⏩ Redirect στο login
    };

    const handleThreadOptionsClick = (e, threadId) => {
        e.stopPropagation(); // Να μην κάνει select το thread
        setActiveOptionsThreadId(prev => (prev === threadId ? null : threadId));
    };

    const handleRenameThread = (threadId) => {
        setThreadIdToRename(threadId);
        setIsRenameModalOpen(true);
    };


    const handleRenameSubmit = (newName) => {
        const token = localStorage.getItem("token");

        fetch(`http://localhost:8080/threads/${threadIdToRename}`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: newName.trim()
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to rename thread");
                }
                return response.json();
            })
            .then(updatedThread => {
                console.log("Thread renamed:", updatedThread);

                setThreads(prevThreads =>
                    prevThreads.map(thread =>
                        thread.id === updatedThread.id ? updatedThread : thread
                    )
                );

                setIsRenameModalOpen(false);
                setThreadIdToRename(null);
                setActiveOptionsThreadId(null);
            })
            .catch(error => {
                console.error("Error renaming thread:", error);
                setIsRenameModalOpen(false);
                setThreadIdToRename(null);
                setActiveOptionsThreadId(null);
            });
    };


    const handleDeleteThread = (threadId) => {
        setThreadIdToDelete(threadId);
        setIsDeleteModalOpen(true);
        setActiveOptionsThreadId(null);
    };



    const handleConfirmDelete = () => {
        const token = localStorage.getItem("token");

        fetch(`http://localhost:8080/threads/${threadIdToDelete}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to delete thread");
                }

                setThreads(prevThreads => {
                    const updatedThreads = prevThreads.filter(thread => thread.id !== threadIdToDelete);

                    // If active thread was deleted, reset activeThreadId
                    if (activeThreadId === threadIdToDelete) {
                        setActiveThreadId(updatedThreads.length > 0 ? updatedThreads[0].id : null);
                    }

                    return updatedThreads;
                });

                setIsDeleteModalOpen(false);
                setThreadIdToDelete(null);
            })
            .catch(error => {
                console.error("Error deleting thread:", error);
                setIsDeleteModalOpen(false);
                setThreadIdToDelete(null);
            });
    };


    const handleCreateNewThread = () => {
        setIsCreateModalOpen(true);
    };



    const handleCreateSubmit = (threadName) => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:8080/threads", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: threadName.trim()
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to create thread");
                }
                return response.json();
            })
            .then(data => {
                console.log("Thread created:", data);

                setThreads(prev => [...prev, data]);
                setActiveThreadId(data.id);
                setIsCreateModalOpen(false);
            })
            .catch(error => {
                console.error("Error creating thread:", error);
                setIsCreateModalOpen(false);
            });
    };




    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/bootcamp-ico.ico" />
            </Head>
            <div className="page-container">
                <header>
                    <div className="header-content">
                        <div className="header-brand">
                            <img src="./bootcamp-2025.03-logo.jpg" alt="Logo" className="header-logo"/>
                            <div className="header-title">Chat Application</div>
                        </div>
                        <div className="profile-dropdown">
                            <input type="checkbox" id="profile-toggle"/>
                            {/*<label htmlFor="profile-toggle" className="profile-icon">U</label>*/}
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
                <div className="center-container">
                    <aside className="threads-list">
                        <div className="threads-header">
                            <h2>Threads</h2>
                            <button className="new-thread-btn" onClick={handleCreateNewThread}>+</button>
                        </div>
                        <div className="threads">
                            {/*<div className="thread-item active">Thread 1</div>*/}
                            {/*<div className="thread-item">Thread 2</div>*/}
                            {/*<div className="thread-item">Thread 3</div>*/}

                            {/*{threads && threads.map((thread) => (*/}
                            {/*    <div key={thread.id} className="thread-item">{thread.threadName}</div>*/}
                            {/*))}*/}

                            { threads.map((thread) => (
                                    <div key={thread.id} className={`thread-item-wrapper`}>
                                        <div
                                            className={`thread-item ${thread.id === activeThreadId ? "active" : ""}`}
                                            onClick={() => setActiveThreadId(thread.id)}
                                        >
                                            {thread.name}
                                        </div>
                                        <div className="thread-actions">
                                            <button onClick={(e) => handleThreadOptionsClick(e, thread.id)}>⋮</button>
                                            {/* Εδώ θα βάλεις dropdown αν είναι open */}
                                            { activeOptionsThreadId === thread.id && (
                                                <div className="thread-options-dropdown">
                                                    <div onClick={() => handleRenameThread(thread.id)}>Rename Thread</div>
                                                    <div onClick={() => handleDeleteThread(thread.id)}>Delete Thread</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) }



                            {/*
                        if(threads != null and threads.length > 0) {
                            for (let i = 0; i < threads.length; i++) {
                                let thread = threads[i];
                                return <div className="thread-item">{thread.threadName}</div>
                            }
                        }
                        */}

                        </div>
                    </aside>
                    <main className="main-container">
                        <div className="chat-window">
                            {/* Model selector centered in chat */}
                            <div className="chat-model-select">
                                <select id="model-select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                                    <option value="llama3-8b-8192">LLaMA 3 - 8B</option>
                                    <option value="llama3-70b-8192">LLaMA 3 - 70B</option>
                                    <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                                </select>
                            </div>
                            <div className="messages" ref={messagesEndRef}>
                                {/*<div className="message bot">Hello! I’m ChatGPT—how can I help you today?</div>*/}
                                {/*<div className="message user">Can you show me how this chat layout works?</div>*/}

                                {messages.map((msg) => (
                                    <div key={msg.id} className={`message ${msg.isLLMGenerated ? "bot" : "user"}`}>
                                        {msg.content}
                                    </div>
                                ))}

                            </div>
                            <div className="input-container">
                                <input type="text" placeholder="Type a message…" value={newMessageContent}
                                       onChange={(e) => setNewMessageContent(e.target.value)}/>
                                <button onClick={handleSendMessage}>➤</button>
                            </div>
                        </div>
                    </main>

                    <SimpleModal
                        isOpen={isRenameModalOpen}
                        title="Rename Thread"
                        placeholder="Enter new thread name"
                        onClose={() => setIsRenameModalOpen(false)}
                        onSubmit={handleRenameSubmit}
                    />

                    <SimpleModal
                        isOpen={isCreateModalOpen}
                        title="Create New Thread"
                        placeholder="Enter thread name"
                        onClose={() => setIsCreateModalOpen(false)}
                        onSubmit={handleCreateSubmit}
                    />

                    <ConfirmModal
                        isOpen={isDeleteModalOpen}
                        title="Delete Thread"
                        message="Are you sure you want to delete this thread? This action cannot be undone."
                        onClose={() => {
                            setIsDeleteModalOpen(false);
                            setThreadIdToDelete(null);
                        }}
                        onConfirm={handleConfirmDelete}
                    />



                </div>
                <footer>© 2025 Chat App, Inc.</footer>
            </div>
        </>
    );

    function SimpleModal({ isOpen, title, placeholder, onClose, onSubmit }) {
        const [inputValue, setInputValue] = useState("");

        useEffect(() => {
            if (isOpen) setInputValue(""); // Reset on open
        }, [isOpen]);

        if (!isOpen) return null;

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <h3 style={{ marginBottom: "1rem" }}>{title}</h3>
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            border: "1px solid #ccc",
                            width: "100%",
                            marginBottom: "1rem"
                        }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            className="btn btn-confirm"
                            onClick={() => onSubmit(inputValue)}
                            disabled={!inputValue.trim()}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    function ConfirmModal({ isOpen, title, message, onClose, onConfirm }) {
        if (!isOpen) return null;

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <h3 style={{ marginBottom: "1rem" }}>{title}</h3>
                    <p style={{ marginBottom: "1.5rem" }}>{message}</p>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" onClick={onConfirm}>Delete</button>
                    </div>
                </div>
            </div>
        );
    }


}
