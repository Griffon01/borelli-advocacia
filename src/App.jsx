import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Briefcase, MapPin, MessageSquare, Plus, ChevronLeft, ChevronRight, Bell, LogOut, Search, CheckCircle, AlertCircle, User, Building2, Scale, GraduationCap, TrendingUp, Megaphone, Trash2, X, Check, FileText, Loader2, RefreshCw } from 'lucide-react';

// ============================================
// CONFIGURAÇÃO DA API - ATUALIZE COM SUA URL
// ============================================
const API_BASE_URL = 'https://matheuscarneiro12.app.n8n.cloud/webhook';

// Funções de API
const api = {
  // Autenticação
  login: async (email) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },
  
  getTeam: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/team`);
    return res.json();
  },

  // Eventos
  getEvents: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE_URL}/events${params ? '?' + params : ''}`);
    return res.json();
  },

  getEvent: async (id) => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`);
    return res.json();
  },

  createEvent: async (data) => {
    const res = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateEvent: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteEvent: async (id) => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Comentários
  getComments: async (eventId) => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/comments`);
    return res.json();
  },

  addComment: async (eventId, userId, content) => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, content })
    });
    return res.json();
  },

  // Notificações
  getTodayEvents: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications/today`);
    return res.json();
  },

  getWeekEvents: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications/week`);
    return res.json();
  },

  // Google Calendar Sync
  syncCalendar: async () => {
    const res = await fetch(`${API_BASE_URL}/calendar/sync`, {
      method: 'POST'
    });
    return res.json();
  }
};

// Configurações de roles e tipos
const ROLE_CONFIG = {
  chefe: { label: 'Diretor Geral', color: '#8B5CF6', icon: Building2 },
  gestor: { label: 'Gestor', color: '#3B82F6', icon: Briefcase },
  comercial: { label: 'Comercial', color: '#10B981', icon: TrendingUp },
  marketing: { label: 'Marketing', color: '#F59E0B', icon: Megaphone },
  advogado: { label: 'Advogado', color: '#6366F1', icon: Scale },
  estagiario: { label: 'Estagiário', color: '#EC4899', icon: GraduationCap },
};

const EVENT_TYPES = {
  audiencia: { label: 'Audiência', color: '#DC2626', bgColor: '#FEE2E2' },
  reuniao: { label: 'Reunião', color: '#2563EB', bgColor: '#DBEAFE' },
  diligencia: { label: 'Diligência', color: '#7C3AED', bgColor: '#EDE9FE' },
  prazo: { label: 'Prazo', color: '#EA580C', bgColor: '#FFEDD5' },
  interno: { label: 'Interno', color: '#059669', bgColor: '#D1FAE5' },
  comercial: { label: 'Comercial', color: '#0891B2', bgColor: '#CFFAFE' },
};

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: '#F59E0B', icon: AlertCircle },
  confirmado: { label: 'Confirmado', color: '#10B981', icon: CheckCircle },
  concluido: { label: 'Concluído', color: '#6B7280', icon: Check },
  urgente: { label: 'Urgente', color: '#DC2626', icon: AlertCircle },
  cancelado: { label: 'Cancelado', color: '#EF4444', icon: X },
};

// Componente de Loading
const LoadingSpinner = ({ size = 24 }) => (
  <Loader2 size={size} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
);

// Componente de Login
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Digite um email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await api.login(email);
      
      if (result.success && result.user) {
        // Salvar no localStorage
        localStorage.setItem('borelli_user', JSON.stringify(result.user));
        onLogin(result.user);
      } else {
        setError(result.error || 'Usuário não encontrado. Verifique o email.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro ao conectar com o servidor. Verifique se os workflows estão ativos.');
    } finally {
      setLoading(false);
    }
  };

  const demoEmails = [
    { role: 'chefe', email: 'carlos@borelli.adv.br' },
    { role: 'gestor', email: 'ana@borelli.adv.br' },
    { role: 'comercial', email: 'roberto@borelli.adv.br' },
    { role: 'marketing', email: 'julia@borelli.adv.br' },
    { role: 'advogado', email: 'matheus@borelli.adv.br' },
    { role: 'estagiario', email: 'lucas@borelli.adv.br' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '20px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #e6c556 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 30px rgba(201, 162, 39, 0.3)'
          }}>
            <Scale size={36} color="#1a1a2e" />
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '28px',
            fontWeight: '700',
            color: '#fff',
            margin: '0 0 8px 0'
          }}>Borelli Advocacia</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
            Sistema de Gestão Jurídica
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '20px',
              color: '#FCA5A5',
              fontSize: '13px'
            }}>{error}</div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(201, 162, 39, 0.5)' : 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#1a1a2e',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading && <LoadingSpinner size={18} />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>
            Emails cadastrados:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {demoEmails.map(({ role, email: demoEmail }) => {
              const config = ROLE_CONFIG[role];
              return (
                <button
                  key={role}
                  onClick={() => setEmail(demoEmail)}
                  disabled={loading}
                  style={{
                    padding: '6px 10px',
                    background: `${config.color}20`,
                    border: `1px solid ${config.color}40`,
                    borderRadius: '6px',
                    color: config.color,
                    fontSize: '11px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p style={{ color: '#93C5FD', fontSize: '11px', margin: 0, textAlign: 'center' }}>
            💡 Clique em um perfil acima para preencher o email automaticamente
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Principal
const Dashboard = ({ user, onLogout }) => {
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('agenda');
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.estagiario;
  const RoleIcon = roleConfig.icon;

  const canEdit = ['chefe', 'gestor', 'advogado'].includes(user.role);
  const canCreate = ['chefe', 'gestor', 'advogado', 'comercial'].includes(user.role);
  const canViewAll = ['chefe', 'gestor'].includes(user.role);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [eventsRes, teamRes] = await Promise.all([
        api.getEvents(),
        api.getTeam()
      ]);

      if (eventsRes.success) {
        setEvents(eventsRes.events || []);
      }
      
      if (teamRes.success) {
        setTeam(teamRes.team || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCalendar = async () => {
    setSyncing(true);
    try {
      const result = await api.syncCalendar();
      if (result.success) {
        await loadData();
        alert(`Sincronizado! ${result.synced || 0} eventos importados.`);
      } else {
        alert('Erro na sincronização. Verifique as credenciais do Google Calendar.');
      }
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
      alert('Erro ao sincronizar com Google Calendar.');
    } finally {
      setSyncing(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch = 
      (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.client_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays();

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(e => e.event_date === dateStr);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const handleLogout = () => {
    localStorage.removeItem('borelli_user');
    onLogout();
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedEvent) return;
    
    try {
      const result = await api.addComment(selectedEvent.id, user.id, newComment);
      if (result.success) {
        // Recarregar evento
        const updatedEvent = await api.getEvent(selectedEvent.id);
        if (updatedEvent.success && updatedEvent.event) {
          setSelectedEvent(updatedEvent.event);
          // Atualizar na lista
          setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent.event : e));
        }
        setNewComment('');
      }
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
    }
  };

  const updateEventStatus = async (eventId, newStatus) => {
    try {
      const result = await api.updateEvent(eventId, { status: newStatus });
      if (result.success) {
        setEvents(events.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm('Tem certeza que deseja excluir este compromisso?')) return;
    
    try {
      const result = await api.deleteEvent(eventId);
      if (result.success) {
        setEvents(events.filter(e => e.id !== eventId));
        setSelectedEvent(null);
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const result = await api.createEvent({
        ...eventData,
        created_by: user.id
      });
      if (result.success) {
        await loadData();
        setShowNewEventModal(false);
      }
    } catch (err) {
      console.error('Erro ao criar evento:', err);
    }
  };

  const stats = {
    total: filteredEvents.length,
    pendentes: filteredEvents.filter(e => e.status === 'pendente').length,
    urgentes: filteredEvents.filter(e => e.status === 'urgente').length,
    concluidos: filteredEvents.filter(e => e.status === 'concluido').length,
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f0f14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <LoadingSpinner size={48} />
          <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.6)' }}>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f14',
      fontFamily: "'DM Sans', sans-serif",
      color: '#fff'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .event-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
        .nav-item:hover { background: rgba(255,255,255,0.08); }
        .action-btn:hover { background: rgba(255,255,255,0.15); }
      `}</style>

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '260px',
        background: 'linear-gradient(180deg, #1a1a24 0%, #12121a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Scale size={22} color="#1a1a2e" />
          </div>
          <div>
            <h1 style={{ 
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px', 
              fontWeight: '700', 
              margin: 0,
              color: '#fff'
            }}>Borelli</h1>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Advocacia</span>
          </div>
        </div>

        {/* User Profile */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: `linear-gradient(135deg, ${roleConfig.color}40, ${roleConfig.color}20)`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: roleConfig.color,
              fontWeight: '600',
              fontSize: '14px'
            }}>{user.avatar || user.name?.substring(0,2).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ 
                fontSize: '11px', 
                color: roleConfig.color,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px'
              }}>
                <RoleIcon size={12} />
                {roleConfig.label}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          {[
            { id: 'agenda', icon: Calendar, label: 'Agenda' },
            { id: 'diligencias', icon: FileText, label: 'Diligências' },
            { id: 'equipe', icon: Users, label: 'Equipe' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="nav-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: activeTab === item.id ? 'rgba(201, 162, 39, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: '10px',
                color: activeTab === item.id ? '#d4af37' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sync & Logout */}
        <button
          onClick={handleSyncCalendar}
          disabled={syncing}
          className="nav-item"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '10px',
            color: '#60A5FA',
            cursor: syncing ? 'not-allowed' : 'pointer',
            marginBottom: '8px',
            fontSize: '14px'
          }}
        >
          <RefreshCw size={18} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
          {syncing ? 'Sincronizando...' : 'Sync Google Calendar'}
        </button>

        <button
          onClick={handleLogout}
          className="nav-item"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderRadius: '10px',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '260px', padding: '24px 32px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '28px' 
        }}>
          <div>
            <h2 style={{ 
              fontSize: '26px', 
              fontWeight: '700', 
              margin: '0 0 4px 0',
              fontFamily: "'Playfair Display', serif"
            }}>
              {activeTab === 'agenda' && 'Agenda'}
              {activeTab === 'diligencias' && 'Diligências'}
              {activeTab === 'equipe' && 'Equipe'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '14px' }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ 
              position: 'relative',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 12px 10px 38px',
                  color: '#fff',
                  fontSize: '14px',
                  width: '200px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all" style={{ background: '#1a1a24' }}>Todos</option>
              {Object.entries(EVENT_TYPES).map(([key, val]) => (
                <option key={key} value={key} style={{ background: '#1a1a24' }}>{val.label}</option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={loadData}
              className="action-btn"
              style={{
                width: '42px',
                height: '42px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={18} />
            </button>

            {/* New Event Button */}
            {canCreate && (
              <button
                onClick={() => setShowNewEventModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#1a1a2e',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Plus size={18} />
                Novo
              </button>
            )}

            {/* Notifications */}
            <button
              className="action-btn"
              style={{
                width: '42px',
                height: '42px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Bell size={18} />
              {stats.urgentes > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  background: '#DC2626',
                  borderRadius: '50%',
                  fontSize: '10px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>{stats.urgentes}</span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#FCA5A5',
            fontSize: '14px'
          }}>{error}</div>
        )}

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px', 
          marginBottom: '28px' 
        }}>
          {[
            { label: 'Total', value: stats.total, color: '#3B82F6', icon: Calendar },
            { label: 'Pendentes', value: stats.pendentes, color: '#F59E0B', icon: AlertCircle },
            { label: 'Urgentes', value: stats.urgentes, color: '#DC2626', icon: AlertCircle },
            { label: 'Concluídos', value: stats.concluidos, color: '#10B981', icon: CheckCircle },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 8px 0' }}>{stat.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#fff' }}>{stat.value}</p>
                </div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: `${stat.color}15`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color
                }}>
                  <stat.icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar View */}
        {activeTab === 'agenda' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden'
          }}>
            {/* Calendar Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => navigateWeek(-1)}
                  className="action-btn"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateWeek(1)}
                  className="action-btn"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <button
                onClick={() => setCurrentDate(new Date())}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(201, 162, 39, 0.15)',
                  border: '1px solid rgba(201, 162, 39, 0.3)',
                  borderRadius: '8px',
                  color: '#d4af37',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Hoje
              </button>
            </div>

            {/* Week View */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '500px' }}>
              {weekDays.map((day, i) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div key={i} style={{
                    borderRight: i < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Day Header */}
                    <div style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isCurrentDay ? 'rgba(201, 162, 39, 0.08)' : 'transparent'
                    }}>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'rgba(255,255,255,0.4)', 
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '6px'
                      }}>
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: isCurrentDay ? 'linear-gradient(135deg, #c9a227, #d4af37)' : 'transparent',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: isCurrentDay ? '#1a1a2e' : '#fff'
                      }}>
                        {day.getDate()}
                      </div>
                    </div>

                    {/* Events */}
                    <div style={{ flex: 1, padding: '8px', overflow: 'auto' }}>
                      {dayEvents.map(event => {
                        const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.reuniao;
                        
                        return (
                          <div
                            key={event.id}
                            className="event-card"
                            onClick={() => setSelectedEvent(event)}
                            style={{
                              background: `linear-gradient(135deg, ${eventType.color}15, ${eventType.color}08)`,
                              borderLeft: `3px solid ${eventType.color}`,
                              borderRadius: '8px',
                              padding: '10px',
                              marginBottom: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              color: '#fff',
                              marginBottom: '4px',
                              lineHeight: '1.3',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {event.title}
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.5)'
                            }}>
                              <Clock size={10} />
                              {event.event_time?.substring(0, 5)}
                            </div>
                            {event.status === 'urgente' && (
                              <div style={{
                                marginTop: '6px',
                                padding: '3px 6px',
                                background: '#DC262620',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#FCA5A5',
                                fontWeight: '600',
                                display: 'inline-block'
                              }}>
                                URGENTE
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {dayEvents.length === 0 && (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '20px 8px',
                          color: 'rgba(255,255,255,0.2)',
                          fontSize: '11px'
                        }}>
                          Sem eventos
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Diligências Tab */}
        {activeTab === 'diligencias' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Lista de Diligências</h3>
            </div>
            <div style={{ padding: '16px' }}>
              {filteredEvents.filter(e => e.type === 'diligencia').map(event => {
                const status = STATUS_CONFIG[event.status] || STATUS_CONFIG.pendente;
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="event-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid rgba(255,255,255,0.04)'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      background: `${status.color}15`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: status.color
                    }}>
                      <StatusIcon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{event.title}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {event.event_date}
                        </span>
                        {event.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: `${status.color}15`,
                      borderRadius: '6px',
                      color: status.color,
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {status.label}
                    </div>
                  </div>
                );
              })}
              {filteredEvents.filter(e => e.type === 'diligencia').length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                  Nenhuma diligência encontrada
                </div>
              )}
            </div>
          </div>
        )}

        {/* Equipe Tab */}
        {activeTab === 'equipe' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            {team.map(member => {
              const memberRole = ROLE_CONFIG[member.role] || ROLE_CONFIG.estagiario;
              const MemberIcon = memberRole.icon;
              const memberEvents = events.filter(e => 
                e.assignees?.some(a => a.id === member.id)
              );
              
              return (
                <div key={member.id} style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      background: `linear-gradient(135deg, ${memberRole.color}40, ${memberRole.color}20)`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: memberRole.color,
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>{member.avatar || member.name?.substring(0,2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#fff', fontSize: '15px' }}>{member.name}</div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: memberRole.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px'
                      }}>
                        <MemberIcon size={12} />
                        {memberRole.label}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Compromissos</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{memberEvents.length}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Pendentes</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>
                        {memberEvents.filter(e => e.status === 'pendente').length}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          user={user}
          canEdit={canEdit}
          onClose={() => setSelectedEvent(null)}
          onUpdateStatus={updateEventStatus}
          onDelete={deleteEvent}
          onAddComment={addComment}
          newComment={newComment}
          setNewComment={setNewComment}
          team={team}
        />
      )}

      {/* New Event Modal */}
      {showNewEventModal && (
        <NewEventModal
          onClose={() => setShowNewEventModal(false)}
          onSave={handleCreateEvent}
          userId={user.id}
        />
      )}
    </div>
  );
};

// Modal de detalhes do evento
const EventDetailModal = ({ event, user, canEdit, onClose, onUpdateStatus, onDelete, onAddComment, newComment, setNewComment, team }) => {
  const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.reuniao;
  const comments = event.comments || [];
  const assignees = event.assignees || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a1a24 0%, #12121a 100%)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: eventType.color + '20',
              color: eventType.color,
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              marginBottom: '12px',
              textTransform: 'uppercase'
            }}>
              {eventType.label}
            </div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#fff', lineHeight: '1.3' }}>
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Info Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px' }}>
                <Calendar size={14} />
                Data
              </div>
              <div style={{ color: '#fff', fontWeight: '600' }}>
                {event.event_date ? new Date(event.event_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'N/A'}
              </div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px' }}>
                <Clock size={14} />
                Horário
              </div>
              <div style={{ color: '#fff', fontWeight: '600' }}>{event.event_time?.substring(0, 5) || 'N/A'}</div>
            </div>
            {event.location && (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px' }}>
                  <MapPin size={14} />
                  Local
                </div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{event.location}</div>
              </div>
            )}
            {event.client_name && (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px' }}>
                  <User size={14} />
                  Cliente
                </div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{event.client_name}</div>
              </div>
            )}
          </div>

          {/* Status */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontWeight: '500' }}>Status</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => canEdit && onUpdateStatus(event.id, key)}
                  disabled={!canEdit}
                  style={{
                    padding: '8px 14px',
                    background: event.status === key ? `${config.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${event.status === key ? config.color : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px',
                    color: event.status === key ? config.color : 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: canEdit ? 'pointer' : 'default',
                    opacity: canEdit ? 1 : 0.7
                  }}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Responsáveis */}
          {assignees.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontWeight: '500' }}>Responsáveis</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {assignees.map((assignee, idx) => {
                  const assignedRole = ROLE_CONFIG[assignee.role] || ROLE_CONFIG.estagiario;
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      background: `${assignedRole.color}15`,
                      borderRadius: '8px',
                      border: `1px solid ${assignedRole.color}30`
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: assignedRole.color,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>{assignee.avatar || assignee.name?.substring(0,2)}</div>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{assignee.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comentários */}
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontWeight: '500' }}>
              Comentários ({comments.length})
            </div>
            
            <div style={{ marginBottom: '16px', maxHeight: '200px', overflow: 'auto' }}>
              {comments.length === 0 ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: 'rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  fontSize: '13px'
                }}>
                  Nenhum comentário ainda
                </div>
              ) : (
                comments.map((comment, idx) => (
                  <div key={idx} style={{
                    padding: '14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        background: '#6366F130',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6366F1',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>{comment.user_avatar || comment.user_name?.substring(0,2) || '??'}</div>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{comment.user_name || 'Usuário'}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginLeft: '8px' }}>
                          {comment.created_at ? new Date(comment.created_at).toLocaleString('pt-BR') : ''}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.5' }}>
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                onKeyPress={(e) => e.key === 'Enter' && onAddComment()}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={onAddComment}
                disabled={!newComment.trim()}
                style={{
                  padding: '12px 20px',
                  background: newComment.trim() ? 'linear-gradient(135deg, #c9a227, #d4af37)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '10px',
                  color: newComment.trim() ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        {canEdit && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}>
            <button
              onClick={() => onDelete(event.id)}
              style={{
                padding: '10px 18px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#FCA5A5',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={14} />
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Modal para criar novo evento
const NewEventModal = ({ onClose, onSave, userId }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'reuniao',
    event_date: '',
    event_time: '',
    location: '',
    client_name: '',
    status: 'pendente',
    category: 'cliente'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date || !formData.event_time) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a1a24 0%, #12121a 100%)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' }}>
            Novo Compromisso
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Reunião com Cliente..."
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(EVENT_TYPES).map(([key, val]) => (
                  <option key={key} value={key} style={{ background: '#1a1a24' }}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <option key={key} value={key} style={{ background: '#1a1a24' }}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                Data *
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                Horário *
              </label>
              <input
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
              Local
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Escritório, Fórum..."
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
              Cliente
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="Nome do cliente (se aplicável)"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '14px',
                background: saving ? 'rgba(201, 162, 39, 0.5)' : 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#1a1a2e',
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {saving ? 'Salvando...' : 'Criar Compromisso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// App Principal
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se já está logado
  useEffect(() => {
    const savedUser = localStorage.getItem('borelli_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('borelli_user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f0f14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Loader2 size={48} color="#d4af37" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} onLogout={() => setUser(null)} />
  ) : (
    <LoginScreen onLogin={setUser} />
  );
}
