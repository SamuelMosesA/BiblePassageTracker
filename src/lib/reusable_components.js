'use client'
import Link from "next/link"
import { signOut, getAuth } from "firebase/auth"
import { redirect } from "next/navigation"
import { useEffect, useState } from 'react'
import Select from 'react-select'
import {firebaseConfig } from './firebase'
import { onAuthStateChanged } from "firebase/auth"
import { initializeApp, getApp, getApps } from "firebase/app";

function doSignOut(){
    signOut(getAuth())
    return redirect("/")
}

function HeaderAndFooterWrapper(props) {
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    const auth = getAuth();
    const [user, setUser] = useState(auth.currentUser);
    onAuthStateChanged(auth, (changedUser) => {
        setUser(changedUser)
    })
    var userInfoContent = null
    if (user != null) {
        userInfoContent = (
            <div className="flex space-4">
                <h1 className="mr-2"> hi {user.displayName}</h1>
                <button style={{"color":"pink"}} onClick={doSignOut}>sign out</button>
            </div>
        )
    }

    let backIco = null;
    if(props.showBack){
        backIco = (         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 mx-2 inline">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z" clipRule="evenodd" />
          </svg>)
    }

    return (
        <div className="flex min-h-max flex-col items-center justify-between p-48">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex ">
                <Link href="/" className="font-mono font-bold fixed left-0 top-0 flex w-full justify-center w-full rounded-md bg-gradient-to-r bg-gradient-to-r from-cyan-700 to-blue-800 lg:static lg:w-auto shadow-lg lg:rounded-xl  lg:p-5 lg:dark:bg-zinc-800/30 font black text-3xl p-5">
                    {backIco}
                    <span className="inline">Bible Passage Selector</span>
                </Link>
                <div className="fixed bottom-0 left-0 flex h-24 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <div>
                    {userInfoContent}
                    <a
                    href="https://github.com/SamuelMosesA/BiblePassageNextJsApp"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                        How To Use
                    </a>
                    </div>
                </div>
            </div>
            {props.children}
        </div>
    )
}

function customStyleWithWidth(width) {
  return {
    option: (defaultStyles, state) => ({
      ...defaultStyles,
      color: state.isSelected ? "#212529" : "#fff",
      backgroundColor: state.isSelected ? "rgb(96 165 250)" : "rgb(23 37 84)",
      borderRadius: "10px",
      padding: "12px",
    }),

    control: (defaultStyles) => ({
      ...defaultStyles,
      backgroundColor: "rgb(23 37 84)",
      padding: "10px",
      border: "blue",
      boxShadow: "none",
      width: width,
      borderRadius: "12px",
    }),

    menu: (defaultStyles) => ({
      ...defaultStyles,
      backgroundColor: "rgb(23 37 84)",
      padding: "10px",
      border: "#212529",
      boxShadow: "none",
      width: width,
      borderRadius: "12px",
    }),

    placeholder: (defaultStyles) => ({
      ...defaultStyles,
      color: "fff000",
    }),

    input: (defaultStyles) => ({
      ...defaultStyles,
      color: "fff000",
    }),

    singleValue: (defaultStyles) => ({ ...defaultStyles, color: "#fffff" }),
  };
}

function getAvailableChapterOptions(availableContent, bookName) {
  if (availableContent == null || bookName == null) return [];
  var optionsList = []
  try {
    for (const chapter of Object.keys(availableContent[bookName])) {
      optionsList.push({ value: chapter, label: chapter })
    }
  } catch (exception) {
  }
  return optionsList;
}

function getAvailableVerseOptions(availableContent, bookName, chapter) {
  if (availableContent == null || bookName == null, chapter == null) return [];
  var optionsList = []
  try {
    for (const verse of availableContent[bookName][chapter]) {
      optionsList.push({ value: verse, label: verse })
    }
  } catch (exception) {
  }
  return optionsList;
}

function VerseSelection(props) {
  const [availableContent, setAvailableContent] = useState(null)
  const [bookOptions, setBookOptions] = useState([]);

  const [bookSelected, setBookSelected] = props.bookSelectedHook
  const [bookHumanReadableNameSelected, setBookHumanReadableName] = props.bookHumanReadableHook
  const [chapterSelected, setChapterSelected] = props.chapterSelectedHook
  const [verseSelected, setVerseSelected] = props.verseSelectedHook;

  useEffect(() => {
    getAvailableContent()
    getBookInfo()

    async function getBookInfo() {
      var optionList = []
      const bookInfo = await fetch("/bookInfo.json");
      const fileContents = await bookInfo.json();
      for (const book of fileContents) {
        optionList.push({ value: book.name, label: book.humanReadableName })
      }
      setBookOptions(optionList)
    }


    async function getAvailableContent() {
      var availableContDict = {}
      const availableContent = await fetch("/availableContent.json");
      const fileContents = await availableContent.json();
      for (const bookInfo of fileContents) {
        availableContDict[bookInfo.bookName] = bookInfo.verseList
      }
      setAvailableContent(availableContDict)
    }
  }, []);

  return (
      <div style={{display:"flex", flexWrap:"wrap"}} className="gap-2">
        <Select options={bookOptions} styles={customStyleWithWidth("20rem")} value={bookSelected}
          placeholder="Book"
          onChange={(choice) => {
            setBookSelected(choice);
            console.log(choice)
            setBookHumanReadableName(choice.label);
            setChapterSelected(null);
            setVerseSelected(null)
          }} />

        <Select options={
          getAvailableChapterOptions(availableContent, bookSelected?bookSelected.value:null)}
          value={chapterSelected}
          styles={customStyleWithWidth("15rem")}
          placeholder="Chapter"
          onChange={(choice) => {
            setChapterSelected(choice);
            setVerseSelected(null)
          }} />

        <Select options={
          getAvailableVerseOptions(availableContent, bookSelected?bookSelected.value:null, chapterSelected? chapterSelected.value:null)}
          value={verseSelected}
          styles={customStyleWithWidth("10rem")}
          placeholder="Verse"
          onChange={(choice) => {
            setVerseSelected(choice)
          }} />
      </div>
  )
}

export { HeaderAndFooterWrapper, VerseSelection, customStyleWithWidth }