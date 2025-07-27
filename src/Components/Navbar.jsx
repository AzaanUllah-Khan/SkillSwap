import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../assets/Firebase/Firebase"
import { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { doc, getDoc } from 'firebase/firestore';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Add Skill', href: '/addskill' }
]

export default function Navbar() {
  const [Uuid, setUuid] = useState("")
  const [status, setStatus] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState("")
  const [bgColor, setBgColor] = useState("")
  const [textColor, setTextColor] = useState("")
  const [date,setDate] = useState("")
  const nav = useNavigate()

  const checkLogin = () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setStatus(true)
        const docRef = doc(db, "Users", user.uid);
        setUuid(user.uid)
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name.split(" "));
          setBgColor(docSnap.data().bgColor)
          setTextColor(docSnap.data().color)
          setDate(docSnap.data().joined)
        } else {
          console.log("No such document!");
        }

      } else {
        setStatus(false)
      }
    });
  }

  useEffect(() => {
    checkLogin()
  }, [])


  const signout = () => {
    setLoading(true)
    signOut(auth).then(() => {
      setTimeout(() => {
        setOpen(false)
        setLoading(false)
      }, 3000);
      nav("/")
    }).catch((error) => {
      setLoading(false)
    });
  }
  const UImage = () => {
    if (userName.length > 1) {
      return <img
        alt={userName.concat(" ")}
        src={`https://ui-avatars.com/api/?name=${userName[0]}+${userName[userName.length - 1]}&background=${bgColor.replace("#", "")}&color=${textColor.replace("#", "")}&rounded=true&bold=true`}
        className="size-8 rounded-full"
      />
    } else if (userName.length == 1) {
      return <img
        alt={userName.concat(" ")}
        src={`https://ui-avatars.com/api/?name=${userName[0]}&background=${bgColor.replace("#", "")}&color=${textColor.replace("#", "")}&rounded=true&bold=true`}
        className="size-8 rounded-full"
      />
    }
  }
  return (
    <>
      <Disclosure as="nav" className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button*/}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
              </DisclosureButton>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex shrink-0 items-center">
                <img
                  alt="SkillSwap"
                  src="/SkillSwap.png"
                  className="h-8 w-auto rounded-full"
                />
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={
                        'active:bg-gray-900 active:text-white text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'
                      }
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {/* Profile dropdown */}
              {status ? <Menu as="div" className="relative ml-3">
                <div>
                  <MenuButton className="relative flex rounded-full bg-gray-800 text-sm border-none outline-none cursor-pointer">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    {UImage()}
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <MenuItem>
                    <Link
                      to="/profile"
                      className="rounded-md block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      Your Profile
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link
                      to={`/seeprofile/${Uuid}`}
                      className="rounded-md block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      My Skills
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <p onClick={() => setOpen(true)}
                      className="cursor-pointer rounded-md block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      Sign out
                    </p>
                  </MenuItem>
                  <MenuItem>
                    <p
                      className="rounded-b-md block px-4 py-2 text-sm text-gray-700 bg-gray-100 data-focus:outline-hidden"
                    >
                      Joined {date}
                    </p>
                  </MenuItem>
                </MenuItems>
              </Menu> : <Link
                to="/login"
                className={
                  'active:bg-gray-900 text-gray-300 bg-gray-700 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-transparent hover:text-gray-300'
                }
              >
                Login
              </Link>}
            </div>
          </div>
        </div>

        <DisclosurePanel className="sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as={Link}
                to={item.href}
                className={'active:bg-gray-900 active:text-white text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>
      {/* Dialog box */}
      <Dialog open={open} onClose={setOpen} className="relative z-50">
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
                <div className="sm:flex sm:items-start items-center">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                    <ExclamationTriangleIcon aria-hidden="true" className="size-7 text-red-500" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                      Confirm Sign out
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to logout ? You'll need to log in again to access your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  disabled={loading}
                  type="button"
                  onClick={signout}
                  className={loading ? "cursor-not-allowed inline-flex w-full justify-center rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset sm:ml-3 sm:w-auto" : "cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-50 ring-1 ring-gray-300 ring-inset sm:ml-3 sm:w-auto"}
                >
                  {loading ? <svg class="size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Signout'}

                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => { setOpen(false) }}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs cursor-pointer hover:bg-indigo-500 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}