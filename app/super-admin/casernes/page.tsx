"use client"; 

import { useEffect, useState } from "react"; 
import { 
  Building2, 
  Phone, 
  MapPin, 
  Shield, 
  Search, 
  RefreshCw, 
  UserRound,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react"; 

import { 
  caserneService, 
  Caserne, 
} from "@/services/CaserneService"; 

export default function CasernesPage() { 
  const [casernes, setCasernes] = useState<Caserne[]>([]); 
  const [filteredCasernes, setFilteredCasernes] = useState<Caserne[]>([]); 
  const [search, setSearch] = useState(""); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadCasernes = async () => { 
    try { 
      setLoading(true); 
      setError(null); 

      const data = await caserneService.getAll(); 

      setCasernes(data); 
      setFilteredCasernes(data); 
    } catch (err) { 
      setError( 
        err instanceof Error 
          ? err.message 
          : "Une erreur est survenue lors du chargement des casernes." 
      ); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  useEffect(() => { 
    loadCasernes(); 
  }, []); 

  useEffect(() => { 
    const value = search.toLowerCase().trim(); 

    if (!value) { 
      setFilteredCasernes(casernes); 
      return; 
    } 

    const filtered = casernes.filter( 
      (caserne) => 
        caserne.caserne?.toLowerCase().includes(value) || 
        caserne.nomComplet?.toLowerCase().includes(value) || 
        caserne.telephone?.toLowerCase().includes(value) || 
        caserne.role?.toLowerCase().includes(value) 
    ); 

    setFilteredCasernes(filtered); 
  }, [search, casernes]); 

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return ( 
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 space-y-6"> 

      {/* En-tête en Blanc */} 
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"> 
        <div className="flex items-center gap-3"> 
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 shrink-0"> 
            <Building2 className="h-6 w-6" /> 
          </div> 

          <div> 
            <h1 className="text-2xl font-bold tracking-tight text-gray-900"> 
              Casernes & Chefs
            </h1> 

            <p className="text-xs text-gray-500 mt-0.5"> 
              Gestion et supervision des postes de secours enregistrés
            </p> 
          </div> 
        </div> 

        <button 
          onClick={loadCasernes} 
          disabled={loading} 
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-50" 
        > 
          <RefreshCw 
            className={`h-4 w-4 ${loading ? "animate-spin text-red-600" : ""}`} 
          /> 
          Actualiser
        </button> 
      </div> 

      {/* Barre de recherche */} 
      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm"> 
        <div className="relative"> 
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /> 

          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Rechercher une caserne, un chef, un téléphone..." 
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" 
          /> 
        </div> 
      </div> 

      {/* Message d'erreur */} 
      {error && ( 
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"> 
          {error} 
        </div> 
      )} 

      {/* Chargement */} 
      {loading && ( 
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 shadow-sm"> 
          <div className="flex items-center gap-3 text-gray-500 text-xs font-medium"> 
            <RefreshCw className="h-5 w-5 animate-spin text-red-600" /> 
            <span>Chargement des casernes...</span> 
          </div> 
        </div> 
      )} 

      {/* Aucune caserne trouvée */} 
      {!loading && !error && filteredCasernes.length === 0 && ( 
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm"> 
          <Building2 className="mx-auto h-10 w-10 text-gray-300" /> 

          <h2 className="mt-3 text-sm font-semibold text-gray-900"> 
            Aucune caserne trouvée 
          </h2> 

          <p className="mt-1 text-xs text-gray-500"> 
            {search 
              ? "Aucun résultat ne correspond à vos critères de recherche." 
              : "Aucune caserne n'est actuellement enregistrée."} 
          </p> 
        </div> 
      )} 

      {/* Liste Horizontale des casernes */} 
      {!loading && filteredCasernes.length > 0 && ( 
        <div className="space-y-3"> 
          {filteredCasernes.map((caserne) => {
            const isExpanded = expandedId === caserne.id;

            return (
              <div 
                key={caserne.id} 
                className="rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 overflow-hidden" 
              > 
                {/* Ligne Horizontale */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                  
                  {/* Nom de la caserne */}
                  <div className="flex items-center gap-3 md:w-1/4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 shrink-0 border border-red-100">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">
                        {caserne.caserne || "Caserne non renseignée"}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono">
                        ID: #{caserne.id}
                      </p>
                    </div>
                  </div>

                  {/* Chef de caserne */}
                  <div className="flex items-center gap-2.5 md:w-1/4">
                    <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 shrink-0">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Chef de caserne</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {caserne.nomComplet || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                  {/* Numéro de Téléphone */}
                  <div className="flex items-center gap-2.5 md:w-1/5">
                    <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Téléphone</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {caserne.telephone || "Non disponible"}
                      </p>
                    </div>
                  </div>

                  {/* Rôle & Bouton Flèche */}
                  <div className="flex items-center justify-between md:justify-end gap-3 md:w-1/4 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600 uppercase border border-gray-200">
                      {caserne.role || "RESPONSABLE"}
                    </span>

                    <button
                      onClick={() => toggleExpand(caserne.id)}
                      className="flex items-center justify-center h-8 w-8 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                      title="Voir plus d'informations"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                </div>

                {/* Tiroir de détails rétractable */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Coordonnées GPS */}
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-red-100 p-2 text-red-600">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase">Position GPS</p>
                          <p className="text-xs font-mono font-medium text-gray-800">
                            {caserne.latitude != null && caserne.longitude != null 
                              ? `${caserne.latitude}, ${caserne.longitude}` 
                              : "Non localisée"}
                          </p>
                        </div>
                      </div>

                      {/* Rôle détaillé */}
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase">Rôle attribué</p>
                          <p className="text-xs font-medium text-gray-800">
                            {caserne.role || "Rôle standard"}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Lien Google Maps */}
                    {caserne.latitude != null && caserne.longitude != null && (
                      <div className="pt-2 border-t border-gray-200/60 flex justify-end">
                        <a
                          href={`https://www.google.com/maps?q=${caserne.latitude},${caserne.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                        >
                          <span>Localiser sur Google Maps</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

              </div> 
            );
          })} 
        </div> 
      )} 

      {/* Compteur bas de page */} 
      {!loading && !error && casernes.length > 0 && ( 
        <div className="text-xs font-medium text-gray-500 text-right"> 
          <span className="font-bold text-gray-800">{filteredCasernes.length}</span> caserne(s) sur <span className="font-bold text-gray-800">{casernes.length}</span>
        </div> 
      )} 

    </div> 
  ); 
}