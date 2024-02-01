'use client'
import { HeaderAndFooterWrapper } from "@/lib/reusable_components";
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { use, useEffect, useState } from "react";



function SectionCard(props) {
  return (
    <div className='relative flex flex-col mt-6 text-gray-300 bg-blue-950 bg-clip-border rounded-xl w-96'>
      <div className='p-6'>
        <div className='"block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900'>{props.title}</div>
        <div className='block font-sans text-base antialiased font-light leading-relaxed text-inherit'>{props.passage}</div>
      </div>
    </div>);
}



var chapterCache = null
async function getVerseLength(bookName, chapter, verse) {
  if (chapterCache == null) {
    const chapterReq = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-bsb/books/${bookName}/chapters/${chapter}.json`
    chapterCache = {};
    let rawData = await fetch(chapterReq);
    let jsonRawData = await rawData.json()
    let data = jsonRawData["data"];
    data.forEach(verseCont => {
      chapterCache[parseInt(verseCont["verse"])] = verseCont["text"];
    });
  }
  if (chapterCache[verse] == undefined) return 0;
  return chapterCache[verse].length;
}



async function getPassageResults(enrichedSectionInfo, bookName, startChapter, startVerse, goalLength) {
  var sectionResults = null
  try {
    var startIndex = 0;
    while (!(enrichedSectionInfo.at(startIndex).chapter == startChapter && enrichedSectionInfo.at(startIndex).endVerse >= startVerse)) {
      startIndex += 1;
      if (startIndex >= enrichedSectionInfo.length) break;
    }

    var curNumChars = 0;
    for (let i = startVerse; i <= enrichedSectionInfo.at(startIndex).endVerse; ++i) {
      curNumChars += await getVerseLength(bookName, startChapter, i);
    }

    let endIndex = startIndex;

    while (curNumChars < goalLength) {
      endIndex += 1;
      curNumChars += enrichedSectionInfo.at(endIndex).numChars;

      if(endIndex == enrichedSectionInfo.length -1)
        break
    }


    sectionResults = []
    for (let i = startIndex; i <= endIndex; ++i) {
      sectionResults.push(enrichedSectionInfo.at(i));
    }
  } catch (exception) {
    console.log(exception)
  }

  return sectionResults
}

function SectionList(props) {
  var sectionList = []
  for (const section of props.sectionResults) {
    var passage = `${props.humanReadableBookName} ${section.chapter}:${section.startVerse}-${section.endVerse}`
    sectionList.push(
      <SectionCard title={section.title} passage={passage} />
    )
  }
  return sectionList
}

function PassageQuery(props) {
  const [passageSections, setPassageSections] = useState(undefined)
  if (props.enrichedSectionInfo === undefined) return (<div>null enriched</div>);
  updateQueryResults()

  if (passageSections === undefined) return (<div>not recieved result</div>)
  else if (passageSections === null) {
    return (<InvalidResult></InvalidResult>)
  } else {
    let lastSection = passageSections[passageSections.length - 1]
    return (<ValidResult
      series={props.series}
      bookName={props.bookName}
      humanReadableBookName={props.humanReadableBookName}
      startChapter={props.startChapter}
      startVerse={props.startVerse}
      endChapter={lastSection.chapter}
      endVerse={lastSection.endVerse}
      sectionResults={passageSections}></ValidResult>)
  }

  async function updateQueryResults() {
    let passageResult = await getPassageResults(props.enrichedSectionInfo, props.bookName, props.startChapter, props.startVerse, props.goalLength)
    setPassageSections(passageResult)
  }
}

function ValidResult(props) {
  return (
    <div>
      <div className="relative flex  place-content-center place-items-center before:absolute before:h-[0px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-100 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] my-20">
        <div className='flex-vertical content-center'>
          <div className='font-mono text-4xl font-black text-center'> Passage </div>
          <div className='font-mono text-xl font-black text-center'> {props.series} </div>
          <div className='font-mono text-3xl italic mt-5 text-center text-fuchsia-200'> {props.humanReadableBookName} {props.startChapter}:{props.startVerse} - {props.endChapter}:{props.endVerse} </div>
        </div>
      </div>

      <Link href={{
        pathname: '/record',
        query: {
          series: props.series,
          book: props.bookName,
          bookHumanReadable: props.humanReadableBookName,
          chapter: props.endChapter,
          verse: props.endVerse
        }
      }}>
        <button className='relativeflex text-center flex-col text-gray-300 bg-yellow-950 bg-clip-border rounded-xl w-min-max'>
          <div className='p-4 font-mono font-black text-l'>
            <span>Record Last Verse Read</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 ml-2 inline font-black">
              <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
            </svg>

          </div>

        </button>
      </Link>
      <div className="relative flex place-items-center space-x-5 items-start	 ">
        <div className='relative flex-vertical place-items-center space-y-5'>
          <SectionList sectionResults={props.sectionResults} humanReadableBookName={props.humanReadableBookName}></SectionList>
        </div>
      </div>

    </div>
  )
}

function InvalidResult() {
  return (
    <div>
      <div className="relative flex place-items-center before:absolute before:h-[0px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-100 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1] m-5 my-20">
        <div className='flex-vertical'>
          <div className='font-mono text-4xl font-black text-center'> Error   </div>
        </div>
      </div>
    </div>
  );
}

export default function Results() {
  const queryParams = useSearchParams();
  const series = queryParams.get("series")
  const bookName = queryParams.get("book")
  const bookHumanReadable = queryParams.get("bookHumanReadable")
  const startChapter = queryParams.get("chapter")
  const startVerse = queryParams.get("verse")
  const goalLength = queryParams.get("goal")


  const [enrichedSectionInfo, setEnrichedSectionInfo] = useState(undefined)


  useEffect(() => {
    getEnrichedInfo()

    async function getEnrichedInfo() {
      try {
        const enrichedInfo = await fetch(`enriched_sections/${bookName}.json`);
        const fileContents = await enrichedInfo.json();
        setEnrichedSectionInfo(fileContents)
      } catch (exception) {
        console.log(exception)
        setEnrichedSectionInfo(null)
      }
    }
  }, [])


  return (
    // <main className="flex min-h-max flex-col items-center justify-between p-48">
    //   <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex ">
    //     <Link href="/" className="font-mono font-bold fixed left-0 top-0 flex justify-center w-full rounded-md bg-gradient-to-r bg-gradient-to-r from-cyan-700 to-blue-800 lg:static lg:w-auto shadow-lg lg:rounded-xl  lg:p-5 lg:dark:bg-zinc-800/30 font black text-3xl p-5 text-center align-bottom">
    //       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 mx-2 inline">
    //         <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z" clipRule="evenodd" />
    //       </svg>
    //       <span className='inline'>Bible Passage Selector</span>
    //     </Link>
    //     <a className="fixed bottom-0 left-0 flex h-24 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"
    //         href="https://github.com/SamuelMosesA/BiblePassageNextJsApp"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //     >
    //       <div
    //         className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
    //       >
    //         How To Use 
    //       </div>
    //     </a>
    //   </div>
    <HeaderAndFooterWrapper showBack={true}>
      <PassageQuery
        series={series}
        bookName={bookName}
        humanReadableBookName={bookHumanReadable}
        startChapter={startChapter}
        startVerse={startVerse}
        goalLength={goalLength}
        enrichedSectionInfo={enrichedSectionInfo} />
    </HeaderAndFooterWrapper>

    // </main>
  )
}
