import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import './NicknamePage.css';

export default function NicknamePage() {
  const { setUser } = useUserStore();
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      setUser(nickname.trim());
    }
    navigate('/main');
  };

  return (
    <div className="nickname-container">
      <div className="nickname-box">
        <h1 className="nickname-title">채팅방에 오신 것을 환영합니다</h1>
        <p className="nickname-subtitle">닉네임을 입력해주세요</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            maxLength={20}
            className="nickname-input"
          />
          <button type="submit" className="nickname-button">
            시작하기
          </button>
        </form>
      </div>
    </div>
  );
}
