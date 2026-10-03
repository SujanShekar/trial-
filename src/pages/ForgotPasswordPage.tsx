import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, KeyRound, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        notify(data.message || 'OTP sent to your email', 'success');
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
        notify(data.error || 'Failed to send OTP', 'error');
      }
    } catch (err) {
      setError('Server connection failed');
      notify('Server connection failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue })
      });
      const data = await res.json();
      if (res.ok) {
        notify(data.message || 'OTP Verified', 'success');
        setStep(3);
      } else {
        setError(data.error || 'Invalid OTP');
        notify(data.error || 'Invalid OTP', 'error');
      }
    } catch (err) {
      setError('Server connection failed');
      notify('Server connection failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        notify('Password reset successful! Please login with your new password.', 'success');
        navigate('/');
      } else {
        setError(data.error || 'Failed to reset password');
        notify(data.error || 'Failed to reset password', 'error');
      }
    } catch (err) {
      setError('Server connection failed');
      notify('Server connection failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      for (let i = 0; i < pastedOtp.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedOtp[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(index + pastedOtp.length, 5);
      otpRefs.current[nextFocus]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const leftSideImageUrl = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=2069";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EBFDFA]">
      {/* Left Side: Visuals */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
          style={{ backgroundImage: `url(${leftSideImageUrl})` }}
        >
          <div className="absolute inset-0 bg-[#1A3F33]/40 backdrop-blur-[0.5px]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 lg:px-28 text-white">
          <h1 className="text-6xl font-black mb-6 leading-tight tracking-tight">
            People For Animals <br /> Mysuru
          </h1>
          <p className="text-xl font-medium max-w-lg opacity-90 leading-relaxed">
            Helping you regain access to the sanctuary portal. Secure and verified recovery process.
          </p>
        </div>
      </div>

      {/* Right Side: Reset Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-lg space-y-10">
          <div className="text-left mb-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Check your inbox"}
              {step === 3 && "Reset Password"}
            </h2>
            <p className="text-slate-500 font-medium text-lg mt-2">
              {step === 1 && "Enter your registered email to receive a verification code."}
              {step === 2 && "Enter the 6-digit code sent to your email."}
              {step === 3 && "Enter your new password."}
            </p>
          </div>

          <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-white/50">
            {error && (
              <div className="p-4 mb-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-black uppercase tracking-tight">
                  {error}
                </p>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-800 ml-1">Staff Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#43937c]/20 focus:border-[#43937c] transition-all text-sm font-bold text-black placeholder:text-slate-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#43937c] hover:bg-[#387c69] disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/10 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                  Send Verification Code
                </button>

                <div className="text-center pt-2">
                  <Link 
                    to="/"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-[#43937c] font-black text-sm uppercase tracking-widest transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="text-center space-y-6 py-4 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#43937c]">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    We've sent a verification code to <span className="font-bold text-slate-800">{email}</span>.
                  </p>
                </div>
                <div className="pt-4 space-y-4">
                   <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Enter Verification Code</p>
                      <div className="flex justify-center gap-2">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => otpRefs.current[i] = el}
                            type="text"
                            maxLength={1}
                            className="w-10 h-12 text-center text-xl font-bold bg-white border-b-2 border-slate-300 focus:border-[#43937c] focus:outline-none rounded transition-colors"
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          />
                        ))}
                      </div>
                   </div>
                   <button 
                     onClick={handleVerifyOtp}
                     disabled={isLoading || otp.join('').length !== 6}
                     className="w-full bg-[#005F54] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#004a42] disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                   >
                     {isLoading && <Loader2 size={16} className="animate-spin" />}
                     Verify Code
                   </button>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest pt-4 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-800 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#43937c]/20 focus:border-[#43937c] transition-all text-sm font-bold text-black placeholder:text-slate-300"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-800 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#43937c]/20 focus:border-[#43937c] transition-all text-sm font-bold text-black placeholder:text-slate-300"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#43937c] hover:bg-[#387c69] disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/10 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-widest mt-6"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                  Update Password
                </button>
              </form>
            )}

          </div>
          
          <div className="pt-8 border-t border-slate-100 flex justify-between items-center opacity-40">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
              Sanctuary Security Protocol v2.8.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
