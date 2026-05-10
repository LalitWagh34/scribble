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

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      handleCreate();
    }
  };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [notes]);

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
    <div className="flex h-screen" style={{ background: "#fff" }}>

      {/* Sidebar */}
      <div className="flex flex-col" style={{ width: "240px", background: "#f7f7f5", borderRight: "1px solid #e8e8e6" }}>

        {/* Workspace Header */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center gap-2 px-3 py-3 hover:bg-black/5 transition-colors"
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ background: "#7F77DD" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium flex-1 text-left truncate" style={{ color: "#37352f" }}>
              {user?.name}'s Space
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "#9b9b9b" }}>
              <path d="M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown */}
          {showProfile && (
            <div className="absolute top-full left-2 right-2 rounded-lg shadow-lg z-50 overflow-hidden" style={{ background: "#fff", border: "1px solid #e8e8e6" }}>
              <div className="px-3 py-3" style={{ borderBottom: "1px solid #e8e8e6" }}>
                <p className="text-sm font-medium" style={{ color: "#37352f" }}>{user?.name}</p>
                <p className="text-xs" style={{ color: "#9b9b9b" }}>{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowSettings(true); setNewName(user?.name || ""); setShowProfile(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 transition-colors"
                style={{ color: "#37352f" }}
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 transition-colors"
                style={{ color: "#37352f" }}
              >
                Log out
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="px-2 py-1">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-black/5 cursor-text transition-colors">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "#9b9b9b", flexShrink: 0 }}>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="text-sm bg-transparent outline-none w-full"
              style={{ color: "#37352f" }}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Private Section */}
        <div className="px-3 pt-4 pb-1 flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: "#9b9b9b" }}>Private</span>
          <button
            onClick={handleCreate}
            className="hover:bg-black/5 rounded p-0.5 transition-colors"
            title="New note"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "#9b9b9b" }}>
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto px-1">
          {notes.length === 0 && (
            <p className="text-xs px-3 py-2" style={{ color: "#9b9b9b" }}>No pages inside</p>
          )}
          {notes
            .filter(note => note.title.toLowerCase().includes(search.toLowerCase()))
            .map((note) => (
              <div
                key={note.id}
                onClick={() => handleSelect(note)}
                className="group flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-colors"
                style={{
                  background: selectedNote?.id === note.id ? "rgba(0,0,0,0.06)" : "transparent",
                  color: "#37352f"
                }}
                onMouseEnter={e => { if (selectedNote?.id !== note.id) e.currentTarget.style.background = "rgba(0,0,0,0.04)" }}
                onMouseLeave={e => { if (selectedNote?.id !== note.id) e.currentTarget.style.background = "transparent" }}
              >
                <span className="text-base" style={{ flexShrink: 0 }}>📄</span>
                <span className="text-sm flex-1 truncate">{note.title || "Untitled"}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/10"
                  style={{ color: "#9b9b9b" }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
        </div>

        {/* Bottom */}
        {/* Bottom */}
        <div className="px-1 py-2" style={{ borderTop: "1px solid #e8e8e6" }}>
          <button
            onClick={handleCreate}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-black/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "#9b9b9b" }}/>
              </svg>
              <span className="text-sm" style={{ color: "#37352f" }}>New page</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#e8e8e6", color: "#9b9b9b" }}>
              Ctrl+N
            </span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-2" style={{ borderBottom: "1px solid #e8e8e6" }}>
              <div className="flex items-center gap-1.5">
                {saved ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-xs" style={{ color: "#9b9b9b" }}>Saved</span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-xs" style={{ color: "#9b9b9b" }}>Saving...</span>
                  </>
                )}
              </div>
              <span className="text-xs" style={{ color: "#9b9b9b" }}>
                {formatDate(selectedNote.updatedAt)}
              </span>
            </div>

            {/* Note Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-16 py-16">
                <input
                  className="w-full text-4xl font-bold outline-none mb-4"
                  style={{ color: "#37352f", border: "none", background: "transparent" }}
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
                  placeholder="Untitled"
                />
                <RichEditor
                  content={content}
                  onChange={(val: string) => { setContent(val); setSaved(false); }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-5xl mb-4">✦</p>
            <p className="text-sm" style={{ color: "#9b9b9b" }}>Select a page or create a new one</p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ background: "#f7f7f5", color: "#37352f", border: "1px solid #e8e8e6" }}
            >
              + New page
            </button>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" style={{ border: "1px solid #e8e8e6" }}>
            <h2 className="text-lg font-medium mb-1" style={{ color: "#37352f" }}>Profile Settings</h2>
            <p className="text-sm mb-6" style={{ color: "#9b9b9b" }}>Update your profile information</p>
            <div className="mb-4">
              <label className="text-xs mb-1 block" style={{ color: "#9b9b9b" }}>Name</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid #e8e8e6", color: "#37352f" }}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="text-xs mb-1 block" style={{ color: "#9b9b9b" }}>Email</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid #e8e8e6", color: "#9b9b9b", background: "#f7f7f5" }}
                value={user?.email}
                disabled
              />
              <p className="text-xs mt-1" style={{ color: "#9b9b9b" }}>Email cannot be changed</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 rounded-lg py-2 text-sm transition-colors"
                style={{ border: "1px solid #e8e8e6", color: "#37352f" }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 rounded-lg py-2 text-sm font-medium text-white transition-colors"
                style={{ background: "#7F77DD" }}
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