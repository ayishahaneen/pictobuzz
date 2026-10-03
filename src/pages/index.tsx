import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AVATAR_PRESETS } from '@/components/Avatar';
import { DoodlePencil } from '@/components/PaintDoodles';
import { soundManager } from '@/lib/audio';
import { User, Lock, Mail, Eye, EyeOff, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { user, login, register, playAsGuest, isLoading } = useAuth();

  const [isLoginTab, setIsLoginTab] = useState(true);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_1');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPassword = loginPassword;

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Please enter your username/email and password.');
      soundManager.playWrong();
      return;
    }

    setIsSubmitting(true);
    const result = await login(cleanIdentifier, cleanPassword);
    setIsSubmitting(false);

    if (result.success) {
      soundManager.playCorrect();
      router.push('/dashboard');
    } else {
      setErrorMessage(result.error || 'Invalid username/email or password.');
      soundManager.playWrong();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUsername = registerUsername.trim();
    const cleanEmail = registerEmail.trim().toLowerCase();
    const cleanPassword = registerPassword;
    const cleanConfirm = registerConfirmPassword;

    if (!cleanUsername || !cleanEmail || !cleanPassword || !cleanConfirm) {
      setErrorMessage('Please fill in all fields.');
      soundManager.playWrong();
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      soundManager.playWrong();
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      soundManager.playWrong();
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setErrorMessage('Passwords do not match. Please ensure both password fields are identical.');
      soundManager.playWrong();
      return;
    }

    setIsSubmitting(true);
    const result = await register(cleanUsername, cleanEmail, cleanPassword, selectedAvatar);
    setIsSubmitting(false);

    if (result.success) {
      soundManager.playCorrect();
      router.push('/dashboard');
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
      soundManager.playWrong();
    }
  };

  const handleGuestPlay = async () => {
    setIsSubmitting(true);
    soundManager.playPop();
    const result = await playAsGuest();
    setIsSubmitting(false);
    if (result.success) {
      soundManager.playCorrect();
      router.push('/dashboard');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) return;

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      setForgotStatus(data.message || 'If an account exists, a reset link has been sent to your email.');
      soundManager.playPop();
    } catch {
      setForgotStatus('Unable to process password reset at this time.');
    }
  };

  const passwordsMatch = registerPassword && registerConfirmPassword && registerPassword === registerConfirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 relative">
      {/* Centered Sketchbook Card matching Screen 1 */}
      <div className="relative w-full max-w-md bg-sketch-paper rounded-[38px] p-6 sm:p-8 border-4 border-slate-900 shadow-sketch-lg text-slate-900 overflow-hidden">
        
        {/* Floating Pencil doodle */}
        <div className="absolute -bottom-2 -right-2 z-20 pointer-events-none">
          <DoodlePencil className="w-20 h-20" />
        </div>

        {/* Cute Smiley Sketch on bottom left */}
        <div className="absolute bottom-4 left-4 text-slate-400 font-bold text-2xl select-none pointer-events-none">
          😊
        </div>

        {/* Logo Title Banner */}
        <div className="text-center mb-6">
          <div className="relative inline-block px-8 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-3xl border-3 border-slate-900 shadow-sketch transform -rotate-1 mb-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-slate-950 uppercase font-doodle">
              PICTIONARY
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700 tracking-wider font-sans">
            Draw · Guess · Score · Have Fun!
          </p>
        </div>

        {/* Tabs: Login / Create Account */}
        <div className="flex border-b-2 border-slate-300 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMessage('');
              setSuccessMessage('');
              soundManager.playPop();
            }}
            className={`flex-1 pb-2.5 font-black text-base transition-all font-doodle ${
              isLoginTab
                ? 'text-amber-600 border-b-4 border-amber-500 -mb-0.5'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMessage('');
              setSuccessMessage('');
              soundManager.playPop();
            }}
            className={`flex-1 pb-2.5 font-black text-base transition-all font-doodle ${
              !isLoginTab
                ? 'text-amber-600 border-b-4 border-amber-500 -mb-0.5'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-100 border-2 border-rose-400 text-rose-700 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-wiggle">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-100 border-2 border-emerald-400 text-emerald-700 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {isLoginTab ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username/Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Username or Email"
                required
                autoComplete="username"
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
                className="w-full pl-11 pr-11 py-3 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-lg rounded-2xl border-3 border-slate-900 shadow-sketch transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 font-doodle tracking-wider uppercase"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end text-xs font-bold pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  soundManager.playPop();
                }}
                className="text-slate-500 hover:text-slate-800 underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Avatar Selector */}
            <div className="mb-2">
              <label className="block text-xs font-black text-slate-700 mb-1.5 text-center uppercase tracking-wide">
                Pick your Avatar:
              </label>
              <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(p.id);
                      soundManager.playPop();
                    }}
                    className={`p-0.5 rounded-full transition-transform ${
                      selectedAvatar === p.id ? 'ring-3 ring-amber-500 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Avatar id={p.id} size="sm" />
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                placeholder="Choose Username"
                required
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="Email Address"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showRegisterPassword ? 'text' : 'password'}
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showRegisterConfirmPassword ? 'text' : 'password'}
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-2.5 bg-white border-2 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none ${
                  registerConfirmPassword && !passwordsMatch
                    ? 'border-rose-400 focus:border-rose-500'
                    : registerConfirmPassword && passwordsMatch
                    ? 'border-emerald-500 focus:border-emerald-600'
                    : 'border-slate-300 focus:border-amber-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Passwords match helper */}
            {registerConfirmPassword && (
              <div className={`text-[11px] font-bold text-right -mt-2 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-base rounded-2xl border-3 border-slate-900 shadow-sketch transition-all transform hover:-translate-y-0.5 font-doodle tracking-wider uppercase mt-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black text-slate-400">
            <span className="bg-sketch-paper px-3">or</span>
          </div>
        </div>

        {/* Quick Play as Guest Button */}
        <button
          onClick={handleGuestPlay}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-sm rounded-2xl border-2 border-slate-900 shadow-sketch-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-doodle uppercase tracking-wider"
        >
          <Play className="w-4 h-4 fill-slate-950" /> Play Instantly as Guest
        </button>

        {/* Switch tab footer */}
        <div className="mt-4 text-center text-xs font-bold text-slate-600">
          {isLoginTab ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(false);
                  setErrorMessage('');
                  setSuccessMessage('');
                  soundManager.playPop();
                }}
                className="text-sky-600 hover:text-sky-700 underline font-black"
              >
                Create one!
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(true);
                  setErrorMessage('');
                  setSuccessMessage('');
                  soundManager.playPop();
                }}
                className="text-amber-600 hover:text-amber-700 underline font-black"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-splatter">
          <div className="relative w-full max-w-sm bg-sketch-paper rounded-3xl p-6 border-4 border-slate-900 shadow-sketch-lg text-slate-900 text-center">
            <h3 className="text-xl font-black text-slate-900 font-doodle mb-2">
              Reset Password
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Enter your account email to receive a password reset token.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter email address"
                required
                className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none"
              />

              {forgotStatus && (
                <div className="p-2 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl">
                  {forgotStatus}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStatus('');
                  }}
                  className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl border border-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border-2 border-slate-900 shadow-sm"
                >
                  Send Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
