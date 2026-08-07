import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";


let client: Client | null = null;


export const connectWebSocket = (
    onAlertReceived: (alert: any) => void
) => {

    client = new Client({

        webSocketFactory: () =>
            new SockJS("http://localhost:8080/ws"),


        reconnectDelay: 5000,


        onConnect: () => {

            console.log("WebSocket connecté 🚨");


            client?.subscribe(
                "/topic/alertes",
                (message) => {

                    const alert = JSON.parse(message.body);

                    console.log("Nouvelle alerte :", alert);


                    onAlertReceived(alert);
                }
            );
        },


        onStompError: (error) => {
            console.error("Erreur WebSocket :", error);
        }

    });


    client.activate();

};



export const disconnectWebSocket = () => {

    if(client){
        client.deactivate();
    }

};