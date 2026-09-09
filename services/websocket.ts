import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// =========================================================
// URL DU BACKEND
// =========================================================

const RAW_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Supprime /api ou /api/ à la fin si présent
const BACKEND_HOST = RAW_URL.replace(/\/api\/?$/, "");

// =========================================================
// CLIENT STOMP UNIQUE & ÉTATS GLOBAUX
// =========================================================

let client: Client | null = null;

// Liste des callbacks du dashboard (Pattern Pub/Sub)
const alertListeners = new Set<(alert: any) => void>();

// Subscription STOMP unique
let subscription: StompSubscription | null = null;

// =========================================================
// CRÉATION DU CLIENT
// =========================================================

function createClient(): Client {
  const stompClient = new Client({
    webSocketFactory: () => {
      console.log(`🔌 Connexion vers ${BACKEND_HOST}/ws`);
      return new SockJS(`${BACKEND_HOST}/ws`);
    },

    reconnectDelay: 5000,

    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    debug: (message) => {
      // Décommentez pour voir tous les frames STOMP bas niveau
      // console.log("STOMP:", message);
    },

    onConnect: () => {
      console.log("🟢 WebSocket STOMP connecté avec succès.");

      // Nettoie un éventuel abonnement résiduel avant de ré-s'abonner
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch {
          // Ignorer si la session était déjà fermée
        }
        subscription = null;
      }

      // Inscription au canal général des alertes
      subscription = stompClient.subscribe(
        "/topic/alertes",
        (message) => {
          try {
            const alert = JSON.parse(message.body);

            console.log(
              "🚨 Nouvelle alerte reçue via WebSocket :",
              alert
            );

            // Diffuse l'alerte à tous les listeners enregistrés
            alertListeners.forEach((listener) => {
              try {
                listener(alert);
              } catch (error) {
                console.error(
                  "❌ Erreur dans le listener WebSocket :",
                  error
                );
              }
            });
          } catch (error) {
            console.error(
              "❌ Erreur de parsing JSON de l'alerte :",
              error
            );
          }
        }
      );

      console.log("📡 Abonné à /topic/alertes");
    },

    onStompError: (frame) => {
      console.error(
        "🔴 Erreur STOMP :",
        frame.headers["message"],
        frame.body
      );
    },

    onWebSocketClose: () => {
      console.log("🔌 Connexion WebSocket fermée.");
      subscription = null;
    },

    onWebSocketError: (error) => {
      console.error("❌ Erreur WebSocket :", error);
    },
  });

  return stompClient;
}

// =========================================================
// CONNEXION & SOUCRIPTION LISTENER
// =========================================================

export const connectWebSocket = (
  onAlertReceived: (alert: any) => void
) => {
  // Protection SSR (Server-Side Rendering Next.js)
  if (typeof window === "undefined") {
    return () => {};
  }

  // Ajoute le listener
  alertListeners.add(onAlertReceived);

  // Crée le client une seule fois (Singleton)
  if (!client) {
    client = createClient();
  }

  // Active le client s'il n'est pas encore actif
  if (!client.active) {
    console.log("🚀 Activation du WebSocket...");
    client.activate();
  } else {
    console.log("ℹ️ WebSocket déjà actif.");
  }

  // =======================================================
  // CLEANUP DU COMPOSANT (useEffect return)
  // =======================================================

  return () => {
    // Retire uniquement le listener du composant démonté
    alertListeners.delete(onAlertReceived);
    console.log("🧹 Listener WebSocket supprimé.");

    // S'il n'y a plus aucun composant à l'écoute, on ferme la connexion
    if (alertListeners.size === 0 && client) {
      console.log(
        "🛑 Aucun listener restant → désactivation du WebSocket."
      );

      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch {
          // Ignorer
        }
        subscription = null;
      }

      client.deactivate();
      client = null;
    }
  };
};

// =========================================================
// DÉCONNEXION COMPLÈTE (Déconnexion utilisateur / Logout)
// =========================================================

export const disconnectWebSocket = async () => {
  if (!client) {
    return;
  }

  console.log("🛑 Déconnexion complète du WebSocket...");

  alertListeners.clear();

  if (subscription) {
    try {
      subscription.unsubscribe();
    } catch {
      // Ignorer
    }
    subscription = null;
  }

  await client.deactivate();
  client = null;

  console.log("✅ WebSocket complètement désactivé.");
};