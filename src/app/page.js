'use client'
import Link from "next/link"
import { redirect } from "next/navigation";
import GoogleButton from 'react-google-button'
import { firestoreInstance } from '../lib/firebase'
import { setDoc , doc, getDoc} from "firebase/firestore";
import { useEffect, useState } from "react";
import {HeaderAndFooterWrapper} from '../lib/reusable_components'
import { getAuth, onAuthStateChanged,  signInWithPopup, signInWithRedirect, GoogleAuthProvider, setPersistence, browserLocalPersistence} from "firebase/auth";





function LoginComponent(props) {
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  return (
    <div className="flex-column place-items-center content-center">
      <div className="relative flex place-items-center content-center justify-items-center justify-center before:absolute before:h-[0px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-100 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] m-5 my-10 mt-24">
        <div className='font-mono text-4xl text-center font-black'> Login </div>
      </div>
      <GoogleButton className="mt-10" onClick={() =>{ 
      setPersistence(auth, browserLocalPersistence)
      .then(()=>signInWithRedirect(auth, provider))
      .then((result => {console.log(result)}))
      .catch((error)=>console.log(error)) } }/>
    </div>
  )
}


// function AuthenticatedScreen(props) {

//   let [docRef, setDocRef] = useState("loading")


//   useEffect(() => {
//     sendExampleData()

//     async function sendExampleData() {
//       try {
//         console.log("sending request")
//         await setDoc(doc(firestoreInstance, "readpoint", props.data.email), {
//           book: "GEN",
//           bookHumanReadable: "Genesis",
//           chapter: 1,
//           verse: 2
//         });
//         console.log("Document written with ID: ", props.data.email);
//         let docdata = await getDoc(doc(firestoreInstance, "readpoint", props.data.email))
//         if(docdata.exists()){
//           console.log(docdata.data())
//           setDocRef(JSON.stringify(docdata.data()))
//         }
//       } catch (error) {
//         console.error("Error adding document: ", error);
//         setDocRef(toString(error))
//       }
//     }
//   },[]);

//   return (
//     <div>
//       <h1> hi {props.data.displayName}</h1>
//       <img src={props.data.photoURL} alt={props.data.displayName + ' photo'} />
//       <h2>{docRef}</h2>
//     </div>
//   );
// }


export default function Home() {
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);
  onAuthStateChanged(auth, (changedUser) => {
    setUser(changedUser)
  })

  if (user!=null) {
    return redirect("/home")
  }
  return (<HeaderAndFooterWrapper><LoginComponent/></HeaderAndFooterWrapper>)
}
