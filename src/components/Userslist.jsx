import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "./Layout";
import { UsersRound, Search, Filter, AlertCircle } from "lucide-react";
import ModalUpdate from "./UpdateRole";
import toast from "react-hot-toast";
import { Check, X, Clock } from "lucide-react";

export default function UserList() {
  const { token, user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setFetchLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/userList`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
      }

      const data = await response.json();

      if (Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setUsers([]);
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
      setUsers([]);
    } finally {
      setFetchLoading(false);
    }
  };

 const roleMap = {
    "Administrador": 2,
    "Moderador": 3,
    "Suporte": 4,
    "Cidadão Comum": 5,
    "Banir": 6,
    "Prefeito": 7,
    "Vereador": 8,
    "Presidente": 9
  };
  
  const filterUsers = () => {
    let filtered = [...users];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nameUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toString().includes(searchTerm)
      );
    }

    // Filtro de cargo
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  function formatDate(isoString) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

 

  const roleOptions = [
    {
      name: "Administrador",
      styles: "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 focus:ring-blue-500",
      description: "Acesso total ao sistema"
    },
    {
      name: "Moderador",
      styles: "border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 focus:ring-purple-500",
      description: "Gerencia conteúdo e usuários"
    },
    {
      name: "Suporte",
      styles: "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300 focus:ring-green-500",
      description: "Atende solicitações"
    },
    {
      name: "Cidadão Comum",
      styles: "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 text-gray-700 dark:text-gray-300 focus:ring-gray-500",
      description: "Usuário padrão"
    },
    {
      name: "Prefeito",
      styles: "border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-300 focus:ring-orange-500",
      description: "Autoridade municipal"
    },
    {
      name: "Vereador",
      styles: "border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 focus:ring-yellow-500",
      description: "Representante legislativo municipal"
    },
    {
      name: "Presidente",
      styles: "border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-300 focus:ring-amber-500",
      description: "Autoridade máxima da plataforma ou do sistema"
    },
  ];


  const handleRoleUpdate = async (roleName) => {
    if (Number(selectedUser.role) === roleMap[roleName]) {
      toast("O usuário já possui este cargo!");
      return;
    }

    const roleNumber = roleMap[roleName];
    await handleAction(roleNumber, roleName);
  };

  const handleAction = async (newRole, roleName) => {
    setLoading(true);
    setError(null);

    try {
    
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateRole`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newRole: newRole
        })
        
      });
      console.log("Response: ", response);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar cargo');
      }


      const actionText = roleName === "Excluir conta" ? "banido" : `promovido a ${roleName}`;
      toast(`Usuário ${actionText} com sucesso!`);

      await fetchUsers();
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.message);
      toast(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setSelectedUser(null);
    setConfirmAction(null);
    setError(null);
  };

  const confirmBan = async () => {
    await handleAction(roleMap["Banir"], "Excluir conta");
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setError(null);
  };

  const getRoleName = (roleNumber) => {
    const roleNames = {
      "1": "Chefe Max",
      "2": "Administrador",
      "3": "Moderador",
      "4": "Suporte",
      "5": "Cidadão Comum",
      "6": "Banido",
      "7": "Prefeito",
      "8": "Vereador",
      "9": "Presidente"
    };
    return roleNames[roleNumber] || "Desconhecido";
  };

  const uniqueRoles = [...new Set(users.map(u => u.role))].filter(Boolean);
  const hasAdminAccess = ['1', '2'].includes(String(currentUser?.role));

  if (!hasAdminAccess) {
    return <Layout><div className="grid min-h-[70vh] place-items-center p-6"><div className="text-center"><UsersRound className="mx-auto text-[#94A3B8]"/><p className="mt-3 font-semibold text-[#111827]">Acesso restrito</p><p className="mt-1 text-sm text-[#64748B]">Apenas administradores podem gerenciar usuários.</p></div></div></Layout>;
  }

  if (fetchLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando usuários...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="font-semibold text-3xl dark:text-blue-500">
          Usuários Cadastrados
        </h1>
        <div className="w-56 h-1 lg:w-[33vh] rounded-xl bg-blue-500 my-4 dark:bg-gray-200" />

        {/* Filtros e Busca */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white appearance-none cursor-pointer"
            >
              <option value="all">Todos os cargos</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{getRoleName(role)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mensagem de erro global */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-600 dark:text-red-400 w-5 h-5" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Contador de resultados */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredUsers.length} de {users.length} usuários
        </div>

        <div className="mb-4 hidden overflow-hidden rounded-xl border border-[#E2E8F0] bg-white md:block">
          <table className="w-full text-left text-sm"><thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#64748B]"><tr><th className="px-4 py-3">Usuário</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3">Papel</th><th className="px-4 py-3">Relatos</th><th className="px-4 py-3">Cadastro</th><th className="px-4 py-3"/></tr></thead><tbody className="divide-y divide-[#E2E8F0]">{filteredUsers.map((item) => <tr key={`table-${item.id}`} className="hover:bg-[#F8FAFC]"><td className="px-4 py-3"><div className="font-semibold text-[#111827]">{item.nameUser || 'Sem nome'}</div><div className="text-xs text-[#64748B]">#{item.id}</div></td><td className="px-4 py-3 text-[#475569]">{item.email || '—'}</td><td className="px-4 py-3"><span className="rounded-full bg-[#EDE9FE] px-2 py-1 text-[11px] font-semibold text-[#6C2BD9]">{getRoleName(item.role)}</span></td><td className="px-4 py-3 text-[#475569]">{item.totalReports ?? 0}</td><td className="px-4 py-3 text-xs text-[#64748B]">{formatDate(item.created_at)}</td><td className="px-4 py-3 text-right"><button onClick={() => openModal(item)} className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#334155] hover:border-[#6C2BD9] hover:text-[#6C2BD9]">Gerenciar</button></td></tr>)}</tbody></table>
        </div>

        {/* Grid de usuários */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersRound className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredUsers.map((user) => (
              <div key={user.id} className="relative flex flex-col bg-white gap-2 p-4 rounded-xl shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-400 hover:shadow-lg transition-shadow duration-200">
                <UsersRound className="mb-2 dark:text-white" />

                <p className="font-semibold text-md dark:text-gray-200">
                  ID: <span className="font-normal">{user.id}</span>
                </p>
                <p className="font-semibold text-md dark:text-gray-200">
                  Nome: <span className="font-normal">{user.nameUser}</span>
                </p>
                <p className="font-semibold text-md dark:text-gray-200 truncate">
                  Email: <span className="font-normal">{user.email}</span>
                </p>
                <p className="font-semibold text-md dark:text-gray-200">
                  Criado: <span className="font-normal text-sm">{formatDate(user.created_at)}</span>
                </p>

                <div className="my-1 flex">
                  <p className="font-semibold text-md dark:text-gray-200 px">Cargo:</p>
                  <span className={`inline-block mx-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === "1" ? "bg-amber-400 text-yellow-700":                                                             // Owner - amarelo
                      user.role === "2" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :                     // Administrador - azul
                        user.role === "3" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :           // Moderador - roxo
                          user.role === "4" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :             // Suporte - verde
                            user.role === "5" ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200" :               // Cidadão Comum - cinza
                              user.role === "6" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :                 // Banido - vermelho
                                user.role === "7" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" :   // Prefeito - laranja
                                  user.role === "8" ? "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200" :         // Vereador - limão
                                    user.role === "9" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" :   // Presidente - dourado
                                      "bg-black text-gray-800 dark:bg-gray-800 dark:text-gray-200"                              // Desconhecido (alguém sem role, ou provavelmente role não implementada no bd)
                    }`}>
                    {getRoleName(user.role)}
                  </span>
                </div>


                {/* Estatísticas de denúncias */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <p className="font-semibold text-sm dark:text-gray-200 mb-1">
                    Denúncias: {user.totalReports}
                  </p>
                  <div className="flex gap-3 text-sm font-medium">
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Check size={16} /> {user.aprovados}
                    </span>
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <X size={16} /> {user.rejeitados}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <Clock size={16} /> {user.pendentes}
                    </span>
                  </div>
                </div>
                <button
                  className="mt-4 w-full h-10 rounded-md cursor-pointer font-semibold font-inter text-white dark:text-gray-200
                  shadow-lg shadow-black/22 dark:shadow-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  bg-blue-500 hover:bg-blue-600 dark:bg-gradient-to-br dark:from-indigo-100/40 dark:to-gray-900 dark:hover:bg-blue-300 hover:from-gray-400 hover:to-gray-500"
                  onClick={() => openModal(user)}>
                  Gerenciar Cargo
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal de atualização de cargo */}
        {selectedUser && (
          <ModalUpdate onClose={onClose}>
            <div className="max-h-[80vh] overflow-y-auto font-[Inter]">
              <h2 className="text-xl mb-2 font-[Inter] font-semibold dark:text-white">
                Gerenciar Cargo
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedUser.nameUser} - Cargo atual: <span className="font-semibold">{getRoleName(selectedUser.role)}</span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="text-red-600 dark:text-red-400 w-5 h-5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-3 mb-6 mx-2 font-[Inter]">
                {roleOptions.map(role => (
                  <button
                    key={role.name}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200
                      ${selectedUser.role === role.name
                        ? 'border-gray-400 bg-gray-50 dark:bg-gray-700 cursor-not-allowed opacity-60'
                        : `border-${role.styles}-200 dark:border-${role.styles}-800 hover:border-${role.styles}-400 dark:w:border-${role.styles}-600 hover:bg-${role.styles}-50 dark:hover:bg-${role.styles}-900/20 cursor-pointer`
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                      focus:outline-none focus:ring-2 focus:ring-${role.styles}-500`}
                    onClick={() => handleRoleUpdate(role.name)}
                    disabled={loading || selectedUser.role === role.name}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold text-${role.styles}-700 dark:text-${role.styles}-300`}>
                          {role.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {role.description}
                        </p>
                      </div>
                      {getRoleName(selectedUser.role) === role.name && (
                        <span className="text-xs font-bold bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded">Atual</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t-4 border-gray-400 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Ação permanente:
                </p>
                <button
                  className="w-full font-semibold px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md duration-200 shadow-red-600/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setConfirmAction("Banir Conta")}
                  disabled={loading}
                >
                  ⚠️ Excluir Conta
                </button>
              </div>

              {/* Modal de confirmação de banimento */}
              {confirmAction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Confirmar Exclusão
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Você está prestes a excluir:
                      </p>

                      <p className="font-semibold text-red-600 dark:text-red-400 mb-4">
                        {selectedUser.nameUser}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Esta ação é <strong>permanente</strong> e não pode ser desfeita pelo sistema.
                      </p>

                      <div className="flex gap-3">
                        <button
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                          disabled={loading}
                          onClick={confirmBan}
                        >
                          {loading ? "Banindo..." : "Sim, Excluir"}
                        </button>
                        <button
                          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 font-semibold transition-colors"
                          disabled={loading}
                          onClick={() => setConfirmAction(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModalUpdate>
        )}
      </div>
    </Layout>
  );
}
