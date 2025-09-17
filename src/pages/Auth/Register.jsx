// src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function Register() {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    codeword: '',
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk(false);
    setMessage('');
    setLoading(true);

    try {
      // Aufruf deiner Edge Function "register"
      const { data, error } = await supabase.functions.invoke('register', {
        body: {
          email: form.email.trim(),
          password: form.password,
          firstname: form.firstname.trim(),
          lastname: form.lastname.trim(),
          codeword: form.codeword.trim(),
        },
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        // Fehler vom Functions-Gateway
        setOk(false);
        setMessage(error.message || 'Unbekannter Fehler beim Aufruf.');
      } else if (data?.error) {
        // Fehler, den die Function selbst zurückgibt
        setOk(false);
        setMessage(String(data.error));
      } else if (data?.ok) {
        setOk(true);
        setMessage(`Registrierung erfolgreich. userId: ${data.userId}`);
        setForm({ firstname: '', lastname: '', email: '', password: '', codeword: '' });
      } else {
        setOk(false);
        setMessage('Unerwartete Antwort.');
      }
    } catch (err) {
      setOk(false);
      setMessage(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Registrieren</h1>

      {message && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            ok ? 'border-emerald-300 text-emerald-800 bg-emerald-50' : 'border-rose-300 text-rose-800 bg-rose-50'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vorname</label>
            <input
              name="firstname"
              value={form.firstname}
              onChange={onChange}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600"
              placeholder="Max"
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nachname</label>
            <input
              name="lastname"
              value={form.lastname}
              onChange={onChange}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600"
              placeholder="Mustermann"
              autoComplete="family-name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-Mail</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            placeholder="max@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Passwort</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            minLength={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            placeholder="•••••••"
            autoComplete="new-password"
          />
          <p className="text-xs text-neutral-500 mt-1">Mindestens 6 Zeichen.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Codewort</label>
          <input
            name="codeword"
            value={form.codeword}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            placeholder="Codewort"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Nur wer das Codewort kennt darf sich registrieren.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Wird gesendet…' : 'Registrieren'}
          </button>
        </div>
      </form>
    </div>
  );
}
