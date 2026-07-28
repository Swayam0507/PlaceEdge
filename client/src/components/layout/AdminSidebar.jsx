import { Link, useLocation } from "react-router-dom";
import {
  FiBarChart2, FiEdit, FiUsers, FiMessageSquare,
  FiChevronLeft, FiChevronRight, FiLogOut, FiSettings
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const ADMIN_NAV = [
  { label: "Analytics", path: "/admin", icon: FiBarChart2 },
  { label: "Questions", path: "/admin/questions", icon: FiEdit },
  { label: "Students", path: "/admin/users", icon: FiUsers },
  { label: "Interview Q&A", path: "/admin/interview-questions", icon: FiMessageSquare },
];

const AdminSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className="admin-sidebar"
      style={{
        width: collapsed ? '68px' : '240px',
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(180deg, #1e1b4b, #312e81)',
        borderRight: '1px solid rgba(99,102,241,0.15)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'sticky',
        top: '64px',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 40,
      }}
    >
      {/* Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-end',
        padding: '12px 12px 0',
      }}>
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      {/* Section Label */}
      {!collapsed && (
        <div style={{
          padding: '16px 20px 8px',
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'rgba(255,255,255,0.35)',
        }}>
          Admin Panel
        </div>
      )}

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {ADMIN_NAV.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                background: active ? 'rgba(99,102,241,0.3)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div style={{
                  marginLeft: 'auto',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#818cf8',
                  boxShadow: '0 0 8px rgba(129,140,248,0.6)',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: collapsed ? '12px' : '10px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'rgba(239,68,68,0.8)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(239,68,68,0.8)';
          }}
        >
          <FiLogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
