"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Clock3 } from "lucide-react";


interface TopbarProps {
  title?: string;
  userName?: string;
  userRole?: string;
}


export default function Topbar({
  title = "Centre de Commandement",
  userName = "Cap. Moussa Diarra",
  userRole = "Chef d'équipe",
}: TopbarProps) {


const [now,setNow] = useState<Date | null>(null);


useEffect(()=>{

setNow(new Date());

const timer = setInterval(()=>{
 setNow(new Date());
},1000);


return ()=>clearInterval(timer);

},[]);



const initials = userName
.replace(/^Cap\.\s*/,"")
.split(" ")
.map((name)=>name[0])
.slice(0,2)
.join("");



return (

<header
className="
sticky
top-0
z-30

flex
h-[78px]

items-center
justify-between

border-b
border-gray-200

bg-white/90

backdrop-blur-md

px-7

shadow-sm

max-[640px]:px-4

"
>



{/* TITRE */}

<div>

<div className="
flex
items-center
gap-2
">

<h1
className="
text-xl
font-bold
tracking-tight
text-gray-900
"
>

{title}

</h1>


<span
className="
h-2
w-2
rounded-full
bg-red-600
animate-pulse
"
/>


</div>


<p
className="
mt-1
text-xs
text-gray-500
"
>

Surveillance des interventions en temps réel

</p>


</div>






{/* SYSTEME */}

<div
className="
hidden

md:flex

items-center
gap-3

rounded-full

border
border-green-200

bg-green-50

px-4
py-2

text-xs

font-semibold

text-green-700

"
>


<div
className="
relative
flex
h-2.5
w-2.5
"
>

<span
className="
absolute
h-full
w-full

rounded-full

bg-green-500

animate-ping

"
/>


<span
className="
relative

h-2.5
w-2.5

rounded-full

bg-green-500

"
/>


</div>



Système opérationnel


</div>






{/* DROITE */}

<div
className="
flex
items-center
gap-4
"
>



{/* HORLOGE */}

{now && (

<div
className="
hidden

lg:flex

items-center
gap-2

border-r
border-gray-200

pr-5

"
>


<Clock3
className="
h-4
w-4
text-red-600
"
/>


<div
className="
text-right
"
>

<p
className="
font-mono
text-sm
font-bold
text-gray-900
"
>

{now.toLocaleTimeString("fr-FR")}

</p>


<p
className="
text-[11px]
capitalize
text-gray-500
"
>

{now.toLocaleDateString(
"fr-FR",
{
weekday:"long",
day:"numeric",
month:"long"
}
)}

</p>


</div>


</div>

)}




{/* PROFIL */}


<div
className="
flex
items-center
gap-3

rounded-xl

border

border-gray-200

bg-gray-50

px-3

py-2

transition

hover:border-red-200

"
>


<div
className="
flex

h-11
w-11

items-center
justify-center

rounded-full

bg-gradient-to-br

from-red-600

to-red-700

font-bold

text-white

shadow-md

shadow-red-600/30

"
>

{initials}

</div>



<div
className="
hidden

md:block

leading-tight

"
>


<p
className="
text-sm

font-bold

text-gray-900
"
>

{userName}

</p>



<p
className="
flex

items-center

gap-1

text-xs

text-gray-500

"
>


<ShieldCheck
className="
h-3.5
w-3.5

text-red-600
"
/>


{userRole}


</p>


</div>



</div>


</div>



</header>

);

}