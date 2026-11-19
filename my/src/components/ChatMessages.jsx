import { useState } from "react";
import { 
  Send, 
  Search, 
  MapPin, 
  Tag, 
  CheckCheck, 
  Smile, 
  Paperclip, 
  MoreVertical,
  ShieldCheck,
  Clock
} from "lucide-react";

export default function ChatMessages({ currentUser, initialProduct }) {
  const [conversations, setConversations] = useState([
    {
      id: "1",
      peerName: "Rahul Sharma",
      peerUSN: "1AT24CS089",
      peerDept: "CSE, 3rd Sem",
      avatarBg: "#4f46e5",
      productTitle: "Casio FX-991CW Calculator",
      productPrice: 850,
      productImg: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
      lastMessage: "Sounds good! I'll be near the library at 3 PM.",
      time: "12:45 PM",
      unread: false,
      online: true,
      messages: [
        { id: 1, sender: "me", text: "Hey Rahul! Is the Casio calculator still available for campus handover?", time: "12:30 PM" },
        { id: 2, sender: "them", text: "Yes, it is! Comes with the original cover and fresh batteries.", time: "12:35 PM" },
        { id: 3, sender: "me", text: "Great, can we meet around 3 PM today?", time: "12:40 PM" },
        { id: 4, sender: "them", text: "Sounds good! I'll be near the library at 3 PM.", time: "12:45 PM" },
      ],
    },
    {
      id: "2",
      peerName: "Sneha Patil",
      peerUSN: "1AT24IS042",
      peerDept: "ISE, 5th Sem",
      avatarBg: "#10b981",
      productTitle: "Campus Waterproof Backpack",
      productPrice: 650,
      productImg: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      lastMessage: "Is ₹600 okay for you? I can collect it today.",
      time: "Yesterday",
      unread: true,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "Hello! Is your college backpack still for sale?", time: "Yesterday" },
        { id: 2, sender: "me", text: "Hi Sneha, yes! Water-resistant with padded laptop compartment.", time: "Yesterday" },
        { id: 3, sender: "them", text: "Is ₹600 okay for you? I can collect it today.", time: "Yesterday" },
      ],
    },
    {
      id: "3",
      peerName: "Vikram Mehta",
      peerUSN: "1AT24ME015",
      peerDept: "Mechanical, 1st Sem",
      avatarBg: "#f59e0b",
      productTitle: "Engineering Drawing & Drafter Kit",
      productPrice: 450,
      productImg: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
      lastMessage: "Thank you! The drawing kit worked perfectly.",
      time: "Nov 17",
      unread: false,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "Hi, does this kit include the sheet clamps and mini drafter?", time: "Nov 17" },
        { id: 2, sender: "me", text: "Yes! Everything required for 1st year engineering drawing.", time: "Nov 17" },
        { id: 3, sender: "them", text: "Thank you! The drawing kit worked perfectly.", time: "Nov 17" },
      ],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState("1");
  const [inputText, setInputText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (textToSend) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: content,
            time: "Just now",
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText("");

    // Simulate smart quick reply from peer after 1.2 seconds
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            const peerReply = {
              id: Date.now() + 1,
              sender: "them",
              text: "Got it! See you on campus 👍",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            return {
              ...c,
              lastMessage: peerReply.text,
              time: "Just now",
              messages: [...c.messages, peerReply],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  const quickQuestions = [
    "Is this item still available?",
    "Can we meet at the campus library?",
    "Is the price negotiable?",
    "Can you share more pictures?",
  ];

  const filteredConvs = conversations.filter((c) =>
    c.peerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.productTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="campus-chat-container">
      {/* LEFT: Conversation Threads List */}
      <div className="chat-sidebar-panel">
        <div className="chat-sidebar-header">
          <div className="chat-header-title">
            <h3>Messages</h3>
            <span className="chat-count-tag">{conversations.length}</span>
          </div>

          <div className="chat-search-wrap">
            <Search size={16} className="chat-search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="chat-search-input"
            />
          </div>
        </div>

        <div className="chat-conversations-list">
          {filteredConvs.map((conv) => {
            const isSelected = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                className={`conversation-thread-item ${isSelected ? "selected" : ""} ${conv.unread ? "unread" : ""}`}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setConversations((prev) =>
                    prev.map((c) => (c.id === conv.id ? { ...c, unread: false } : c))
                  );
                }}
              >
                <div className="thread-avatar-wrap">
                  <div className="thread-avatar" style={{ backgroundColor: conv.avatarBg }}>
                    {conv.peerName.charAt(0)}
                  </div>
                  {conv.online && <span className="thread-online-dot" />}
                </div>

                <div className="thread-info">
                  <div className="thread-top-line">
                    <span className="thread-peer-name">{conv.peerName}</span>
                    <span className="thread-time">{conv.time}</span>
                  </div>

                  <div className="thread-product-tag">
                    <Tag size={11} />
                    <span>{conv.productTitle}</span>
                  </div>

                  <p className="thread-last-msg">{conv.lastMessage}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Active Chat Room */}
      <div className="chat-main-room">
        {activeConv ? (
          <>
            {/* Room Header */}
            <div className="chat-room-header">
              <div className="room-peer-profile">
                <div className="room-avatar" style={{ backgroundColor: activeConv.avatarBg }}>
                  {activeConv.peerName.charAt(0)}
                </div>
                <div>
                  <div className="room-peer-name-row">
                    <h4>{activeConv.peerName}</h4>
                    <span className="verified-pill">
                      <ShieldCheck size={13} /> Verified
                    </span>
                  </div>
                  <span className="room-peer-meta">{activeConv.peerDept} · {activeConv.peerUSN}</span>
                </div>
              </div>

              {/* Related Item Pill */}
              <div className="room-related-item">
                <img src={activeConv.productImg} alt={activeConv.productTitle} />
                <div>
                  <span className="related-title">{activeConv.productTitle}</span>
                  <span className="related-price">₹{activeConv.productPrice}</span>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="chat-messages-body">
              <div className="chat-safe-notice">
                <MapPin size={14} />
                <span>Always meet in public campus zones like the library, cafeteria, or store counter.</span>
              </div>

              {activeConv.messages.map((m) => {
                const isMe = m.sender === "me";
                return (
                  <div key={m.id} className={`message-bubble-row ${isMe ? "outgoing" : "incoming"}`}>
                    <div className="bubble-content">
                      <p>{m.text}</p>
                      <div className="bubble-meta">
                        <span>{m.time}</span>
                        {isMe && <CheckCheck size={13} className="read-icon" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Suggested Questions */}
            <div className="chat-quick-suggestions">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-question-pill"
                  onClick={() => handleSendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="chat-input-bar"
            >
              <input
                type="text"
                placeholder="Type your message to peer..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="chat-text-input"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="chat-send-btn"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty-state">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
