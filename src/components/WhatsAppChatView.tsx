import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Clock,
  Reply,
  CheckCheck,
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  X,
  Sparkles,
  Info,
  ShieldAlert,
  Image as ImageIcon,
  Download,
  Maximize2,
} from 'lucide-react';
import { ChatRoom, ChatMessage } from '../types/chat';
import { formatExpiryCountdown } from '../hooks/useChatStore';
import { compressImageFile } from '../utils/image';

interface WhatsAppChatViewProps {
  rooms: ChatRoom[];
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  messages: ChatMessage[];
  onSendMessage: (
    roomId: string,
    content: string,
    replyTo?: { id: string; senderAlias: string; content: string },
    imageUrl?: string
  ) => void | Promise<any>;
  onToggleReaction: (messageId: string, emoji: string) => void | Promise<any>;
  onCreateRoom: (name: string, courseCode: string, icon: string, description: string) => void | Promise<any>;
  onClearRoom: (roomId: string) => void | Promise<any>;
  currentDeviceId: string;
  userProfile: { alias: string; avatar: string };
  isAdmin: boolean;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '😮', '🙏'];

export const WhatsAppChatView: React.FC<WhatsAppChatViewProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  messages,
  onSendMessage,
  onToggleReaction,
  onCreateRoom,
  onClearRoom,
  currentDeviceId,
  userProfile,
  isAdmin,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  // Picture upload state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);

  // Mobile navigation between list and chat view
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat');

  // New Room Form state
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCourse, setNewRoomCourse] = useState('ALL');
  const [newRoomIcon, setNewRoomIcon] = useState('💬');
  const [newRoomDesc, setNewRoomDesc] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const roomMessages = messages.filter((m) => m.roomId === activeRoom?.id);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length, activeRoomId]);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingImage(true);
    try {
      const dataUrl = await compressImageFile(file, 1200, 0.82);
      setAttachedImage(dataUrl);
    } catch (err) {
      console.error('Failed to compress chat image:', err);
    } finally {
      setIsCompressingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || !activeRoom) return;

    onSendMessage(
      activeRoom.id,
      inputText.trim(),
      replyingTo
        ? {
            id: replyingTo.id,
            senderAlias: replyingTo.senderAlias,
            content: replyingTo.content,
          }
        : undefined,
      attachedImage || undefined
    );

    setInputText('');
    setAttachedImage(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onCreateRoom(newRoomName, newRoomCourse, newRoomIcon, newRoomDesc);
    setNewRoomName('');
    setNewRoomDesc('');
    setShowNewRoomModal(false);
  };

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex h-[calc(100vh-8.5rem)] min-h-[580px] max-h-[820px] w-full overflow-hidden rounded-3xl border border-neutral-800 bg-[#111b21] shadow-2xl">
      {/* LEFT COLUMN: Rooms List (WhatsApp Style) */}
      <div
        className={`flex w-full sm:w-80 md:w-96 flex-col border-r border-neutral-800 bg-[#111b21] shrink-0 ${
          mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Rooms Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-800/80 px-4 shrink-0 bg-[#202c33]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-lg border border-emerald-500/30">
              {userProfile.avatar}
            </span>
            <div>
              <span className="text-xs font-bold text-white block">{userProfile.alias}</span>
              <span className="text-[10px] text-emerald-400 font-medium">Anonymous Student</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowNewRoomModal(true)}
              title="Create Study Group Room"
              className="rounded-full p-2 text-neutral-300 hover:bg-[#374248] hover:text-white transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Ephemeral 24hr Notice Banner */}
        <div className="bg-[#182229] px-4 py-2 text-[11px] text-amber-300/90 border-b border-neutral-800/80 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>All chat messages clear after 24hrs</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">Auto-purge</span>
        </div>

        {/* Search Input */}
        <div className="p-2.5 border-b border-neutral-800/80 bg-[#111b21]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start new chat"
              className="w-full rounded-xl bg-[#202c33] py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Room List Scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40">
          {filteredRooms.map((room) => {
            const isSelected = room.id === activeRoom?.id;
            const lastMsg = messages
              .filter((m) => m.roomId === room.id)
              .slice(-1)[0];

            return (
              <button
                key={room.id}
                onClick={() => {
                  onSelectRoom(room.id);
                  setMobileView('chat');
                }}
                className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors ${
                  isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#202c33] text-2xl border border-neutral-700/60">
                  {room.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white truncate">
                      {room.name}
                    </span>
                    {lastMsg && (
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-neutral-400 truncate">
                      {lastMsg
                        ? `${lastMsg.senderAlias}: ${lastMsg.content || '📷 Photo'}`
                        : room.description}
                    </p>
                    <span className="ml-1 text-[10px] text-amber-400/80 font-mono shrink-0">
                      ⏳ 24h
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: WhatsApp Chat Room Window */}
      <div
        className={`flex-1 flex flex-col bg-[#0b141a] min-w-0 ${
          mobileView === 'list' ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Chat Room Top Bar */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-800/80 bg-[#202c33] px-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileView('list')}
              className="sm:hidden -ml-1 mr-0.5 p-1 rounded-full text-neutral-400 hover:text-white"
              title="Back to rooms"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111b21] text-xl border border-neutral-700">
              {activeRoom?.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                <span>{activeRoom?.name}</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400">
                  {activeRoom?.courseCode}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-amber-400" />
                <span>Disappearing in 24 hours · Anonymous Quad</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowRoomInfo(!showRoomInfo)}
              title="Chat Room Info"
              className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-[#374248] transition-colors"
            >
              <Info className="h-5 w-5" />
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  if (confirm(`Admin: Clear all chat history in ${activeRoom?.name}?`)) {
                    onClearRoom(activeRoom.id);
                  }
                }}
                title="Admin: Clear Room History"
                className="rounded-full p-2 text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Room Info Drawer (Toggleable) */}
        {showRoomInfo && (
          <div className="bg-[#182229] p-3 border-b border-neutral-800 text-xs text-neutral-300 flex items-start justify-between">
            <div>
              <p className="font-semibold text-white">{activeRoom.name}</p>
              <p className="text-neutral-400 mt-0.5">{activeRoom.description}</p>
              <p className="text-amber-400 text-[11px] mt-1">
                ⏳ Ephemeral Guarantee: Messages in this room are purged 24 hours after submission.
              </p>
            </div>
            <button
              onClick={() => setShowRoomInfo(false)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Messages Stream with WhatsApp Wallpaper */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {/* Centered 24hr Notice Bubble */}
          <div className="flex justify-center my-2">
            <div className="flex items-center gap-2 rounded-xl bg-[#182229] border border-amber-500/20 px-3 py-1.5 text-[11px] text-amber-300 shadow-sm max-w-md text-center">
              <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>
                Messages disappear 24 hours after being sent. End-to-peer anonymous chatter.
              </span>
            </div>
          </div>

          {/* Messages list */}
          {roomMessages.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-500">
              No messages in the last 24 hours. Start the discussion!
            </div>
          ) : (
            roomMessages.map((msg) => {
              const isMe = msg.senderId === currentDeviceId;
              const expiryText = formatExpiryCountdown(msg.createdAt);

              return (
                <div
                  key={msg.id}
                  className={`group relative flex flex-col ${
                    isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* WhatsApp Message Bubble */}
                  <div
                    className={`relative max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm text-sm transition-all ${
                      isMe
                        ? 'bg-[#005c4b] text-neutral-100 rounded-tr-none'
                        : 'bg-[#202c33] text-neutral-100 rounded-tl-none'
                    }`}
                  >
                    {/* Incoming Sender Alias & Avatar */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                        <span>{msg.senderAvatar}</span>
                        <span style={{ color: msg.senderColor }}>{msg.senderAlias}</span>
                      </div>
                    )}

                    {/* Quoted Message (if reply) */}
                    {msg.replyTo && (
                      <div className="mb-2 rounded-lg bg-black/25 border-l-4 border-emerald-400 p-2 text-xs">
                        <span className="font-semibold text-emerald-400 block text-[11px]">
                          {msg.replyTo.senderAlias}
                        </span>
                        <p className="text-neutral-300 truncate text-[11px]">
                          {msg.replyTo.content}
                        </p>
                      </div>
                    )}

                    {/* Attached Photo / Picture */}
                    {msg.imageUrl && (
                      <div className="mb-2 overflow-hidden rounded-xl bg-black/40 border border-neutral-700/50 max-w-sm">
                        <img
                          src={msg.imageUrl}
                          alt="Attached Photo"
                          loading="lazy"
                          onClick={() => setViewingImageUrl(msg.imageUrl!)}
                          className="max-h-72 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        />
                      </div>
                    )}

                    {/* Message Content */}
                    {msg.content && (
                      <p className="leading-relaxed whitespace-pre-wrap break-words text-[13px]">
                        {msg.content}
                      </p>
                    )}

                    {/* Bottom Meta Row: Time, Expiry, Checkmarks */}
                    <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-neutral-400">
                      {/* Expiry countdown badge */}
                      <span className="font-mono text-neutral-400/80 text-[10px]">
                        ⏳ {expiryText}
                      </span>
                      <span>·</span>
                      <span className="font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && (
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-300 stroke-[2.5]" />
                      )}
                    </div>

                    {/* Reaction Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(msg.reactions).map(([emoji, users]) => {
                          if (users.length === 0) return null;
                          const hasReacted = users.includes(currentDeviceId);
                          return (
                            <button
                              key={emoji}
                              onClick={() => onToggleReaction(msg.id, emoji)}
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border transition-colors ${
                                hasReacted
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-white font-bold'
                                  : 'bg-black/30 border-neutral-700/60 text-neutral-300'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="font-mono">{users.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Floating Hover Reaction Bar */}
                    <div
                      className={`absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1 rounded-full bg-[#111b21] border border-neutral-700 p-1 shadow-lg ${
                        isMe ? 'right-0' : 'left-0'
                      }`}
                    >
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => onToggleReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform text-xs p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        onClick={() => setReplyingTo(msg)}
                        title="Reply / Quote"
                        className="rounded-full p-1 text-neutral-400 hover:text-white"
                      >
                        <Reply className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Quote Banner */}
        {replyingTo && (
          <div className="flex items-center justify-between border-t border-neutral-800 bg-[#202c33] px-4 py-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-300 truncate">
              <Reply className="h-4 w-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-emerald-400">{replyingTo.senderAlias}:</span>{' '}
                <span className="text-neutral-300">{replyingTo.content}</span>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom Input Controls (WhatsApp Style) */}
        <div className="relative border-t border-neutral-800/80 bg-[#202c33] p-3 shrink-0">
          {/* Quick Emoji Picker Drawer */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-20 flex items-center gap-2 rounded-2xl bg-[#182229] border border-neutral-700 p-2 shadow-xl">
              {['😀', '😂', '🔥', '📚', '☕', '😭', '💀', '🎉', '🧠', '💡'].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    setInputText((prev) => prev + e);
                    setShowEmojiPicker(false);
                  }}
                  className="hover:scale-125 transition-transform text-lg p-1"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {/* Attached Picture Preview Strip */}
          {attachedImage && (
            <div className="relative mb-2.5 inline-flex items-center gap-2.5 rounded-2xl bg-[#111b21] border border-neutral-700 p-2 shadow-lg">
              <img
                src={attachedImage}
                alt="Selected preview"
                className="h-16 w-20 rounded-xl object-cover border border-neutral-700"
              />
              <div className="text-xs text-neutral-300 pr-2">
                <span className="text-[11px] font-bold text-emerald-400 block">Picture Ready</span>
                <span className="text-[10px] text-neutral-400">Clears in 24 hours</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="rounded-full bg-neutral-800 p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-[#374248] transition-colors"
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Picture Attachment Button */}
            <label
              title="Attach photo / picture"
              className="cursor-pointer rounded-full p-2 text-neutral-400 hover:text-emerald-400 hover:bg-[#374248] transition-colors"
            >
              <ImageIcon className="h-5 w-5" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileSelect}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isCompressingImage
                  ? 'Compressing picture...'
                  : attachedImage
                  ? 'Add a caption (optional)...'
                  : 'Type an anonymous message (disappears in 24h)...'
              }
              maxLength={400}
              className="flex-1 rounded-2xl bg-[#2a3942] px-4 py-2.5 text-sm text-white placeholder-neutral-400 focus:outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedImage) || isCompressingImage}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-neutral-950 font-bold transition-transform active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shrink-0 shadow-md shadow-emerald-500/20"
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* MODAL: Create New Class Chatroom */}
      {showNewRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <span>Create Class Chatroom</span>
              </h3>
              <button
                onClick={() => setShowNewRoomModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoomSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS 101 Midterm Crammers"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS 101"
                    value={newRoomCourse}
                    onChange={(e) => setNewRoomCourse(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">
                    Room Emoji
                  </label>
                  <input
                    type="text"
                    value={newRoomIcon}
                    onChange={(e) => setNewRoomIcon(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white text-center focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">
                  Topic Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discussing problem sets and exam prep."
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-amber-300 text-[11px]">
                ⏳ All messages in this new room will automatically expire after 24 hours.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewRoomModal(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 font-bold text-neutral-950 hover:bg-emerald-400 transition-colors"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN IMAGE LIGHTBOX MODAL */}
      {viewingImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setViewingImageUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <a
                href={viewingImageUrl}
                download="faceless_image.jpg"
                className="rounded-full bg-black/75 p-2 text-white hover:bg-neutral-800 transition-colors shadow-md"
                title="Download photo"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                onClick={() => setViewingImageUrl(null)}
                className="rounded-full bg-black/75 p-2 text-white hover:bg-neutral-800 transition-colors shadow-md"
                title="Close photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={viewingImageUrl}
              alt="High resolution shared view"
              className="max-h-[85vh] w-auto max-w-full object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
