"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Building2,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";


interface UserData {
  id: number;
  nomComplet: string;
  telephone: string;
  caserne: string;
  role: string;
  latitude?: number | null;
  longitude?: number | null;
}


interface FormData {
  nomComplet: string;
  telephone: string;
  caserne: string;
}



export default function ModifierProfilPage() {

  const router = useRouter();


  const [user, setUser] = useState<UserData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nomComplet: "",
    telephone: "",
    caserne: "",
  });


  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");



  // Charger utilisateur connecté

  useEffect(() => {

    const savedUser = localStorage.getItem("user");


    if(savedUser){

      const data: UserData = JSON.parse(savedUser);

      setUser(data);


      setFormData({

        nomComplet: data.nomComplet,

        telephone: data.telephone,

        caserne: data.caserne,

      });

    }


  }, []);




  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ){

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  }





  async function handleSubmit(
    e: React.FormEvent
  ){

    e.preventDefault();


    if(!user) return;


    setLoading(true);

    setError("");

    setMessage("");



    try{


      const response = await fetch(
        `http://localhost:8080/api/auth/profil/${user.id}`,
        {

          method:"PUT",

          headers:{
            "Content-Type":"application/json",
          },


          body:JSON.stringify(formData),


        }
      );



      if(!response.ok){

        throw new Error(
          "Erreur lors de la modification"
        );

      }



      const updatedUser = await response.json();



      // Mise à jour locale

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );



      setMessage(
        "Informations modifiées avec succès"
      );



      setTimeout(()=>{

        router.push("/dashboard");

      },1500);



    }
    catch(err){

      setError(
        "Impossible de modifier les informations"
      );

    }
    finally{

      setLoading(false);

    }

  }





return (

<div className="min-h-full bg-gray-50 px-4 py-8 sm:px-6">


<div className="mx-auto max-w-3xl">


{/* Retour */}

<button

onClick={()=>router.back()}

className="
mb-6
flex
items-center
gap-2
text-sm
font-medium
text-gray-600
hover:text-red-600
"

>

<ArrowLeft className="h-4 w-4"/>

Retour

</button>





<h1 className="
text-2xl
font-bold
text-gray-900
">

Modifier mes informations

</h1>


<p className="
mt-1
text-sm
text-gray-500
mb-6
">

Mettez à jour vos informations personnelles

</p>





<div className="
rounded-2xl
border
border-gray-200
bg-white
p-6
shadow-sm
">


<form
onSubmit={handleSubmit}
className="space-y-5"
>



{error && (

<div className="
flex
items-center
gap-2
rounded-xl
bg-red-50
border
border-red-100
p-3
text-sm
text-red-700
">

<AlertTriangle className="h-4 w-4"/>

{error}

</div>

)}




{message && (

<div className="
flex
items-center
gap-2
rounded-xl
bg-green-50
border
border-green-100
p-3
text-sm
text-green-700
">

<CheckCircle className="h-4 w-4"/>

{message}

</div>

)}







{/* Nom */}

<div>

<label className="text-sm font-medium text-gray-700">

Nom complet

</label>


<div className="relative mt-1">


<User className="
absolute
left-3
top-1/2
h-4
w-4
-translate-y-1/2
text-gray-400
"/>


<input

name="nomComplet"

value={formData.nomComplet}

onChange={handleChange}

className="
w-full
rounded-xl
border
border-gray-200
py-3
pl-10
pr-4
text-sm
focus:border-red-500
focus:outline-none
"

 />

</div>

</div>






{/* Téléphone */}

<div>

<label className="text-sm font-medium text-gray-700">

Téléphone

</label>


<div className="relative mt-1">


<Phone className="
absolute
left-3
top-1/2
h-4
w-4
-translate-y-1/2
text-gray-400
"/>


<input

name="telephone"

value={formData.telephone}

onChange={handleChange}

className="
w-full
rounded-xl
border
border-gray-200
py-3
pl-10
pr-4
text-sm
focus:border-red-500
focus:outline-none
"

/>

</div>

</div>







{/* Caserne */}

<div>

<label className="text-sm font-medium text-gray-700">

Caserne

</label>


<div className="relative mt-1">


<Building2 className="
absolute
left-3
top-1/2
h-4
w-4
-translate-y-1/2
text-gray-400
"/>


<input

name="caserne"

value={formData.caserne}

onChange={handleChange}

className="
w-full
rounded-xl
border
border-gray-200
py-3
pl-10
pr-4
text-sm
focus:border-red-500
focus:outline-none
"

/>

</div>

</div>







<button

disabled={loading}

className="
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-red-600
py-3
text-sm
font-semibold
text-white
hover:bg-red-700
disabled:opacity-70
"

>


{

loading ?

<>

<Loader2 className="h-4 w-4 animate-spin"/>

Modification...

</>

:

<>

<Save className="h-4 w-4"/>

Enregistrer les modifications

</>

}


</button>




</form>


</div>


</div>


</div>

);


}