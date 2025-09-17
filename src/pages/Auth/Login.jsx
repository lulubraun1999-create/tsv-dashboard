import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";


export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/aktuelles";
  const onSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    try {
      await login({ email, password });
      nav(from, { replace: true });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-neutral-900 dark:text-white px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Anmelden</h1>
        <input name="email" type="email" placeholder="E-Mail" className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700" />
        <input name="password" type="password" placeholder="Passwort" className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700" />
        <button className="w-full bg-neutral-900 text-white py-2 dark:bg-white dark:text-black">Login</button>
        <div className="flex justify-between text-sm">
          <Link to="/forgot">Passwort vergessen?</Link>
          <Link to="/register">Registrieren</Link>
        </div>
      </form>
    </div>
  );
}
