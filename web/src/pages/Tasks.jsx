import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Tasks = () => {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔄 Charge les tâches au montage
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      setError('Impossible de charger les tâches');
    }
  };

  // ➕ Créer
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/tasks', { title, description });
      setTasks((prev) => [data, ...prev]); // ajoute en haut
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle completed
  const handleToggle = async (task) => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === data._id ? data : t))
      );
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  // 🗑️ Supprimer
  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <div className="tasks-container">
      <header className="tasks-header">
        <div>
          <h1>Mes tâches</h1>
          <p className="user-info">Connecté en tant que {user?.name}</p>
        </div>
        <button className="btn-logout" onClick={logout}>
          Déconnexion
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      {/* ➕ Formulaire de création */}
      <form className="task-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Titre de la tâche..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'Ajouter'}
        </button>
      </form>

      {/* 📋 Liste */}
      <ul className="task-list">
        {tasks.length === 0 && (
          <li className="empty">Aucune tâche pour l'instant. Crée-en une !</li>
        )}
        {tasks.map((task) => (
          <li
            key={task._id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
          >
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
              />
              <div>
                <strong>{task.title}</strong>
                {task.description && <p>{task.description}</p>}
              </div>
            </label>
            <button
              className="btn-delete"
              onClick={() => handleDelete(task._id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;