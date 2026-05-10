import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotes, createNote, updateNote, deleteNote, getProfile, updateProfile } from "@/lib/api";
import RichEditor from "../components/ui/RichEditor";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!selectedNote || saved) return;
    const timer = setTimeout(() => { handleSave(); }, 1000);
    return () => clearTimeout(timer);
  }, [title, content]);

  const fetchProfile = async () => {
    const res = await getProfile();
    setUser(res.data.user);
  };

  const fetchNotes = async () => {
    const res = await getNotes();
    setNotes(res.data.notes);
  };

  const handleCreate = async () => {
    const res = await createNote("Untitled", "");
    setNotes([res.data.note, ...notes]);
    handleSelect(res.data.note);
  };

  const handleSelect = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSaved(true);
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    await updateNote(selectedNote.id, title, content);
    setSaved(true);
    fetchNotes();
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    setSelectedNote(null);
    fetchNotes();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleUpdateProfile = async () => {
    await updateProfile(newName);
    await fetchProfile();
    setShowSettings(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric"
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a2e] flex flex-col">

        {/* Profile Header */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center gap-2 p-4 hover:bg-white/5 transition-colors border-b border-white/10"
          >
            <div className="w-7 h-7 rounded-full bg-[#7F77DD] flex items-center justify-center text-white text-xs font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-white text-sm font-medium flex-1 text-left">
              {user?.name}'s Space
            </span>
            <span className="text-white/40 text-xs">▼</span>
          </button>

          {/* Dropdown */}
          {showProfile && (
            <div className="absolute top-full left-0 w-full bg-[#2a2a3e] border border-white/10 rounded-lg shadow-xl z-50 p-2">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-white text-sm font-medium">{user?.name}</p>
                <p className="text-white/40 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowSettings(true); setNewName(user?.name || ""); setShowProfile(false); }}
                className="w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md text-sm transition-colors"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md text-sm transition-colors"
              >
                🚪 Log out
              </button>
            </div>
          )}
        </div>

        {/* New Note Button */}
        <div className="p-3">
          <button
            onClick={handleCreate}
            className="w-full flex items-center gap-2 bg-[#7F77DD] hover:bg-[#6c64c9] text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <span className="text-lg leading-none">+</span> New Note
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <input
            className="w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder-white/30"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {notes.length === 0 && (
            <p className="text-white/30 text-xs text-center mt-8">No notes yet</p>
          )}
          {notes
            .filter(note => note.title.toLowerCase().includes(search.toLowerCase()))
            .map((note) => (
              <div
                key={note.id}
                onClick={() => handleSelect(note)}
                className={`group flex justify-between items-start p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                  selectedNote?.id === note.id ? "bg-white/15" : "hover:bg-white/8"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {note.title || "Untitled"}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">{formatDate(note.updatedAt)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                  className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 text-xs ml-2 transition-all"
                >✕</button>
              </div>
            ))}
        </div>

        {/* Sign out */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full text-white/50 hover:text-white text-sm py-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-1.5 px-8 py-3 border-b bg-white">
              {saved ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-400">All changes saved</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-xs text-gray-400">Saving...</span>
                </>
              )}
            </div>

            {/* Note Content */}
            <div className="flex-1 flex flex-col px-16 py-10 overflow-y-auto bg-white">
              <input
                className="text-3xl font-medium outline-none text-gray-900 mb-6 border-none"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
                placeholder="Untitled"
              />
              <RichEditor
                content={content}
                onChange={(val: string) => { setContent(val); setSaved(false); }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white text-center">
            <div className="text-5xl mb-4">✦</div>
            <p className="text-gray-400 text-sm">Select a note or create a new one</p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-medium mb-1">Profile Settings</h2>
            <p className="text-sm text-gray-400 mb-6">Update your profile information</p>
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Name</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-gray-50 text-gray-400"
                value={user?.email}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 bg-[#7F77DD] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#6c64c9] transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}