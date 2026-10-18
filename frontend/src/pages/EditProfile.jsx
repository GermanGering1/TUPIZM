import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function EditProfile({ user, setUser }) {
  const [bio, setBio] = useState(user.bio || '');
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    const { csrf_token } = await fetch('/api/csrf').then(r => r.json());

    const res = await fetch('/api/profile/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token
      },
      body: JSON.stringify({ bio }),
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      navigate(`/profile/${user.nickname}`);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <h2>Редактирование профиля</h2>
      <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={500} rows={5} />
      <button type="submit">Сохранить</button>
    </form>
  );
}