"use client";

      import { useEffect, useState } from "react";
      import {
        Home,
        Siren,
        Map,
        BarChart3,
        History,
        User,
        Settings,
        LogOut,
        Menu,
        Volume2,
        ShieldAlert,
        type LucideIcon,
      } from "lucide-react";


    interface NavItem {
      key:string;
      label:string;
      icon:LucideIcon;
      badge?:number;
    }



    const MAIN_ITEMS:NavItem[]=[
      {
        key:"accueil",
        label:"Tableau de bord",
        icon:Home
      },
      {
        key:"alertes",
        label:"Alertes urgentes",
        icon:Siren,
        badge:4
      },
      {
        key:"carte",
        label:"Carte des interventions",
        icon:Map
      },
      {
        key:"stats",
        label:"Statistiques",
        icon:BarChart3
      },
      {
        key:"historique",
        label:"Historique",
        icon:History
      }
    ];



const ACCOUNT_ITEMS:NavItem[]=[
  {
    key:"profil",
    label:"Profil",
    icon:User
  },
  {
    key:"parametres",
    label:"Paramètres",
    icon:Settings
  }
];




interface SidebarProps {

 active?:string;

 onNavigate?:(key:string)=>void;

 onLogout?:()=>void;

 hasNewAlert?:boolean;

}




        export default function Sidebar({

        active="accueil",
        onNavigate,
        onLogout,
        hasNewAlert=false

        }:SidebarProps){



        const [activeKey,setActiveKey]=useState(active);

        const [collapsed,setCollapsed]=useState(false);



        useEffect(()=>{

        if(hasNewAlert){

        const audio = new Audio("/sounds/alert.mp3");

        audio.play().catch(()=>{});

        }

        },[hasNewAlert]);




        function handleClick(key:string){

        setActiveKey(key);

        onNavigate?.(key);

        }




        return (


        <aside

        className={`
        fixed
        left-0
        top-0

        z-50

        flex
        h-screen
        flex-col

        bg-[#111827]

        text-white

        shadow-xl

        transition-all
        duration-300

        ${collapsed ? "w-[82px]" : "w-[260px]"}

        `}

        >





        {/* HEADER */}

        <div
className="
flex
h-[72px]
items-center
justify-between

border-b
border-white/10

px-4
"
>

  {/* Logo */}
  <div
    className="
    flex
    h-26
    w-46
    items-center
    justify-center
    "
  >

    <img
      src="/images/logo.png"
      alt="Secours+"
      className="
      h-full
      w-full
      object-contain
      "
    />

  </div>


  {/* Hamburger */}
  <button
    onClick={()=>setCollapsed(!collapsed)}
    className="
    rounded-lg
    p-2
    text-gray-300
    hover:bg-white/10
    "
  >

    <Menu className="h-6 w-6"/>

  </button>


</div>
      
      
      {/* MENU */}
      <nav className="
      flex-1

      px-3
      py-5

      overflow-hidden

      ">


      {!collapsed && (

      <p className="
      mb-3
      px-3

      text-[11px]

      uppercase

      tracking-wider

      text-gray-500

      ">

      Interventions

      </p>

      )}





      {MAIN_ITEMS.map(item=>(

      <NavRow

      key={item.key}

      item={item}

      active={activeKey===item.key}

      collapsed={collapsed}

      onClick={handleClick}

      />

      ))}







{!collapsed && (

<p className="
mt-6
mb-3

px-3

text-[11px]

uppercase

tracking-wider

text-gray-500

">

Administration

</p>

)}



{ACCOUNT_ITEMS.map(item=>(

<NavRow

key={item.key}

item={item}

active={activeKey===item.key}

collapsed={collapsed}

onClick={handleClick}

/>

))}



</nav>









{/* ZONE ALERTE */}


{/* INDICATEUR ALERTE */}

<div
className="
flex
items-center
justify-center

border-t
border-white/10

p-4
"
>

<button

className={`
relative

flex
h-12
w-12

items-center
justify-center

rounded-full

transition-all


${
hasNewAlert

?

"bg-red-600 shadow-lg shadow-red-600/50 animate-pulse"

:

"bg-white/10 hover:bg-white/20"

}

`}

title="Alertes"

>

<ShieldAlert

className={`
h-6
w-6

${
hasNewAlert
?
"text-white"
:
"text-red-500"
}

`}

/>



{/* Petit point indicateur */}

{hasNewAlert && (

<span

className="
absolute

right-1
top-1

h-3
w-3

rounded-full

bg-white

animate-ping

"

/>

)}


</button>


</div>










</aside>


);

}







function NavRow({

item,
active,
collapsed,
onClick

}:{

item:NavItem;
active:boolean;
collapsed:boolean;
onClick:(key:string)=>void;

}){


const Icon=item.icon;


return (

<button

onClick={()=>onClick(item.key)}

className={`

relative

mb-1

flex

w-full

items-center

gap-3

rounded-xl

px-4

py-3

text-sm

transition-all


${collapsed ? "justify-center" : ""}



${
active

?

"bg-red-600 text-white shadow-lg shadow-red-600/20"

:

"text-gray-300 hover:bg-white/10 hover:text-white"

}


`}

>


<Icon className="h-5 w-5 flex-shrink-0"/>



{!collapsed && (

<span>

{item.label}

</span>

)}



{item.badge && !collapsed && (

<span className="
ml-auto

rounded-full

bg-white

px-2

py-0.5

text-xs

font-bold

text-red-600

">

{item.badge}

</span>

)}


</button>

);

}