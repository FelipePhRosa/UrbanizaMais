import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function useSettingsData() {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : document.documentElement.classList.contains('dark');
  });
  const [edit, setEdit] = useState(false);
  const [nome, setNome] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.nameUser || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notifications, setNotifications] = useState({ email: true, push: false, sms: true });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    setNome(user?.fullName || '');
    setUsername(user?.nameUser || '');
    setEmail(user?.email || '');
    setTelefone(user?.telefone || '');
    setAvatarUrl(user?.avatar_url || '');
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('fullName', nome);
      formData.append('nameUser', username);
      formData.append('email', email);
      formData.append('telefone', telefone);
      if (avatarFile) formData.append('avatar', avatarFile);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/update`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData });
      const data = await response.json();
      if (!response.ok) { alert(`Erro: ${data.details || data.message}`); return; }
      alert('Alterações salvas com sucesso!');
      setUser((previous) => ({ ...previous, ...data.data }));
      setAvatarUrl(data.data.avatar_url);
      setPreview(null);
      setAvatarFile(null);
      setEdit(false);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar informações do usuário');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const toggleNotification = (key) => setNotifications((previous) => ({ ...previous, [key]: !previous[key] }));

  return { user, darkMode, setDarkMode, edit, setEdit, nome, setNome, username, setUsername, email, setEmail, telefone, setTelefone, avatarUrl, preview, notifications, handleFileChange, handleSave, handleLogout, toggleNotification };
}
