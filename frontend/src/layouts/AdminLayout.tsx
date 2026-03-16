import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { Badge, Dropdown, Space, notification as antNotification, Tooltip } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  SettingOutlined,
  AuditOutlined,
  BellOutlined,
  FileOutlined,
  BranchesOutlined,
  MessageOutlined,
  FormOutlined,
  BarChartOutlined,
  HeartOutlined,
  ScheduleOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SunOutlined,
  MoonOutlined,
  RightOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { getUnreadCount } from '../services/notification';
import { startConnection, onNotificationReceived } from '../services/signalr';
import api from '../services/api';
import { env } from '../utils/env';
import { getAvatarConfig, generateAvatarDataUri } from '../utils/avatar';
import { getBranding } from '../utils/branding';
import { getColorTheme } from '../utils/theme';

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  feature?: string;
  section?: string;
}

const allNavSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { key: '/', icon: <DashboardOutlined />, label: 'Dashboard', subtitle: 'Platform overview', section: 'Overview', feature: 'CoreApp.DashboardModule' },
    ],
  },
  {
    title: 'Identity',
    items: [
      { key: '/identity/users', icon: <UserOutlined />, label: 'Users', subtitle: 'Manage user accounts', section: 'Identity' },
      { key: '/identity/roles', icon: <TeamOutlined />, label: 'Roles', subtitle: 'Configure roles & permissions', section: 'Identity' },
      { key: '/tenants', icon: <BankOutlined />, label: 'Tenants', subtitle: 'Multi-tenant management', section: 'Identity' },
    ],
  },
  {
    title: 'System',
    items: [
      { key: '/elsa-studio', icon: <BranchesOutlined />, label: 'Workflows', subtitle: 'Elsa visual designer', section: 'System', feature: 'CoreApp.WorkflowModule' },
      { key: '/files', icon: <FileOutlined />, label: 'Files', subtitle: 'Manage documents & folders', section: 'System', feature: 'CoreApp.FileManagementModule' },
      { key: '/notifications', icon: <BellOutlined />, label: 'Notifications', subtitle: 'Stay informed', section: 'System', feature: 'CoreApp.NotificationModule' },
      { key: '/chat', icon: <MessageOutlined />, label: 'Chat', subtitle: 'Real-time messaging', section: 'System', feature: 'CoreApp.ChatModule' },
      { key: '/forms', icon: <FormOutlined />, label: 'Forms', subtitle: 'Dynamic form builder', section: 'System', feature: 'CoreApp.FormsModule' },
      { key: '/reports', icon: <BarChartOutlined />, label: 'Reports', subtitle: 'Business intelligence', section: 'System', feature: 'CoreApp.ReportsModule' },
      { key: '/background-jobs', icon: <ScheduleOutlined />, label: 'Background Jobs', subtitle: 'Async job processing', section: 'System' },
      { key: '/health', icon: <HeartOutlined />, label: 'Health', subtitle: 'System monitoring', section: 'System' },
      { key: '/audit-logs', icon: <AuditOutlined />, label: 'Audit Logs', subtitle: 'Track system activity', section: 'System', feature: 'CoreApp.AuditLogModule' },
      { key: '/settings', icon: <SettingOutlined />, label: 'Settings', subtitle: 'Platform configuration', section: 'System' },
    ],
  },
];

// Extra route metadata not in sidebar
const extraRoutes: Record<string, { label: string; subtitle: string; section: string }> = {
  '/profile': { label: 'Profile', subtitle: 'Manage your account', section: 'Account' },
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, string>>({});
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ce-theme') === 'dark');
  const themeToggleRef = useRef<HTMLButtonElement>(null);
  const [avatarConfig, setAvatarConfig] = useState(getAvatarConfig);
  const [branding, setBranding] = useState(getBranding);
  const [colorTheme, setColorTheme] = useState(getColorTheme);
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(() => localStorage.getItem('__tenant'));
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Apply dark mode class to html
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('ce-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Circular reveal dark mode toggle
  const toggleDarkMode = useCallback(() => {
    const btn = themeToggleRef.current;
    // Fallback: no View Transition API support
    if (!document.startViewTransition || !btn) {
      setDarkMode((d) => !d);
      return;
    }

    // Get the button center coordinates for the circle origin
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Calculate the max radius needed to cover the entire viewport
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Store coordinates as CSS custom properties for the animation
    document.documentElement.style.setProperty('--ce-reveal-x', `${x}px`);
    document.documentElement.style.setProperty('--ce-reveal-y', `${y}px`);
    document.documentElement.style.setProperty('--ce-reveal-r', `${maxRadius}px`);

    const transition = document.startViewTransition(() => {
      setDarkMode((d) => !d);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  }, []);

  const loadFeatures = async () => {
    try {
      const res = await api.get('/api/abp/application-configuration');
      const featureValues = res.data?.features?.values || {};
      setEnabledFeatures(featureValues);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const onFeaturesChanged = () => loadFeatures();
    const onAvatarChanged = () => setAvatarConfig(getAvatarConfig());
    const onBrandingChanged = () => setBranding(getBranding());
    const onThemeChanged = () => setColorTheme(getColorTheme());
    window.addEventListener('features-changed', onFeaturesChanged);
    window.addEventListener('avatar-changed', onAvatarChanged);
    window.addEventListener('branding-changed', onBrandingChanged);
    window.addEventListener('theme-changed', onThemeChanged);
    return () => {
      window.removeEventListener('features-changed', onFeaturesChanged);
      window.removeEventListener('avatar-changed', onAvatarChanged);
      window.removeEventListener('branding-changed', onBrandingChanged);
      window.removeEventListener('theme-changed', onThemeChanged);
    };
  }, []);

  const loadTenants = async () => {
    try {
      // Load tenants without __tenant header (host context)
      // Use axios directly to avoid the __tenant interceptor
      const storageKey = `oidc.user:${env.authAuthority}:${env.authClientId}`;
      const userData = localStorage.getItem(storageKey);
      let token = '';
      if (userData) {
        try { token = JSON.parse(userData).access_token || ''; } catch { /* */ }
      }
      const res = await fetch(`${env.apiBaseUrl}/api/multi-tenancy/tenants?maxResultCount=100`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTenants(data?.items || []);
      }
    } catch {
      // Not authorized (tenant user) or error — ignore
    }
  };

  const switchTenant = (tenantId: string | null) => {
    if (tenantId) {
      localStorage.setItem('__tenant', tenantId);
    } else {
      localStorage.removeItem('__tenant');
    }
    setCurrentTenantId(tenantId);
    window.location.reload();
  };

  useEffect(() => {
    loadFeatures();
    loadUnreadCount();
    loadTenants();
    startConnection();
    const unsub = onNotificationReceived((data: any) => {
      setUnreadCount((c) => c + 1);
      antNotification.info({
        message: data.title || 'New Notification',
        description: data.message,
        placement: 'topRight',
      });
    });
    return unsub;
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data);
    } catch { /* ignore */ }
  };

  const userName = auth.user?.profile?.name || auth.user?.profile?.preferred_username || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const headerAvatarUri = generateAvatarDataUri(avatarConfig.style, avatarConfig.seed);

  const isActive = (key: string) => {
    if (key === '/') return location.pathname === '/';
    return location.pathname.startsWith(key);
  };

  const sidebarWidth = collapsed ? 64 : 240;

  const navSections = allNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.feature) return true;
        return enabledFeatures[item.feature] !== 'false';
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Breadcrumb: find current page info
  const currentPage = useMemo(() => {
    const allItems = allNavSections.flatMap((s) => s.items);
    // Exact match first
    const exact = allItems.find((i) => i.key === location.pathname);
    if (exact) return { section: exact.section || '', label: exact.label, subtitle: exact.subtitle || '' };
    // Prefix match (e.g. /workflows/123)
    for (const [prefix, meta] of Object.entries(extraRoutes)) {
      if (location.pathname.startsWith(prefix)) return meta;
    }
    // Fallback prefix match from nav
    const prefixed = allItems.find((i) => i.key !== '/' && location.pathname.startsWith(i.key));
    if (prefixed) return { section: prefixed.section || '', label: prefixed.label, subtitle: prefixed.subtitle || '' };
    return { section: '', label: '', subtitle: '' };
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ce-bg)' }}>
      {/* ─── Sidebar ─── */}
      <aside
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          background: 'var(--ce-bg-sidebar)',
          borderRight: '1px solid var(--ce-sidebar-border, var(--ce-border-light))',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.22, 1, 0.36, 1), min-width 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          overflow: 'hidden',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 16px' : '0 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid var(--ce-sidebar-border, var(--ce-border-light))',
            flexShrink: 0,
          }}
        >
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.appName} style={{
              width: 34, height: 34, borderRadius: 8, objectFit: 'contain', flexShrink: 0,
            }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: `linear-gradient(135deg, ${colorTheme.accent} 0%, ${colorTheme.accentHover} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: 14, letterSpacing: -0.5, flexShrink: 0,
            }}>
              {branding.logoText}
            </div>
          )}
          {!collapsed && (
            <div style={{ marginLeft: 12, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ce-text-sidebar-active)', letterSpacing: -0.3, lineHeight: 1.2 }}>{branding.appName}</div>
              <div style={{ fontSize: 10, color: 'var(--ce-text-sidebar)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 500 }}>{branding.tagline}</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {navSections.map((section) => (
            <div key={section.title} style={{ marginBottom: 8 }}>
              {!collapsed && (
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--ce-text-muted)', padding: '12px 12px 6px' }}>
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const active = isActive(item.key);
                const navBtn = (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    style={{
                      display: 'flex', alignItems: 'center', width: '100%',
                      padding: collapsed ? '10px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      gap: 10, border: 'none', borderRadius: 8, cursor: 'pointer',
                      background: active ? 'var(--ce-bg-sidebar-active)' : 'transparent',
                      color: active ? 'var(--ce-text-sidebar-active)' : 'var(--ce-text-sidebar)',
                      fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: 'inherit',
                      transition: 'all 0.15s ease', position: 'relative', marginBottom: 2,
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--ce-bg-sidebar-hover)'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {active && (
                      <div style={{
                        position: 'absolute',
                        left: collapsed ? '50%' : -8,
                        transform: collapsed ? 'translateX(-50%)' : 'none',
                        bottom: collapsed ? -2 : '50%',
                        ...(collapsed
                          ? { width: 20, height: 3, borderRadius: 2 }
                          : { width: 3, height: 20, borderRadius: 2, transform: 'translateY(50%)' }),
                        background: colorTheme.accent,
                      }} />
                    )}
                    <span style={{ fontSize: 16, lineHeight: 1, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
                return collapsed ? <Tooltip key={item.key} title={item.label} placement="right">{navBtn}</Tooltip> : navBtn;
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--ce-sidebar-border, var(--ce-border-light))', flexShrink: 0 }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
              width: '100%', padding: '8px 12px', gap: 10, border: 'none', borderRadius: 8,
              cursor: 'pointer', background: 'transparent', color: 'var(--ce-text-sidebar)',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ce-bg-sidebar-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: 'margin-left 0.25s cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {/* Header with breadcrumb */}
        <header
          style={{
            height: 64,
            background: 'var(--ce-bg-header)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--ce-border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          {/* Left: Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            {currentPage.section && (
              <>
                <span style={{ fontSize: 13, color: 'var(--ce-text-muted)', fontWeight: 500 }}>
                  {currentPage.section}
                </span>
                <RightOutlined style={{ fontSize: 9, color: 'var(--ce-text-muted)' }} />
              </>
            )}
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ce-text)', letterSpacing: -0.2 }}>
              {currentPage.label}
            </span>
            {currentPage.subtitle && (
              <>
                <span style={{ fontSize: 11, color: 'var(--ce-text-muted)', marginLeft: 8, fontWeight: 400 }}>
                  {currentPage.subtitle}
                </span>
              </>
            )}
          </div>

          {/* Right: Actions */}
          <Space size={12}>
            {/* Tenant Switcher — visible to host admin or when tenants loaded */}
            {(tenants.length > 0 || currentTenantId) && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'host',
                      label: (
                        <span style={{ fontWeight: !currentTenantId ? 700 : 400 }}>
                          Host (System Admin)
                        </span>
                      ),
                      icon: !currentTenantId ? <span style={{ color: 'var(--ce-success)', fontSize: 8 }}>●</span> : null,
                    },
                    { type: 'divider' as const },
                    ...tenants.map((t) => ({
                      key: t.id,
                      label: (
                        <span style={{ fontWeight: currentTenantId === t.id ? 700 : 400 }}>
                          {t.name}
                        </span>
                      ),
                      icon: currentTenantId === t.id ? <span style={{ color: 'var(--ce-success)', fontSize: 8 }}>●</span> : null,
                    })),
                  ],
                  onClick: ({ key }) => switchTenant(key === 'host' ? null : key),
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px',
                    border: '1px solid var(--ce-border)', borderRadius: 8,
                    background: currentTenantId ? 'var(--ce-accent-light)' : 'var(--ce-bg-card)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    color: currentTenantId ? 'var(--ce-accent)' : 'var(--ce-text-secondary)',
                    fontFamily: 'inherit', transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ce-accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ce-border)'; }}
                >
                  <SwapOutlined style={{ fontSize: 13 }} />
                  {currentTenantId
                    ? tenants.find((t) => t.id === currentTenantId)?.name || 'Tenant'
                    : 'Host'}
                </button>
              </Dropdown>
            )}

            {/* Dark mode toggle — circular reveal */}
            <button
              ref={themeToggleRef}
              onClick={toggleDarkMode}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 10,
                border: '1px solid var(--ce-border)', background: 'var(--ce-bg-card)',
                cursor: 'pointer', color: 'var(--ce-text-secondary)', fontSize: 16,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ce-accent)'; e.currentTarget.style.color = 'var(--ce-accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ce-border)'; e.currentTarget.style.color = 'var(--ce-text-secondary)'; }}
            >
              {darkMode ? <SunOutlined /> : <MoonOutlined />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 10,
                border: '1px solid var(--ce-border)', background: 'var(--ce-bg-card)',
                cursor: 'pointer', color: 'var(--ce-text-secondary)', fontSize: 16,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ce-accent)'; e.currentTarget.style.color = 'var(--ce-accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ce-border)'; e.currentTarget.style.color = 'var(--ce-text-secondary)'; }}
            >
              <Badge count={unreadCount} size="small" offset={[2, -2]}>
                <BellOutlined style={{ fontSize: 16 }} />
              </Badge>
            </button>

            {/* User menu */}
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', icon: <ProfileOutlined />, label: 'Profile' },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, label: 'Sign Out', danger: true },
                ],
                onClick: ({ key }) => {
                  if (key === 'logout') auth.signoutRedirect();
                  else if (key === 'profile') navigate('/profile');
                },
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 12px 6px 6px', border: '1px solid var(--ce-border)',
                  borderRadius: 10, background: 'var(--ce-bg-card)', cursor: 'pointer',
                  transition: 'border-color 0.15s', fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ce-accent-border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ce-border)'; }}
              >
                {headerAvatarUri ? (
                  <img src={headerAvatarUri} alt="" style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'var(--ce-bg-inset)',
                  }} />
                ) : (
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `linear-gradient(135deg, ${colorTheme.accent}, ${colorTheme.accentHover})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 12,
                  }}>
                    {userInitial}
                  </div>
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ce-text)' }}>{userName}</span>
              </button>
            </Dropdown>
          </Space>
        </header>

        {/* Tenant context banner */}
        {currentTenantId && (
          <div style={{
            padding: '8px 28px',
            background: 'var(--ce-accent-light)',
            borderBottom: '1px solid var(--ce-accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 12, fontWeight: 500,
          }}>
            <span style={{ color: 'var(--ce-accent)' }}>
              Viewing tenant: <strong>{tenants.find((t) => t.id === currentTenantId)?.name || 'Unknown'}</strong>
              &nbsp;&mdash; All data on this page is scoped to this tenant.
            </span>
            <button
              onClick={() => switchTenant(null)}
              style={{
                border: '1px solid var(--ce-accent-border)', borderRadius: 6,
                background: 'var(--ce-bg-card)', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, color: 'var(--ce-accent)',
                padding: '3px 10px', fontFamily: 'inherit',
              }}
            >
              Back to Host
            </button>
          </div>
        )}

        {/* Content */}
        <main style={{ padding: 28 }}>
          <div className="ce-page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
