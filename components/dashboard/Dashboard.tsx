"use client";

import { useEffect, useRef, useState } from "react";
import { connectWebSocket } from "@/services/websocket";
import DashboardLayout from "../layout/DashboardLayout";
import StatGrid from "./StatGrid";
import AlertList from "./AlertList";
import LiveMap from "./LiveMap";
import AlertDetailDrawer from "./AlertDetailDrawer";
import { EmergencyAlert } from "@/types/alert";
import ProtectedRoute from "@/components/auth/ProtectedRoute";


const API_URL = "http://localhost:8080/api/alerts";


export default function Dashboard() {


  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");


  const sirenRef = useRef<HTMLAudioElement | null>(null);


  const cardRefs =
    useRef<Record<number, HTMLDivElement | null>>({});



  // Transformer une alerte backend vers notre interface frontend

  function formatAlert(alert: any): EmergencyAlert {


    return {

      id: alert.id,


      type: alert.type.toLowerCase(),


      status:
        alert.status === "RECEIVED"
          ? "nouvelle"
          : "encours",


      priority:
        alert.severity === "HIGH"
          ? "eleve"
          : "moyen",


      date:
        alert.createdAt
          ? new Date(alert.createdAt)
              .toLocaleDateString()
          : "",


      time:
        alert.createdAt
          ? new Date(alert.createdAt)
              .toLocaleTimeString()
          : "",


      location:
        "Position GPS",


      position: {
        x: 50,
        y: 50,
      },


      description:
        alert.description ?? "",


      reporterName:
        "Citoyen",


      reporterPhone:
        "Non disponible",


      gps:
        `${alert.latitude}, ${alert.longitude}`,


      photosCount:
        alert.photoPaths?.length ?? 0,


    };

  }





  // Charger les anciennes alertes

  useEffect(() => {


    fetch(API_URL)

      .then((response) => response.json())

      .then((data) => {


        const formatted =
          data.map(formatAlert);


        setAlerts(formatted);


      })

      .catch((error) => {

        console.error(
          "Erreur chargement alertes :",
          error
        );

      });


  }, []);






  // Ecoute temps réel WebSocket

  useEffect(() => {


    connectWebSocket((nouvelleAlerte) => {


      console.log(
        "🚨 Nouvelle alerte reçue :",
        nouvelleAlerte
      );



      const alertFormatted =
        formatAlert(nouvelleAlerte);



      setAlerts((prev) => [

        alertFormatted,

        ...prev

      ]);




      // lancer la sirène


      sirenRef.current =
        new Audio("/sounds/siren.mp3");


      sirenRef.current.loop = true;


      sirenRef.current
        .play()
        .catch(() => {});



    });



  }, []);






  function stopSiren() {


    if(sirenRef.current){


      sirenRef.current.pause();


      sirenRef.current.currentTime = 0;


    }

  }







  const selectedAlert =
    alerts.find(
      (a) => a.id === selectedId
    ) ?? null;







  function updateStatus(
    id:number,
    status:EmergencyAlert["status"]
  ){


    setAlerts((prev)=>

      prev.map((alert)=>

        alert.id === id

          ? {
              ...alert,
              status
            }

          : alert

      )

    );


    stopSiren();


    setSelectedId(null);


  }







  function focusAlertFromMap(id:number){


    const el =
      cardRefs.current[id];


    if(el){


      el.scrollIntoView({

        behavior:"smooth",

        block:"center"

      });


      setHighlightedId(id);



      setTimeout(()=>{

        setHighlightedId(null);

      },1100);



    }


  }






  return (

    <ProtectedRoute>


      <DashboardLayout>


        <div className="space-y-7">



          <StatGrid

            alerts={alerts}

            availableFirefighters={8}

            totalFirefighters={14}

          />





          <div className="grid grid-cols-[1fr_410px] gap-6 max-[1180px]:grid-cols-1">





            <section className="rounded-2xl border border-gray-200 bg-white shadow">


              <div className="flex justify-between border-b px-6 py-5">


                <div>


                  <h2 className="text-lg font-semibold">

                    Alertes en cours

                  </h2>


                  <p className="text-sm text-gray-500">

                    Alertes reçues en temps réel

                  </p>


                </div>



                <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600">


                  {alerts.length} alertes


                </span>



              </div>





              <div className="p-6">


                <AlertList

                  alerts={alerts}

                  searchQuery={searchQuery}

                  onViewDetails={setSelectedId}

                  highlightedId={highlightedId}

                  cardRefs={cardRefs}

                />



              </div>



            </section>







            <section className="rounded-2xl border border-gray-200 bg-white shadow">


              <div className="border-b px-6 py-5">


                <h2 className="text-lg font-semibold">

                  Carte des interventions

                </h2>


              </div>



              <div className="p-5">


                <LiveMap

                  alerts={alerts}

                  onSelectAlert={focusAlertFromMap}

                />



              </div>



            </section>




          </div>






        </div>






        <AlertDetailDrawer


          alert={selectedAlert}


          onClose={() =>
            setSelectedId(null)
          }



          onAccept={(id)=>
            updateStatus(id,"encours")
          }



          onRefuse={(id)=>
            updateStatus(id,"terminee")
          }

          onTransfer={()=>{
            stopSiren();
            setSelectedId(null);
          }}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}