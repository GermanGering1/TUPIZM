import { useEffect, useState } from "react";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/posts?offset=${offset}`);
    const data = await r.json();
    setPosts(p => [...p, ...data]);
    setOffset(o => o + 20);
    if (data.length < 20) setDone(true);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Лента</h2>
      {posts.map(p => (
        <div key={p.id} style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
          <a href={`/profile/${p.author}`}><b>{p.author}</b></a>
          <small> {new Date(p.created_at).toLocaleString()}</small>
          <p>{p.content}</p>
        </div>
      ))}
      {!done && (
        <button onClick={load} disabled={loading}>
          {loading ? "..." : "Показать больше"}
        </button>
      )}
    </div>
  );
}