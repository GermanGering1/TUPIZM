import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register({ setUser }) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Получаем CSRF-токен
      const csrfRes = await fetch('/api/csrf');
      const { csrf_token } = await csrfRes.json();

      // 2. Отправляем данные регистрации
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf_token
        },
        body: JSON.stringify({ email, nickname, password }),
        credentials: 'include' // Важно для сохранения куки сессии Flask-Login
      });

      const data = await res.json();

      if (res.ok) {
        // Успешная регистрация: обновляем пользователя и переходим на главную
        setUser(data.user);
        navigate('/');
      } else {
        // Ошибка от бэкенда (например, email занят)
        setError(data.error || 'Ошибка при регистрации');
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
      <h2>Регистрация</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Email:</label><br />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Никнейм:</label><br />
          <input 
            type="text" 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)} 
            required 
            minLength={3}
            maxLength={50}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Пароль:</label><br />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            minLength={6}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      
      <p style={{ marginTop: '15px' }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}