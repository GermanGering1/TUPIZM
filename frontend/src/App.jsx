import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Feed from './Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверяем, залогинен ли пользователь при загрузке
  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Лента</Link>
        {user ? (
          <>
            <Link to={`/profile/${user.nickname}`} style={{ marginRight: '10px' }}>
              Мой профиль ({user.nickname})
            </Link>
            <a href="/api/logout" onClick={() => setUser(null)}>Выйти</a>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '10px' }}>Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </nav>

      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} />
          <Route path="/profile/:nickname" element={<Profile currentUser={user} />} />
          <Route path="/profile/edit" element={user ? <EditProfile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;