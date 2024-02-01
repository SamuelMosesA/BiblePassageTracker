'use client'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { firestoreInstance } from '../../lib/firebase'
import { useEffect, useState } from 'react'
import { redirect } from "next/navigation"
import { HeaderAndFooterWrapper, customStyleWithWidth } from '../../lib/reusable_components'
import Link from "next/link"
import Select from 'react-select'
import { collection, getDocs, setDoc, getDoc, doc, deleteDoc} from "firebase/firestore"
import { availableParallelism } from 'os'
async function addSeries(newSeries) {
    if (newSeries == null || user == null)
        return

    docRef = doc(firestoreInstance, "readpoint", user.email, "read_series", newSeries)
    try {
        await setDoc(docRef,
            {
                book: "genesis",
                bookHumanReadable: "Genesis",
                chapter: 1,
                verse: 1
            })
        setSeriesUptoDate(false)
    } catch (e) {
        console.log(e)
    }
}

export default function Home() {
    const auth = getAuth();
    const [user, setUser] = useState(auth.currentUser)
    const [seriesUptoDate, setSeriesUptoDate] = useState(true)
    const [availableSeries, setAvailableSeries] = useState(undefined)
    const [searchSeries, setSearchSeries] = useState(null)
    const [deleteSeries, setDeleteSeries] = useState(null)
    const [newSeries, setNewSeries] = useState(null)

    useEffect(() => {
        getSeries()

        async function getSeries() {
            if (user != null) {
                try {
                    let subcollectionRef = collection(firestoreInstance, "readpoint", user.email, "read_series")
                    let collectionData = await getDocs(subcollectionRef)
                    var availableSeriesResult = []
                    collectionData.forEach(doc => {
                        availableSeriesResult.push({ value: doc.id, label: doc.id })
                    })
                    setAvailableSeries(availableSeriesResult)
                    setSeriesUptoDate(true)
                } catch (e) {
                    console.log(e)
                }
            }
        }

    }, [user, setAvailableSeries, setSeriesUptoDate])
    onAuthStateChanged(auth, (changedUser) => {
        setUser(changedUser)
    })
    if (user == null) return redirect("/")
    if (!seriesUptoDate) return redirect("/home")

    async function addSeries() {
        if (newSeries == null || user == null){
            return
        }
        
        let docRef = doc(firestoreInstance, `readpoint/${user.email}/read_series/${newSeries}`)
        try {
            let docSnap = await getDoc(docRef)
            if(docSnap.exists()){
                alert("document exists")
                return
            }
            await setDoc(docRef,
                {
                    book: "genesis",
                    bookHumanReadable: "Genesis",
                    chapter: "1",
                    verse: "1"
                },
                {merge:false})
            setSeriesUptoDate(false)
        } catch (e) {
            console.log(e)
        }
    }

    async function removeSeries(){
        if (deleteSeries == null || user == null){
            return
        }
        
        let docRef = doc(firestoreInstance, `readpoint/${user.email}/read_series/${deleteSeries}`)
        try {
            let confirmation = confirm(`deleting series ${deleteSeries}`)
            if(!confirmation)
                return
            await deleteDoc(docRef)
            setSeriesUptoDate(false)
        } catch (e) {
            console.log(e)
        }
    }


    return (
        <HeaderAndFooterWrapper>
            <div className='flex-column items-center justify-center mt-24'>
                <Select styles={customStyleWithWidth("20rem")}
                    placeholder="Series"
                    options={availableSeries}
                    onChange={(choice) => {
                        setSearchSeries(choice.value)
                    }} />
                <Link href={{
                    pathname: '/search',
                    query: {
                        series: searchSeries
                    }
                }}
                >
                    <button className='mt-6 text-gray-300 bg-green-950 bg-clip-border rounded-xl w-min-max'>
                        <div className='p-4 font-mono font-black text-2xl'>
                            <span>Go To Series</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 ml-2 inline font-black">
                                <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                            </svg>

                        </div>

                    </button>
                </Link>
            </div>

            <div className='flex-column items-center justify-center mt-48'>

                <div>
                    <input className="text-center appearance-none text-white rounded-xl py-4 
                    px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                        style={{ backgroundColor: "rgb(23 37 84)", width: "20rem" }}
                        id="inline-full-name" type="text"
                        placeholder="name of series"
                        onChange={(item) => { setNewSeries(item.target.value) }} />
                </div>
                <a onClick={addSeries}
                    className='inline-block'
                >
                    <button className='mt-6 text-gray-300 bg-yellow-950 bg-clip-border rounded-xl w-min-max'>
                        <div className='p-4 font-mono font-black text-2xl'>
                            <span>Add Series</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 ml-2 inline font-black">
                                <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                            </svg>

                        </div>

                    </button>
                </a>
            </div>
            <div className='flex-column items-center justify-center mt-12'>
                <Select styles={customStyleWithWidth("20rem")}
                    placeholder="Series"
                    options={availableSeries}
                    onChange={(choice) => {
                        setDeleteSeries(choice.value)
                    }} />
                <a onClick={removeSeries}
                    className='inline-block'
                >
                    <button className='mt-6 text-gray-300 bg-red-950 bg-clip-border rounded-xl w-min-max'>
                        <div className='p-4 font-mono font-black text-2xl'>
                            <span>Delete Series</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 ml-2 inline font-black">
                                <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                            </svg>

                        </div>

                    </button>
                </a>
            </div>

        </HeaderAndFooterWrapper>
    )
}
