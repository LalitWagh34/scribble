import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotes, createNote, updateNote, deleteNote } from "@/lib/api";
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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchNotes(); }, []);

  // Autosave after 1 second of no typing
  useEffect(() => {
    if (!selectedNote || saved) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content]);

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric"
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a2e] flex flex-col">
        {/* Brand */}
        <div className="p-4 border-b border-white/10">
          <div className="text-white font-medium text-lg">✦ Scribble</div>
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
              selectedNote?.id === note.id
                ? "bg-white/15"
                : "hover:bg-white/8"
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

        {/* Logout */}
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
          <div className="flex items-center gap-1.5">
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
    </div>
  );
}