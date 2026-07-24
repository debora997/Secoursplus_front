"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface UserData {
  id: number;
  nomComplet: string;
}

// ⚠️ Composant sorti EN DEHORS de la page.
// Défini à l'intérieur, il était recréé à chaque render du parent,
// ce qui faisait perdre le focus de l'input à chaque frappe.
function PasswordInput({
  label,
  value,
  onChange,
  visible,
  toggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  toggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-12 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangerMotDePassePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);

  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");

    if (!saved) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(saved));
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!ancienMotDePasse) {
      setError("Veuillez saisir votre ancien mot de passe.");
      return;
    }

    if (!nouveauMotDePasse) {
      setError("Veuillez saisir votre nouveau mot de passe.");
      return;
    }

    if (nouveauMotDePasse.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (nouveauMotDePasse !== confirmation) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/auth/profil/${user?.id}/motdepasse`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ancienMotDePasse,
            nouveauMotDePasse,
          }),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setSuccess("Mot de passe modifié avec succès.");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
    } catch {
      setError("Ancien mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-gray-50 p-8">
      <div className="mx-auto max-w-xl">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3">
              <ShieldCheck className="text-red-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Changer le mot de passe
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Votre compte sera mieux protégé avec un nouveau mot de passe.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <PasswordInput
              label="Ancien mot de passe"
              value={ancienMotDePasse}
              onChange={setAncienMotDePasse}
              visible={showOld}
              toggle={() => setShowOld(!showOld)}
            />

            <PasswordInput
              label="Nouveau mot de passe"
              value={nouveauMotDePasse}
              onChange={setNouveauMotDePasse}
              visible={showNew}
              toggle={() => setShowNew(!showNew)}
            />

            <PasswordInput
              label="Confirmer le nouveau mot de passe"
              value={confirmation}
              onChange={setConfirmation}
              visible={showConfirm}
              toggle={() => setShowConfirm(!showConfirm)}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Modification...
                </>
              ) : (
                "Enregistrer le nouveau mot de passe"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}