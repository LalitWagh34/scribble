import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signin } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await signin(email, password);
      localStorage.setItem("token", res.data.token);
      navigate("/notes");
    } catch (e) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-center flex-1 bg-[#1a1a2e] p-12">
        <div className="text-white text-3xl font-medium mb-2">✦ Scribble</div>
        <div className="text-white/50 text-sm">Your personal notes workspace</div>
        <div className="mt-8 space-y-3">
          {[["60%","90%","75%"],["45%","80%","65%"]].map((lines, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
              {lines.map((w, j) => (
                <div key={j} className="h-2 bg-white/15 rounded-full" style={{ width: w }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center flex-1 p-12">
        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-2xl font-medium mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your account to continue</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Password</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button onClick={handleLogin} className="w-full bg-[#7F77DD] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#6c64c9] transition-colors">
              Sign in
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#7F77DD]">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}