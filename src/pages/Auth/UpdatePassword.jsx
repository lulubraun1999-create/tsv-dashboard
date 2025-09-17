import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";


export default function UpdatePassword() {
  const { updatePassword } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const pw = e.target.password.value;
    try {
      await updatePassword(pw);
      alert("Passwort aktualisiert.");
      nav("/aktuelles", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-neutral-900 dark:text-white px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Neues Passwort setzen</h1>
        <input name="password" type="password" placeholder="Neues Passwort" className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700" />
        <button className="w-full bg-neutral-900 text-white py-2 dark:bg-white dark:text-black">Speichern</button>
      </form>
    </div>
  );
}
