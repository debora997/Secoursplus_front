import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  // trendLabel: string;
  tone: "red" | "blue" | "green" | "amber";
}


export default function StatCard({
  icon: Icon,
  value,
  label,
  // trendLabel,
}: StatCardProps) {

return (

<div
className="
flex
items-center
justify-between

rounded-xl

bg-white

border
border-gray-100

px-4
py-3

shadow-sm

transition-all
hover:shadow-md

"
>


<div className="
flex
items-center
gap-3
">


{/* Icône sobre */}

<div
className="
flex
h-10
w-10
items-center
justify-center

rounded-lg

bg-red-50

text-red-600

"
>

<Icon
className="h-5 w-5"
/>

</div>



<div>

<p className="
text-2xl
font-bold
leading-none
text-gray-900
">

{value}

</p>


<p className="
mt-1
text-xs
font-medium
text-gray-500
">

{label}

</p>


</div>


</div>




<div
className="
rounded-full
bg-gray-50

px-2.5
py-1

text-[11px]
font-semibold
text-gray-500
"
>

{/* {trendLabel} */}

</div>


</div>

);

}