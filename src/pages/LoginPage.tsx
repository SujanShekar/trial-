import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User } from "../types";
import {
  Eye,
  EyeOff,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { saveAuthToken } from "../lib/api";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { notify } = useNotification();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    if (!emailRegex.test(identifier)) {
      setError("Please enter a valid email address.");
      notify("Invalid email format", "error");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: identifier,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (!data.token) {
          throw new Error("Login response did not include an authentication token");
        }
        notify("Welcome back!", "success");

        const userToLogin: User = {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          phone: data.phone,
        };

        localStorage.setItem("pfa_user_session", JSON.stringify(userToLogin));
        saveAuthToken(data.token);

        onLogin(userToLogin);
      } else {
        const msg = data.error || "Invalid credentials.";

        setError(msg);
        notify(msg, "error");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError("Server connection failed.");
      notify("Authentication service currently unavailable", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const leftSideImageUrl =
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=2043";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EBFDFA]">
      {/* Left Side */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
          style={{
            backgroundImage: `url(${leftSideImageUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-[#1A3F33]/40 backdrop-blur-[0.5px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 lg:px-28 text-white">
          <h1 className="text-6xl font-black mb-6 leading-tight tracking-tight">
            People For Animals
            <br />
            Mysuru
          </h1>

          <p className="text-xl font-medium max-w-lg opacity-90 leading-relaxed">
            Join us in making a difference in the lives of animals. Together, we
            rescue, rehabilitate, and rehome.
          </p>
        </div>
      </div>

      {/* Login Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-lg space-y-10">
          {/* Header */}
          <div className="text-left mb-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h2>

            <p className="text-slate-500 font-medium text-lg mt-2">
              Login with your Email
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-white/50">
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Error */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0" />

                  <p className="text-xs font-black uppercase tracking-tight">
                    {error}
                  </p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-800 ml-1">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />

                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl border bg-white focus:outline-none focus:ring-2 transition-all text-sm font-bold text-black placeholder:text-slate-300 ${
                      identifier.length > 0
                        ? emailRegex.test(identifier)
                          ? "border-emerald-300 focus:ring-emerald-200 focus:border-emerald-500"
                          : "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200 focus:ring-[#43937c]/20 focus:border-[#43937c]"
                    }`}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />

                  {identifier.length > 0 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {emailRegex.test(identifier) ? (
                        <CheckCircle className="text-emerald-500" size={20} />
                      ) : (
                        <AlertCircle className="text-rose-500" size={20} />
                      )}
                    </div>
                  )}
                </div>

                {identifier.length > 0 && !emailRegex.test(identifier) && (
                  <p className="text-xs text-rose-500 font-bold ml-1">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-black text-slate-800">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-[#43937c] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full px-5 py-4 pr-12 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#43937c]/20 focus:border-[#43937c] transition-all text-sm font-bold text-black placeholder:text-slate-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#43937c] hover:bg-[#387c69] disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/10 transition-all duration-300 active:scale-[0.98] mt-6 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Login Now"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-slate-100 flex justify-between items-center opacity-40">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
              Sanctuary Ops v2.8.0
            </p>

            <div className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
