import React, { useEffect, useRef, useState } from "react";
import "./Chatbox.css";
import axios from "axios";

const Chatbox = () => {
  const [conversations, setConversations] = useState([]);

  const [selectedConversation, setSelectedConversation] = useState({});
  const [newMessage, setNewMessage] = useState("");

  const [listMessage, setListMessage] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const refMessage = useRef();

  const handeRefMessage = () => {
    if (refMessage) {
      refMessage.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async () => {
    try {
      if (newMessage.trim()) {
        const indexConversation = conversations.findIndex(
          (conversation) => conversation._id === selectedConversation?._id
        );
        const listConversation = [...conversations];
        listConversation[indexConversation].text = newMessage;
        setConversations(listConversation);
        const newMessageData = {
          thirdParty: "llama",
          createdAt: new Date(),
          text: newMessage,
          type: "user",
        };
        const listNewMessage = [...listMessage, newMessageData];
        setListMessage(listNewMessage);
        setNewMessage("");
        setDisabled(true);
        handeRefMessage();

        const result = await axios.post("api/chatbox/chat", {
          conversationId: selectedConversation?._id,
          thirdParty: "llama",
          text: newMessage,
          type: "user",
        });

        if (result.status === 200) {
          listConversation[indexConversation].text = result.data.text;
          setConversations(listConversation);
          setListMessage([...listNewMessage, result.data]);
          setDisabled(false);
          handeRefMessage();
        }
      }
    } catch (error) {
      console.log(error);
      setDisabled(false);
    }
  };

  const initialData = async () => {
    try {
      const result = await axios.post("api/chatbox/get_conversations", {
        thirdParty: "llama",
      });
      setConversations(result.data.list);
      console.log(result);
    } catch (error) {}
  };

  const getListMessage = async (conversationId) => {
    try {
      const result = await axios.post("api/chatbox/get_messages", {
        conversationId,
        thirdParty: "llama",
      });

      setListMessage(result.data.list);
    } catch (error) {}
  };

  useEffect(() => {
    getListMessage(selectedConversation?._id);

    handeRefMessage();
  }, [selectedConversation?._id]);

  useEffect(() => {
    initialData();
  }, []);

  useEffect(() => {
    handeRefMessage();
  }, [listMessage.length]);

  return (
    <div className="chatbox-container">
      <div className="conversation-list">
        {conversations.map((conversation) => (
          <div
            key={conversation._id}
            className={`conversation-item ${conversation._id === selectedConversation?._id ? "active" : ""}`}
            onClick={() => setSelectedConversation(conversation)}
          >
            <img src={"https://cdn-icons-png.flaticon.com/512/8637/8637111.png"} alt={conversation.thirdParty} />
            <div>
              <p>{conversation.thirdParty}</p>
              <p>{conversation.text?.slice(0, 15) + "..."}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chatbox">
        <div className="chatbox-messages">
          {listMessage.map((message, index) => (
            <div key={index} className="chatbox-message">
              {message.text}
            </div>
          ))}
          <div ref={refMessage} />
        </div>
        <div className="chatbox-input-container" style={{
            display: selectedConversation?._id ? "flex" : "none",
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="chatbox-input"
            placeholder="Type your message..."
          />
          {disabled ? (
            <button disabled className="chatbox-send-button">
              Sending...
            </button>
          ) : (
            <button onClick={handleSendMessage} className="chatbox-send-button">
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
