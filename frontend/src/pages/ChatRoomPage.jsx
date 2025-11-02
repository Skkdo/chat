import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useJoinedRoomsStore } from '../store/useJoinedRoomsStore';
import { subscribeChat, sendChatMessage } from '../sockets/socket';
import { getHistory } from '../api/chatApi';
import './ChatRoom.css';

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const { nickname, userId } = useUserStore();
  const { joinedRooms, leaveRoom, updateRoom } = useJoinedRoomsStore();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState(() => {
        const found = joinedRooms.find((r) => r.id === roomId);
        return found ? { ...found } : { title : '', userCount : 1};
      });
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const lastChatIdRef = useRef(null);

  const fetchHistory = useCallback(async () => {
      if(!roomId) return;
      try{
          const currentRoom = joinedRooms.find((r) => r.id === roomId);
          const lastChatId = currentRoom ?.lastChatId || null;
          const history = await getHistory(roomId, lastChatId);
          setMessages(history);

          if (history.length > 0) {
            lastChatIdRef.current = history[history.length - 1].chatId;
          }
      } catch(err) {
          console.error(err);
      }
  }, [roomId, joinedRooms]);

  const handleSystemMessage = useCallback((msg) => {
    setRoomInfo((prev) => {
      if (!prev) return prev;
      let updatedCount = prev.userCount;

      if (msg.message?.includes("입장") && msg.sender !== userId) {
        updatedCount += 1;
      } else if (msg.message?.includes("퇴장") && msg.sender !== userId) {
        updatedCount -= 1;
      }

      setMessages((prev) => [...prev, msg]);

      return {
        ...prev,
        userCount: updatedCount
      };
    });
  }, []);

  useEffect(() => {
    if (!roomId || !nickname || !userId) return;

    const room = joinedRooms.find(r => r.id === roomId);

    if(room.firstEnter) {
      sendChatMessage({
        roomId,
        senderId: 'system',
        sender: userId,
        message: `${nickname}님이 입장하셨습니다.`,
      });
      updateRoom(roomId, { firstEnter: false });
    }

    setIsConnected(true);

    const unsubscribe = subscribeChat(roomId, (msg) => {
      console.log(msg);
      if(msg.senderId === 'system') {
          handleSystemMessage(msg);
          return;
      }

      setMessages((prev) => [...prev, msg]);
      lastChatIdRef.current = msg.chatId;
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null
      }
      setIsConnected(false);
    };
  }, [roomId, nickname]);

  useEffect(() => {
      fetchHistory();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendChatMessage({
      roomId: roomId,
      senderId: userId,
      sender: nickname,
      message: inputMessage,
    });

    setInputMessage('');
  };

  const cleanupAndSaveLastChat = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (messages.length > 0) {
      const lastChat = messages[messages.length - 1];
      updateRoom(roomId, {
        lastMessage: lastChat.message,
        lastChatId: lastChat.chatId,
        timestamp: lastChat.timestamp,
        hasNewMessage: false,
      });
    } else if (lastChatIdRef.current) {
      updateRoom(roomId, {
        chatId : lastChatIdRef.current,
        lastChatId: lastChatIdRef.current,
      });
    }
  };

  const handleLeaveRoom = () => {
    cleanupAndSaveLastChat();
    sendChatMessage({
      roomId,
      senderId : 'system',
      sender: userId,
      message: `${nickname}님이 퇴장하셨습니다.`,
    });
    leaveRoom(roomId);
    navigate('/main');
  };

  const onBack = () => {
    cleanupAndSaveLastChat();
    navigate('/main');
  };

  return (
    <div className="pageWrapper">
      <div className="chatContainer">
        <div className="header">
          <div>
            <h2 className="roomTitle">{roomInfo?.title || '채팅방'}</h2>
            <p className="statusText">
              {isConnected ? '🟢 연결됨' : '🔴 연결 중...'}
              {` • ${roomInfo?.userCount}명 참여 중`}
            </p>
          </div>
          <div className="buttonGroup">
            <button onClick={onBack} className="backButton">← 뒤로</button>
            <button onClick={handleLeaveRoom} className="leaveButton">나가기</button>
          </div>
        </div>

        <div className="messageArea">
          {messages.length === 0 ? (
            <p className="noMessage">메시지가 없습니다</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`messageRow ${
                    msg.senderId === 'system'
                    ? 'systemMessage'
                    : msg.senderId === userId
                    ? 'myMessage'
                    : 'otherMessage'
                    }`}
              >
              <div className={`messageBubble ${
                  msg.senderId === 'system'
                  ? 'systemBubble'
                  : msg.senderId === userId
                  ? 'myBubble'
                  : 'otherBubble'
                  }`}
              >
              {msg.senderId !== userId && msg.senderId !== 'system' && (
                <p className="nickname">{msg.sender}</p>
              )}
              <p className="messageText">{msg.message}</p>
              {msg.senderId !== 'system' && (
                <p className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                   hour: '2-digit',
                   minute: '2-digit',
                  })}
                </p>
              )}
              </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="inputArea">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="inputBox"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="sendButton"
            disabled={!isConnected || !inputMessage.trim()}
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
