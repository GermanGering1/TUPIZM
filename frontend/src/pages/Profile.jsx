import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css';

export default function Profile({ currentUser }) {
  const { nickname } = useParams();
  const [data, setData] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  // Функция загрузки профиля и постов
  const loadProfile = () => {
    fetch(`/api/profile/${nickname}`)
      .then((r) => r.json())
      .then(setData);
  };

  useEffect(() => {
    loadProfile();
  }, [nickname]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosting(true);

    try {
      // 1. Получаем CSRF-токен
      const { csrf_token } = await fetch('/api/csrf').then((r) => r.json());

      // 2. Отправляем пост на сервер
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf_token,
        },
        body: JSON.stringify({ content: newPost }),
        credentials: 'include', // Важно для сессии Flask
      });

      if (res.ok) {
        setNewPost(''); // Очищаем поле
        loadProfile();  // Перезагружаем профиль, чтобы увидеть новый пост
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Ошибка при создании поста');
      }
    } catch (err) {
      alert('Ошибка сети');
    } finally {
      setPosting(false);
    }
  };

  if (!data) return <div>Загрузка...</div>;

  
  const isMyProfile = currentUser && currentUser.nickname === nickname;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <h2>{data.user.nickname}</h2>
      <p>{data.user.bio || 'Без описания'}</p>

      {isMyProfile && (
        <Link to="/profile/edit" style={{ display: 'inline-block', marginBottom: '20px' }}>
          Редактировать профиль
        </Link>
      )}

      <hr />

      {/* Форма создания поста видна только владельцу профиля */}
      {isMyProfile && (
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3>Написать пост</h3>
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows="3"
              maxLength={2000}
              placeholder="Что нового?"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginBottom: '10px' }}
            />
            <button type="submit" disabled={posting} style={{ padding: '8px 16px' }}>
              {posting ? 'Публикация...' : 'Опубликовать'}
            </button>
          </form>
        </div>
      )}

      <h3>Посты</h3>
      {data.posts.length === 0 && <p>Постов пока нет.</p>}
      
      {data.posts.map((p) => (
        <div key={p.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
          <small style={{ color: '#888' }}>
            {new Date(p.created_at).toLocaleString()}
          </small>
          <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{p.content}</p>
        </div>
      ))}
    </div>
  );
}