"use client";

import { useState, type FormEvent } from "react";
import { User, Lock, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginData {
  fullName: string;
  password: string;
}

interface LoginErrors {
  fullName?: string;
  password?: string;
}

export default function Login() {

  const [formData, setFormData] = useState<LoginData>({
    fullName: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  

  function validate(): LoginErrors {
    const newErrors: LoginErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Le nom complet est requis.";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    }

    return newErrors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

        try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        nomComplet: formData.fullName,
        motDePasse: formData.password,
        }),
    });

    if (!response.ok) {
    throw new Error("Identifiants incorrects");
}

const user = await response.json();

localStorage.setItem("user", JSON.stringify(user));

setSuccessMessage(
    "Connexion réussie ! Redirection vers le tableau de bord..."
);

setTimeout(() => {
    router.push("/dashboard");
}, 2000);

    } catch {
    setSubmitError(
     "Identifiants incorrects. Vérifiez votre nom et votre mot de passe."
    );
    } finally {
    setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}
      {successMessage && (
  <div className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
    <p className="text-sm text-green-700">
      {successMessage}
    </p>
  </div>
)}

      {/* Nom complet */}
      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Nom complet
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder=""
            className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600/20 ${
              errors.fullName
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-red-500"
            }`}
          />
        </div>
        {errors.fullName && (
          <p className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="••••••••"
            className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600/20 ${
              errors.password
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-red-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            tabIndex={-1}
            aria-label={
              showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4.5 w-4.5" />
            ) : (
              <Eye className="h-4.5 w-4.5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}