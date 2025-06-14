import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import {useRouter} from "next/router";


export default function ChatPage() {


    const [isAuthorized, setIsAuthorized] = useState(true);
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
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);



    const router = useRouter();

    useEffect(() => {
        console.log("ChatPage mounted");

        const token = localStorage.getItem("token");

        if (!token) {
            console.warn("No token - redirecting to login");
            setIsAuthorized(false);
            router.push("/login");
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
                if (response.status === 401) {
                    console.warn("Unauthorized - redirecting to login");
                    localStorage.removeItem("token");
                    setIsAuthorized(false);
                    router.push("/login");
                    return Promise.reject("Unauthorized");
                }
                if (!response.ok) {
                    throw new Error("Failed to fetch threads");
                }

                return response.json();
            })
            .then(data => {
                setThreads(data);
                if (data.length > 0) {
                    setActiveThreadId(data[0].id);
                }
            })
            .catch(error => {
                if (error === "Unauthorized") {
                    return;
                }
                console.error("Error fetching threads:", error);
            });

    }, [router]);

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


    const actuallySendMessage = (threadIdToUse) => {
        const token = localStorage.getItem("token");

        if (!newMessageContent.trim() && !selectedFile) return;

        if (selectedFile) {
            const formData = new FormData();
            formData.append("data", JSON.stringify({
                threadId: threadIdToUse,
                content: newMessageContent,
                model: selectedModel
            }));
            formData.append("file", selectedFile);

            fetch("http://localhost:8080/messages/upload", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to send message with file");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("LLM response (with file):", data);

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Math.random(),
                            content: newMessageContent,
                            isLLMGenerated: false,
                            fileUrl: URL.createObjectURL(selectedFile),
                            fileName: selectedFile.name
                        },
                        data
                    ]);

                    setNewMessageContent("");
                    setSelectedFile(null);
                })
                .catch(error => {
                    console.error("Error sending message with file:", error);
                });
        } else {
            fetch("http://localhost:8080/messages", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    threadId: threadIdToUse,
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

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Math.random(),
                            content: newMessageContent,
                            isLLMGenerated: false
                        },
                        data
                    ]);

                    setNewMessageContent("");
                })
                .catch(error => {
                    console.error("Error sending message:", error);
                });
        }
    };



    const handleSendMessage = () => {
        const token = localStorage.getItem("token");

        if (!newMessageContent.trim() && !selectedFile) return;

        if (activeThreadId == null) {
            fetch("http://localhost:8080/threads", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: "New Chat"
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to create thread");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Auto-created thread:", data);

                    setThreads(prev => [...prev, data]);
                    setActiveThreadId(data.id);

                    actuallySendMessage(data.id);
                })
                .catch(error => {
                    console.error("Error creating thread:", error);
                });

            return;
        }

        actuallySendMessage(activeThreadId);
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messages]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    const handleThreadOptionsClick = (e, threadId) => {
        e.stopPropagation();
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

    function formatMessage(content) {
        let formatted = content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")

            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

            .replace(/`([^`\n]+)`/g, '<code>$1</code>')

            .replace(/\$(.+?)\$/g, '<span class="math">$1</span>')

            .replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
            )

            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<strong>$1</strong>")

            .replace(/_(.*?)_/g, "<em>$1</em>")

            .replace(
                /(?:^|\n)(\* .+(?:\n\* .+)*)/g,
                (match, items) => {
                    const listItems = items
                        .split('\n')
                        .map(line => line.replace(/^\* /, '').trim())
                        .map(item => `<li>${item}</li>`)
                        .join('');
                    return `<ul>${listItems}</ul>`;
                }
            )

            .replace(/\n/g, "<br/>");

        return formatted;
    }






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
                                            { activeOptionsThreadId === thread.id && (
                                                <div className="thread-options-dropdown">
                                                    <div onClick={() => handleRenameThread(thread.id)}>Rename Thread</div>
                                                    <div onClick={() => handleDeleteThread(thread.id)}>Delete Thread</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) }

                        </div>
                    </aside>
                    <main className="main-container">
                        <div className="chat-window">
                            <div className="chat-model-select">
                                <select id="model-select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                                    <option value="llama3-70b-8192">LLaMA 3 - 70B</option>
                                    <option value="llama3-8b-8192">LLaMA 3 - 8B</option>
                                    <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                                </select>
                            </div>
                            <div className="messages" ref={messagesEndRef}>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`message ${msg.isLLMGenerated ? "bot" : "user"}`}>
                                        <div
                                            style={{ whiteSpace: "pre-wrap" }}
                                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                        ></div>
                                        {msg.fileUrl && (
                                            <div style={{
                                                marginTop: "0.5rem",
                                                fontSize: "0.9rem",
                                                color: "#374151",
                                                backgroundColor: "#f9fafb",
                                                padding: "0.5rem 1rem",
                                                borderRadius: "8px",
                                                border: "1px solid #d1d5db",
                                                display: "flex",
                                                alignItems: "center"
                                            }}>
                                                📎&nbsp;
                                                <a
                                                    href={msg.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: "underline", color: "#0D9488" }}
                                                >
                                                    {msg.fileName || "File"}
                                                </a>
                                            </div>
                                        )}

                                    </div>
                                ))}


                            </div>
                            <div className="input-container" style={{ position: "relative" }}>
                                {selectedFile && (
                                    <div style={{
                                        marginBottom: "0.5rem",
                                        fontSize: "0.9rem",
                                        color: "#374151",
                                        backgroundColor: "#f9fafb",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "8px",
                                        border: "1px solid #d1d5db",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}>
                                        <span>📄 Selected file: {selectedFile.name}</span>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                color: "#dc2626",
                                                fontSize: "1rem",
                                                cursor: "pointer",
                                                fontWeight: "bold"
                                            }}
                                            title="Remove file"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}


                                <input
                                    type="text"
                                    placeholder="Type a message…"
                                    value={newMessageContent}
                                    onChange={(e) => setNewMessageContent(e.target.value)}
                                    style={{
                                        width: "100%",
                                        paddingRight: "90px",
                                        paddingLeft: "0.75rem",
                                        paddingTop: "0.75rem",
                                        paddingBottom: "0.75rem",
                                        borderRadius: "9999px",
                                        border: "1px solid #d1d5db",
                                        fontSize: "1rem"
                                    }}
                                />

                                <div style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem"
                                }}>
                                    <label
                                        title="Choose file"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            backgroundColor: "#f3f4f6",
                                            cursor: "pointer",
                                            fontSize: "1.2rem",
                                            border: "1px solid #d1d5db",
                                            transition: "background-color 0.2s ease"
                                        }}
                                    >
                                        📎
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    fileInputRef.current.value = null;
                                                }
                                            }}
                                            accept=".pdf,.txt"
                                        />
                                    </label>

                                    <button
                                        title="Send message"
                                        onClick={handleSendMessage}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            color: "#fff",
                                            fontSize: "1.2rem",
                                            border: "none",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s ease"
                                        }}
                                    >
                                        ➤
                                    </button>
                                </div>
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
            if (isOpen) setInputValue("");
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
