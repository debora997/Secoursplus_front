"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface InscriptionFormData {
  fullName: string;
  station: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface InscriptionFormErrors {
  fullName?: string;
  station?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const PHONE_REGEX = /^[+]?[\d\s.-]{8,15}$/;

export default function Inscription() {
  const [formData, setFormData] = useState<InscriptionFormData>({
    fullName: "",
    station: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<InscriptionFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  function validate(): InscriptionFormErrors {
    const newErrors: InscriptionFormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Le nom complet est requis.";
    if (!formData.station.trim()) newErrors.station = "La localité est requise.";
    if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis.";
    else if (!PHONE_REGEX.test(formData.phone.trim())) newErrors.phone = "Numéro invalide.";
    if (!formData.password) newErrors.password = "Le mot de passe est requis.";
    else if (formData.password.length < 8) newErrors.password = "8 caractères minimum.";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirmez le mot de passe.";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe diffèrent.";
    return newErrors;
  }

  function updateField(field: keyof InscriptionFormData, value: string): void {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
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
    const response = await fetch("http://localhost:8080/api/auth/inscription", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        nomComplet: formData.fullName,
        telephone: formData.phone,
        caserne: formData.station,
        motDePasse: formData.password,
        }),
    });

    if (!response.ok) {
        throw new Error("Erreur lors de la création de compte, veuillez réessayer.");
    }

    setSuccessMessage(
        "Compte créé avec succès ! Vous pouvez maintenant vous connecter."
    );
    setTimeout(() => {
  router.push("/login");
}, 2000);

    } catch {
    setSubmitError(
     "Erreur lors de la création de compte, veuillez réessayer."
    );
    } finally {
    setIsSubmitting(false);
    }
  }
  

  const inputBase = "w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600/20";
  const inputBorder = (hasError?: string) => hasError ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-red-500";

  return (
    <div className="w-full">
      <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.15)] sm:p-7">
        <div className="mb-3 flex flex-col items-center text-center">
          <img src="/images/logo.png" alt="Secours+" className="mb-3 h-16 w-auto object-contain" />
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Créer un compte</h1>
          <p className="mt-1 text-xs text-gray-500">Rejoignez votre équipe de secours</p>
        </div>

        {submitError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
            <p className="text-xs text-red-700">{submitError}</p>
          </div>
        )}

        {successMessage && (
  <div className="mb-4 rounded-lg border border-green-100 bg-green-50 px-3 py-2">
    <p className="text-xs text-green-700">
      {successMessage}
    </p>
  </div>
)}

        <form onSubmit={handleSubmit} noValidate className="space-y-1">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-xs font-medium text-gray-700">Nom complet</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input id="fullName" type="text" autoComplete="name" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="" className={`${inputBase} ${inputBorder(errors.fullName)}`} />
            </div>
            {errors.fullName && <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="station" className="mb-1 block text-xs font-medium text-gray-700">Caserne</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="station" type="text" autoComplete="address-level2" value={formData.station} onChange={(e) => updateField("station", e.target.value)} placeholder="" className={`${inputBase} ${inputBorder(errors.station)}`} />
              </div>
              {errors.station && <p className="mt-1 text-[11px] text-red-600">{errors.station}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-xs font-medium text-gray-700">Téléphone</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="" className={`${inputBase} ${inputBorder(errors.phone)}`} />
              </div>
              {errors.phone && <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={formData.password} onChange={(e) => updateField("password", e.target.value)} placeholder="••••••••" className={`${inputBase} pr-9 ${inputBorder(errors.password)}`} />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} tabIndex={-1} aria-label={showPassword ? "Masquer" : "Afficher"} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-red-600">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-gray-700">Confirmer</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} placeholder="••••••••" className={`${inputBase} pr-9 ${inputBorder(errors.confirmPassword)}`} />
                <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} tabIndex={-1} aria-label={showConfirmPassword ? "Masquer" : "Afficher"} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-[11px] text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Création...</>) : "S'inscrire"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-red-600 hover:text-red-700">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}