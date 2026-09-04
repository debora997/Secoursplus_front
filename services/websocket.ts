import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client: Client | null = null;

export const connectWebSocket = (onAlertReceived: (alert: any) => void) => {
  // 1. Éviter de recréer une connexion si elle existe déjà et est active
  if (client && client.active) {
    return;
  }

  // 2. Création de l'instance locale pour éviter les conflits de portée
  const stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("WebSocket connecté 🚨");

      // 3. Vérifier explicitement l'état `connected` sur l'instance courante
      if (stompClient.connected) {
        try {
          stompClient.subscribe("/topic/alertes", (message) => {
            const alert = JSON.parse(message.body);
            console.log("Nouvelle alerte reçue via WebSocket :", alert);
            onAlertReceived(alert);
          });
        } catch (error) {
          console.error("Erreur lors de la souscription STOMP :", error);
        }
      }
    },

    onStompError: (error) => {
      console.error("Erreur STOMP :", error);
    },

    onWebSocketClose: () => {
      console.log("WebSocket déconnecté 🔌");
    },
  });

  client = stompClient;
  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (client) {
    client.deactivate();
    client = null;
  }
};