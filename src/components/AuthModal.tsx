import React, { useState } from 'react';
import { X, User, Lock, Phone, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { validateEmail, signInWithSupabase, signUpWithSupabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLoginSuccess: (name: string, email: string, role?: 'user' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
}) => {
  const t = TRANSLATIONS[language];
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // REQUIREMENT 1 & 2: Email validation + Secure Email & Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // REQUIREMENT 1: Validate email address
    if (!validateEmail(email)) {
      setErrorMessage(t.invalidEmail);
      return;
    }

    if (!password) {
      setErrorMessage(t.invalidCredentials);
      return;
    }

    setIsLoading(true);

    if (isRegister) {
      if (password.length < 6) {
        setIsLoading(false);
        setErrorMessage(t.passwordTooShort);
        return;
      }

      const res = await signUpWithSupabase(email, password, {
        name: name.trim() || 'Mela User',
        phone: phone.trim() || '0904503245',
      });

      setIsLoading(false);

      if (res.error) {
        if (res.error === 'INVALID_EMAIL') {
          setErrorMessage(t.invalidEmail);
        } else if (res.error === 'EMAIL_ALREADY_REGISTERED') {
          setErrorMessage(t.emailAlreadyRegistered);
        } else if (res.error === 'PASSWORD_TOO_SHORT') {
          setErrorMessage(t.passwordTooShort);
        } else {
          setErrorMessage(res.error);
        }
        return;
      }

      if (res.user) {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(res.user!.name, res.user!.email, res.user!.role);
          setSuccess(false);
          onClose();
        }, 800);
      }
    } else {
      // REQUIREMENT 2: Secure Email & Password Authentication
      // Users must only log in when BOTH email and password are correct.
      // Deny login with "Invalid email or password." if either is incorrect.
      const res = await signInWithSupabase(email, password);

      setIsLoading(false);

      if (res.error) {
        if (res.error === 'INVALID_EMAIL') {
          setErrorMessage(t.invalidEmail);
        } else {
          // Exact required message: "Invalid email or password."
          setErrorMessage(t.invalidCredentials);
        }
        return;
      }

      if (res.user) {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(res.user!.name, res.user!.email, res.user!.role);
          setSuccess(false);
          onClose();
        }, 800);
      }
    }
  };

  const handleAdminQuickFill = () => {
    setEmail('admin@melamarket.com');
    setPassword('admin123456');
    setName('Admin Mela');
    setIsRegister(false);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              {isRegister ? t.register : t.login}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">
                {isRegister ? t.register : t.login}
              </h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert Box */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.fullName}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Abebe Kebede"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.phoneNumber}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="09..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <span>{isRegister ? t.register : t.login}</span>
                )}
              </button>

              <div className="text-center pt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setErrorMessage(null);
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer block mx-auto"
                >
                  {isRegister ? t.alreadyHaveAccount : t.dontHaveAccount}
                </button>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleAdminQuickFill}
                    className="text-[11px] text-slate-500 hover:text-emerald-700 underline cursor-pointer"
                  >
                    Quick-Fill Admin Account (admin@melamarket.com)
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
