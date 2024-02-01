'use client'
import Link from "next/link"
import { useEffect, useState } from 'react'
import { VerseSelection, HeaderAndFooterWrapper } from '../../lib/reusable_components'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { firestoreInstance } from '../../lib/firebase'
import { redirect } from "next/navigation"
import { doc } from "firebase/firestore"
import { getDoc } from "firebase/firestore";
import { useSearchParams } from 'next/navigation'

export default function Search() {
  const queryParams = useSearchParams();
  const auth = getAuth();
  const series = queryParams.get("series")
  const [user, setUser] = useState(auth.currentUser);
  const [goalChar, setGoalChar] = useState(10000)
  const bookSelectedHook = useState(null)
  const [bookSelected, setBookSelected] = bookSelectedHook
  const bookHumanReadableHook = useState(null)
  const [bookHumanReadableNameSelected, setBookHumanReadableName] = bookHumanReadableHook
  const chapterSelectedHook = useState(null)
  const [chapterSelected, setChapterSelected] = chapterSelectedHook
  const verseSelectedHook = useState(null)
  const [verseSelected, setVerseSelected] = verseSelectedHook

  const [lastBook, setLastBook] = useState(null)
  const [lastBookHumanReadable, setLastBookHumanReadable] = useState(null)
  const [lastChapter, setLastChapter] = useState(null)
  const [lastVerse, setLastVerse] = useState(null)


  useEffect(() => {
    getLastRead()

    async function getLastRead() {
      if (user == null || series.length === 0 ) {
        return
      }
      try {
        let docRef = doc(firestoreInstance, `readpoint/${user.email}/read_series/${series}`)
        let docdata = await getDoc(docRef)
        if (docdata.exists()) {
          let data = docdata.data()
          setLastBook(data.book)
          setLastBookHumanReadable(data.bookHumanReadable)
          setLastChapter(data.chapter)
          setLastVerse(data.verse)

          setBookSelected({ value: data.book, label: data.bookHumanReadable })
          setBookHumanReadableName(data.bookHumanReadable)
          setChapterSelected({ value: data.chapter, label: data.chapter })
          setVerseSelected({ value: data.verse, label: data.verse })
        }
      } catch (e) {
        console.log(e)
      }
    }

  }, [user])


  onAuthStateChanged(auth, (changedUser) => {
    setUser(changedUser)
  })
  if (user == null) return redirect("/")
  if (series.length === 0) return redirect("/home")

  return (
    <HeaderAndFooterWrapper showBack={true}>
      <div className="relative flex place-items-center content-center before:absolute before:h-[0px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-100 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] m-5 my-10 mt-24">
        <div className='flex-vertical content-center'>
          <div className='font-mono text-3xl text-center font-black'>Last Read</div>
          <div className='font-mono text-xl text-center font-black'>{series}</div>
          <div className='font-mono text-3xl italic mt-5 text-center text-fuchsia-200'> {lastBookHumanReadable} {lastChapter ? lastChapter : null}:{lastVerse ? lastVerse : null}</div>
        </div>
      </div>

      <div className="relative flex place-items-center content-center before:absolute before:h-[0px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-100 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] m-5 my-10">
        <div className='font-mono text-4xl text-center font-black'>  Select Starting Verse </div>
      </div>

      <VerseSelection
        bookSelectedHook={bookSelectedHook}
        bookHumanReadableHook={bookHumanReadableHook}
        chapterSelectedHook={chapterSelectedHook}
        verseSelectedHook={verseSelectedHook} />

      <div className="relative flex-col items-stretch items-center mt-16 mb-5">
        <div className='font-mono text-2xl font-black text-center mb-5'>  Set Goal <span className='text-base'>(#characters)</span></div>
        <div className="md:container md:mx-auto items-center">
          <input className="text-center appearance-none text-white rounded-xl w-full py-4 px-4 text-gray-700
           leading-tight focus:outline-none focus:bg-white focus:border-purple-500" 
           style={{ backgroundColor: "rgb(23 37 84)" }} 
           id="inline-full-name" type="text" placeholder="number of characters" 
           value={goalChar} onChange={(item) => {setGoalChar(item.target.value) }} />
        </div>
      </div>

      <Link href={{
        pathname: '/results',
        query: {
          series: series,
          book: bookSelected == null ? null : bookSelected.value,
          bookHumanReadable: bookHumanReadableNameSelected,
          chapter: chapterSelected == null ? null : chapterSelected.value,
          verse: verseSelected == null ? null : verseSelected.value,
          goal: goalChar
        }
      }}>
        <button className='relative flex text-center flex-col mt-6 text-gray-300 bg-yellow-950 bg-clip-border rounded-xl w-min-max'>
          <div className='p-4 font-mono font-black text-2xl'>
            <span>Gen Reading</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 ml-2 inline font-black">
              <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
            </svg>

          </div>

        </button>
      </Link>
    </HeaderAndFooterWrapper>

  )
}
