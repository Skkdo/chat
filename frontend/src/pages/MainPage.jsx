import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateRoomModal from '../components/CreateRoomModal';
import { fetchRooms, createRoom } from '../api/roomApi';
import { useJoinedRoomsStore } from '../store/useJoinedRoomsStore';
import { useUserStore } from '../store/useUserStore';
import { subscribePreview } from '../sockets/socket';
import './Main.css';

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { joinedRooms, joinRoom, updateRoom } = useJoinedRoomsStore();
  const { nickname } = useUserStore();
  const navigate = useNavigate();

  const subscriptionsRef = useRef({});

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 새로운 구독만 추가
    joinedRooms.forEach((room) => {
      if (!subscriptionsRef.current[room.id]) {
        const unsubscribe = subscribePreview(room.id, (preview) => {
          updateRoom(room.id, {
            chatId : preview.chatId,
            lastMessage: preview.lastMessage,
            timestamp: preview.timestamp,
            hasNewMessage: true,
          });
        });
        subscriptionsRef.current[room.id] = unsubscribe;
      }
    });

    // 더 이상 참여하지 않는 방 구독 해제
    Object.keys(subscriptionsRef.current).forEach((roomId) => {
      if (!joinedRooms.some((r) => r.id === roomId)) {
        subscriptionsRef.current[roomId]();
        delete subscriptionsRef.current[roomId];
      }
    });

    return () => {
      // 컴포넌트 언마운트 시 전체 해제
      Object.values(subscriptionsRef.current).forEach((unsubscribe) => unsubscribe());
      subscriptionsRef.current = {};
    };
  }, [joinedRooms, updateRoom]);

  const loadRooms = async () => {
    try {
      const allRooms = await fetchRooms();
      setRooms(allRooms);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = async (title) => {
    try {
      const data = await createRoom(title);
      const newRoom = {
        id: data.roomId,
        title: title,
        userCount: 0,
        lastMessage: '',
        timestamp: null,
        hasNewMessage: false,
        lastChatId: '',
      };
      setIsModalOpen(false);
      handleEnterRoom(newRoom);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnterRoom = (room) => {
    joinRoom({ ...room, hasNewMessage: false });
    onEnterRoom(room.id);
  };

  const onEnterRoom = (roomId) => {
    if(subscriptionsRef.current[roomId]) {
        subscriptionsRef.current[roomId]();
        delete subscriptionsRef.current[roomId];
     }
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="roomlist-container">
      <div className="roomlist-wrapper">
        {/* 헤더 */}
        <div className="roomlist-header-card">
          <div className="roomlist-header">
            <div>
              <h1 className="roomlist-title">채팅방 목록</h1>
              <p className="roomlist-subtitle">환영합니다, {nickname}님!</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="roomlist-create-btn"
            >
              + 새 방 만들기
            </button>
          </div>
        </div>

        {/* 참여 중인 채팅방 */}
        {joinedRooms.length > 0 && (
          <div className="roomlist-card">
            <h2 className="roomlist-section-title">
              <span className="roomlist-dot"></span>
              참여 중인 채팅방
            </h2>

            <div className="roomlist-grid">
              {joinedRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleEnterRoom(room)}
                  className="roomlist-myroom"
                >
                  <div className="roomlist-room-header">
                    <h3 className="roomlist-room-title">{room.title}</h3>

                    {room.hasNewMessage && (
                      <span className="roomlist-unread-dot"></span>
                    )}
                  </div>

                  <p className="roomlist-lastmessage">
                    {room.lastMessage ? room.lastMessage : '메시지가 없습니다'}
                  </p>

                  <span className="roomlist-timestamp">
                    {room.timestamp
                      ? new Date(room.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 전체 채팅방 */}
        <div className="roomlist-card">
          <h2 className="roomlist-section-title">모든 채팅방</h2>
          {rooms.length === 0 ? (
            <p className="roomlist-empty">아직 생성된 채팅방이 없습니다</p>
          ) : (
            <div className="roomlist-grid">
              {rooms
                  .filter(room => !joinedRooms.some(r => r.id === room.id))
                  .map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleEnterRoom(room)}
                  className="roomlist-otherroom"
                >
                  <div className="roomlist-room-header">
                    <h3 className="roomlist-room-title">{room.title}</h3>
                    <span className="roomlist-room-count">
                      {room.userCount}명
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRoom}
      />
    </div>
  );
}
