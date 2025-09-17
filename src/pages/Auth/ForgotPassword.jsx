import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";


export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const onSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    try {
      await sendPasswordReset(email);
      alert("Wenn die E-Mail existiert, wurde ein Reset-Link gesendet.");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-neutral-900 dark:text-white px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Passwort zurücksetzen</h1>
        <input name="email" type="email" placeholder="E-Mail" className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700" />
        <button className="w-full bg-neutral-900 text-white py-2 dark:bg-white dark:text-black">Link senden</button>
        <div className="text-sm text-right">
          <Link to="/login">Zurück zum Login</Link>
        </div>
      </form>
    </div>
  );
}
