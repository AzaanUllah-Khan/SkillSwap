import { Link, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../assets/Firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const Course = () => {
  const { id } = useParams()
  const [skill, setSkill] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [author, setAuthor] = useState("")
  const [tags, setTags] = useState([])
  const [uid, setUid] = useState("")
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const getData = async () => {

    const docRef = doc(db, "Skills", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setAuthor(docSnap.data().author)
      setStatus(docSnap.data().status)
      setSkill(docSnap.data().skill)
      setDescription(docSnap.data().description)
      setTags(docSnap.data().tags)
      setUid(docSnap.data().uid)
    } else {
    }
  }
  const checkLogin = () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        getData()
      } else {
        setOpen(true)
      }
    });
  }
  useEffect(() => {
    checkLogin()
  }, [])
  return (
    <>
      <div className="flex flex-wrap justify-center items-start gap-5 p-6">
        <div className="max-w-1/2 min-w-70 bg-white border-1 border-gray-200 rounded-lg">
          <div className="px-5 py-3 rounded-t-xl">
            <h1 className="text-xl font-semibold mb-1">{skill}</h1>
            <h1 className="mb-2">{description}</h1>
            <button className={`text-white px-2.5 py-0.5 rounded text-sm mb-1 ${status == "Teach" ? "bg-green-400" : "bg-yellow-400"}`}>{status}</button>
            <div className="flex flex-wrap justify-start items-center gap-1.5 my-3">
              {tags.map(function (e, i) {
                return <button key={i} className="bg-white border-1 border-indigo-600 text-indigo-600 py-0.5 px-2.5 rounded font-medium">{e.toUpperCase()}</button>
              })}
            </div>
            <Link to={`/seeprofile/${uid}`}><h1 className="transition duration-200 hover:text-indigo-600 text-sm text-gray-600">{author}</h1></Link>
          </div>
        </div>
      </div>
      <Dialog open={open} onClose={() => { }} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-200 sm:mx-0 sm:size-10">
                    <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-gray-900" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                      Login
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Login to your SkillSwap account to view this page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => nav("/login")}
                  className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 cursor-pointer sm:ml-3 sm:w-auto"
                >
                  Login
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => nav('/')}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Go to Home
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default Course
