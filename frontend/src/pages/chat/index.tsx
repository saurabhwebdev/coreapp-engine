import { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Button, Badge, Spin, message, Modal, List, Avatar } from 'antd';
import {
  SendOutlined,
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from 'react-oidc-context';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getContacts,
  getMessages,
  sendMessage,
  markAsRead,
  type ChatContactDto,
  type ChatMessageDto,
} from '../../services/chat';
import { getUsers, type IdentityUserDto } from '../../services/identity';
import EmptyState from '../../components/EmptyState';

dayjs.extend(relativeTime);

export default function ChatPage() {
  const auth = useAuth();
  const currentUserId = auth.user?.profile?.sub || '';

  const [contacts, setContacts] = useState<ChatContactDto[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactFilter, setContactFilter] = useState('');
  const [selectedContact, setSelectedContact] = useState<ChatContactDto | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);

  // New chat modal
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<IdentityUserDto[]>([]);
  const [searching, setSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { loadContacts(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const res = await getContacts();
      setContacts(res.data);
    } catch {
      // silently fail — might just be empty
    } finally {
      setContactsLoading(false);
    }
  };

  const loadMessages = async (contact: ChatContactDto) => {
    setMessagesLoading(true);
    try {
      const res = await getMessages(contact.userId, { maxResultCount: 100 });
      setMessages(res.data.items);
      if (contact.unreadCount > 0) {
        await markAsRead(contact.userId);
        setContacts((prev) =>
          prev.map((c) => c.userId === contact.userId ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch {
      message.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectContact = (contact: ChatContactDto) => {
    setSelectedContact(contact);
    loadMessages(contact);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedContact) return;
    setSending(true);
    try {
      const res = await sendMessage(selectedContact.userId, inputValue.trim());
      setMessages((prev) => [...prev, res.data]);
      setInputValue('');
      // Update contact list
      setContacts((prev) => {
        const exists = prev.find((c) => c.userId === selectedContact.userId);
        if (exists) {
          return prev.map((c) =>
            c.userId === selectedContact.userId
              ? { ...c, lastMessage: inputValue.trim(), lastMessageTime: new Date().toISOString() }
              : c
          );
        }
        // Add new contact to list
        return [{ ...selectedContact, lastMessage: inputValue.trim(), lastMessageTime: new Date().toISOString(), unreadCount: 0 }, ...prev];
      });
    } catch {
      message.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Search users for new chat
  const handleSearchUsers = async (query: string) => {
    setUserSearch(query);
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await getUsers({ filter: query, maxResultCount: 10 });
      // Exclude current user
      setSearchResults(res.data.items.filter((u) => u.id !== currentUserId));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = (user: IdentityUserDto) => {
    const contact: ChatContactDto = {
      userId: user.id,
      userName: user.userName,
      name: [user.name, user.surname].filter(Boolean).join(' ') || undefined,
      unreadCount: 0,
      lastMessage: undefined,
      lastMessageTime: undefined,
    };
    // Add to contacts if not already there
    setContacts((prev) => {
      if (prev.find((c) => c.userId === user.id)) return prev;
      return [contact, ...prev];
    });
    setSelectedContact(contact);
    setMessages([]);
    setNewChatOpen(false);
    setUserSearch('');
    setSearchResults([]);
  };

  const filteredContacts = contacts.filter(
    (c) => !contactFilter || (c.name || c.userName).toLowerCase().includes(contactFilter.toLowerCase())
  );

  const formatTimestamp = (time?: string) => {
    if (!time) return '';
    const d = dayjs(time);
    if (d.isAfter(dayjs().startOf('day'))) return d.format('HH:mm');
    if (d.isAfter(dayjs().subtract(7, 'day'))) return d.format('ddd');
    return d.format('MMM D');
  };

  return (
    <div className="ce-page-enter">
      <div
        className="ce-stagger-2"
        style={{
          display: 'flex',
          height: 'calc(100vh - 140px)',
          minHeight: 500,
          background: 'var(--ce-bg-card)',
          border: '1px solid var(--ce-border-light)',
          borderRadius: 'var(--ce-radius)',
          overflow: 'hidden',
        }}
      >
        {/* Left panel - Contacts */}
        <div style={{
          width: 280, minWidth: 280,
          borderRight: '1px solid var(--ce-border-light)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--ce-bg-card)',
        }}>
          <div style={{ padding: '12px 12px 8px', display: 'flex', gap: 8 }}>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined style={{ color: 'var(--ce-text-muted)' }} />}
              value={contactFilter}
              onChange={(e) => setContactFilter(e.target.value)}
              allowClear
              size="small"
              style={{ flex: 1 }}
            />
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setNewChatOpen(true)}
              style={{ flexShrink: 0 }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {contactsLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><Spin size="small" /></div>
            ) : filteredContacts.length === 0 ? (
              <div>
                {contacts.length === 0 ? (
                  <EmptyState title="No conversations yet" description="Start a new chat to begin messaging." actionLabel="New Chat" onAction={() => setNewChatOpen(true)} compact />
                ) : (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--ce-text-muted)', fontSize: 12 }}>
                    No matches
                  </div>
                )}
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.userId === contact.userId;
                return (
                  <div
                    key={contact.userId}
                    onClick={() => handleSelectContact(contact)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--ce-accent-light)' : 'transparent',
                      borderLeft: isSelected ? '2px solid var(--ce-accent)' : '2px solid transparent',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--ce-bg-inset)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: isSelected ? 'var(--ce-accent-light)' : 'var(--ce-bg-inset)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: 13,
                        color: isSelected ? 'var(--ce-accent)' : 'var(--ce-text-muted)',
                        flexShrink: 0,
                      }}>
                        {(contact.name || contact.userName).charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontWeight: contact.unreadCount > 0 ? 700 : 500, fontSize: 13,
                            color: 'var(--ce-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {contact.name || contact.userName}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--ce-text-muted)', flexShrink: 0, marginLeft: 8 }}>
                            {formatTimestamp(contact.lastMessageTime)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                          <span style={{
                            fontSize: 12, color: 'var(--ce-text-muted)',
                            fontWeight: contact.unreadCount > 0 ? 500 : 400,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                          }}>
                            {contact.lastMessage || 'Start a conversation'}
                          </span>
                          {contact.unreadCount > 0 && <Badge count={contact.unreadCount} size="small" style={{ marginLeft: 8 }} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel - Messages */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ce-bg)' }}>
          {!selectedContact ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <EmptyState title="Select a conversation" description="Choose a contact or start a new chat." actionLabel="New Chat" onAction={() => setNewChatOpen(true)} />
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{
                padding: '12px 20px',
                background: 'var(--ce-bg-card)',
                borderBottom: '1px solid var(--ce-border-light)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--ce-accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: 13, color: 'var(--ce-accent)',
                }}>
                  {(selectedContact.name || selectedContact.userName).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ce-text)' }}>
                    {selectedContact.name || selectedContact.userName}
                  </div>
                  <div className="ce-mono" style={{ fontSize: 11 }}>@{selectedContact.userName}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                {messagesLoading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}><Spin size="small" /></div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--ce-text-muted)', fontSize: 13 }}>
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSent = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                        <div style={{
                          maxWidth: '70%', padding: '8px 12px',
                          borderRadius: isSent ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                          background: isSent ? 'var(--ce-accent)' : 'var(--ce-bg-card)',
                          color: isSent ? '#FFFFFF' : 'var(--ce-text)',
                          border: isSent ? 'none' : '1px solid var(--ce-border-light)',
                          fontSize: 13, lineHeight: 1.5,
                        }}>
                          <div style={{ wordBreak: 'break-word' }}>{msg.message}</div>
                          <div style={{
                            fontSize: 10, marginTop: 3, textAlign: 'right',
                            color: isSent ? 'rgba(255,255,255,0.6)' : 'var(--ce-text-muted)',
                          }}>
                            {dayjs(msg.creationTime).format('HH:mm')}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '10px 20px',
                background: 'var(--ce-bg-card)',
                borderTop: '1px solid var(--ce-border-light)',
                display: 'flex', gap: 8, alignItems: 'flex-end',
              }}>
                <Input.TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ flex: 1, resize: 'none' }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  loading={sending}
                  disabled={!inputValue.trim()}
                  style={{ flexShrink: 0 }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <Modal
        title="New Conversation"
        open={newChatOpen}
        onCancel={() => { setNewChatOpen(false); setUserSearch(''); setSearchResults([]); }}
        footer={null}
        width={420}
      >
        <Input
          placeholder="Search users by name or email..."
          prefix={<SearchOutlined style={{ color: 'var(--ce-text-muted)' }} />}
          value={userSearch}
          onChange={(e) => handleSearchUsers(e.target.value)}
          allowClear
          style={{ marginBottom: 16 }}
          autoFocus
        />
        {searching ? (
          <div style={{ textAlign: 'center', padding: 20 }}><Spin size="small" /></div>
        ) : userSearch && searchResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--ce-text-muted)', fontSize: 13 }}>
            No users found
          </div>
        ) : (
          <List
            dataSource={searchResults}
            renderItem={(user) => (
              <List.Item
                style={{ cursor: 'pointer', padding: '10px 8px', borderRadius: 'var(--ce-radius-sm)' }}
                onClick={() => handleStartChat(user)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ce-bg-inset)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar size={36} style={{ background: 'var(--ce-accent-light)', color: 'var(--ce-accent)', fontWeight: 600 }}>
                      {(user.name || user.userName).charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={<span style={{ fontWeight: 600, fontSize: 13 }}>{user.name ? `${user.name} ${user.surname || ''}`.trim() : user.userName}</span>}
                  description={<span style={{ fontSize: 12, color: 'var(--ce-text-muted)' }}>{user.email}</span>}
                />
              </List.Item>
            )}
          />
        )}
        {!userSearch && (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--ce-text-muted)', fontSize: 12 }}>
            <UserOutlined style={{ fontSize: 20, display: 'block', marginBottom: 6, opacity: 0.3 }} />
            Type a name or email to find users
          </div>
        )}
      </Modal>
    </div>
  );
}
