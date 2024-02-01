
'use client'
import Link from "next/link"
import { useEffect, useState } from 'react'
import { VerseSelection, HeaderAndFooterWrapper } from '../../lib/reusable_components'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { firestoreInstance } from '../../lib/firebase'
import { redirect } from "next/navigation"
import { doc, query } from "firebase/firestore"
import { getDoc, setDoc } from "firebase/firestore";
import { useSearchParams } from 'next/navigation'


export default function Record() {
    const queryParams = useSearchParams();
    const series = queryParams.get("series")
    const bookName = queryParams.get("book")
    const bookHumanReadable = queryParams.get("bookHumanReadable")
    const chapter = queryParams.get("chapter")
    const verse = queryParams.get("verse")
    const auth = getAuth();
    const [user, setUser] = useState(auth.currentUser);
    const bookSelectedHook = useState({ value: bookName, label: bookHumanReadable })
    const [bookSelected, setBookSelected] = bookSelectedHook
    const bookHumanReadableHook = useState(bookHumanReadable)
    const [bookHumanReadableNameSelected, setBookHumanReadableName] = bookHumanReadableHook
    const chapterSelectedHook = useState({ value: chapter, label: chapter })
    const [chapterSelected, setChapterSelected] = chapterSelectedHook
    const verseSelectedHook = useState({ value: verse, label: verse })
    const [verseSelected, setVerseSelected] = verseSelectedHook

    const [finishedUpload, setFinishedUpload] = useState(false)

    onAuthStateChanged(auth, (changedUser) => {
        setUser(changedUser)
    })
    if (user == null) return redirect("/")

    async function sendData() {
        let docRef = doc(firestoreInstance, `readpoint/${user.email}/read_series/${series}`)
        try {
            await setDoc(docRef, {
                book: bookSelected.value,
                bookHumanReadable: bookSelected.label,
                chapter: chapterSelected.value,
                verse: verseSelected.value
            });
            setFinishedUpload(true)
        } catch (e) {
            console.log(e)
        }
    }

    if (finishedUpload) {
        let queryParamString = new URLSearchParams({series:series}).toString()
        return redirect(`/search?${queryParamString}`)
    } else {
        return (
            <HeaderAndFooterWrapper showBack={true}>
                <div className="relative flex place-items-center content-center before:absolute before:h-[0px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-100 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] m-5 my-10">
                    <div className='font-mono text-2xl text-center font-black'>  Select Last Verse Read </div>
                    <div className='font-mono text-l text-center font-black'>  {series} </div>
                </div>

                <VerseSelection
                    bookSelectedHook={bookSelectedHook}
                    bookHumanReadableHook={bookHumanReadableHook}
                    chapterSelectedHook={chapterSelectedHook}
                    verseSelectedHook={verseSelectedHook} />


                <button className='relative flex text-center flex-col mt-6 text-gray-300 bg-yellow-950 bg-clip-border rounded-xl w-min-max'
                    onClick={() => {sendData()}}>
                    <div className='p-4 font-mono font-black text-2xl'>
                        <span>Record</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 ml-2 inline font-black">
                            <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                        </svg>

                    </div>

                </button>
            </HeaderAndFooterWrapper>
        )
    }
}
