import React, { useState } from 'react';
import './CreateRoomModal.css';

export default function CreateRoomModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim());
      setTitle('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title">새 채팅방 만들기</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="채팅방 제목"
            className="modal-input"
            maxLength={50}
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-btn-cancel">
              취소
            </button>
            <button type="submit" className="modal-btn-create">
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
