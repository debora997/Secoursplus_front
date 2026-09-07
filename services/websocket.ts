import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// =========================================================
// ADRESSE DU BACKEND
// Remplace cette valeur par l'IP de ton PC si tu testes sur le réseau local
// Exemple : "http://192.168.1.50:8080"
// =========================================================
const BACKEND_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let client: Client | null = null;

export const connectWebSocket = (onAlertReceived: (alert: any) => void) => {
  // 1. Instanciation du client STOMP unique
  if (!client) {
    client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_HOST}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("🟢 WebSocket STOMP connecté avec succès.");
      },

      onStompError: (frame) => {
        console.error("🔴 Erreur STOMP :", frame.headers["message"], frame.body);
      },

      onWebSocketClose: () => {
        console.log("🔌 Connexion WebSocket fermée.");
      },
    });
  }

  // 2. Activer le client s'il ne l'est pas encore
  if (!client.active) {
    client.activate();
  }

  // 3. Gestion de la souscription
  let subscription: any = null;

  const subscribeToTopic = () => {
    if (client && client.connected) {
      subscription = client.subscribe("/topic/alertes", (message) => {
        try {
          const alert = JSON.parse(message.body);
          console.log("🚨 Nouvelle alerte reçue via WebSocket :", alert);
          onAlertReceived(alert);
        } catch (error) {
          console.error("❌ Erreur de parsing JSON de l'alerte :", error);
        }
      });
    }
  };

  // Si déjà connecté, on s'abonne immédiatement
  if (client.connected) {
    subscribeToTopic();
  } else {
    // Sinon, on attend l'événement de connexion
    const originalOnConnect = client.onConnect;
    client.onConnect = (frame) => {
      if (originalOnConnect) originalOnConnect(frame);
      subscribeToTopic();
    };
  }

  // 4. Fonction de cleanup retournée à useEffect pour annuler l'abonnement
  return () => {
    if (subscription) {
      subscription.unsubscribe();
      console.log("🧹 Désabonnement du topic /topic/alertes");
    }
  };
};

export const disconnectWebSocket = () => {
  if (client) {
    client.deactivate();
    client = null;
    console.log("🛑 Client WebSocket complètement désactivé.");
  }
};