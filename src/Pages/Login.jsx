import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../assets/Firebase/Firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { query, collection, where, getDocs } from "firebase/firestore";
import { Bounce, toast, ToastContainer } from "react-toastify";


export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = "Login | SkillSwap.";
  }, [])

  const Log = (e) => {
    e.preventDefault()
    setLoading(true)
    signInWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        setLoading(false)
        setEmail("")
        setPass("")
        const user = userCredential.user;
        toast.success(`You are logged In`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
          onClose: () => { nav("/") }
        })
      })
      .catch((error) => {
        console.error(error);
        setLoading(false)

        let userMessage = "Something went wrong. Please try again.";

        if (error.response?.status === 404) {
          userMessage = "Sorry, the data you're looking for wasn't found.";
        } else if (error.response?.status === 401) {
          userMessage = "You are not authorized. Please log in again.";
        } else if (error.message.includes("Network Error")) {
          userMessage = "No internet connection. Please check your network.";
        } else if (error.code === "auth/invalid-credential") {
          userMessage = "Invalid Credentials";
        } else if (error.code === "auth/network-request-failed") {
          userMessage = "No internet connection. Please check your network.";
        }

        toast.error(userMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Bounce,
        });
      });
  }

  const resetPass = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const q = query(collection(db, "Users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await sendPasswordResetEmail(auth, email);
        setOpen(true);
      } else {
        toast.error(`${email} is not registered`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error.message);
      toast.error("Something went wrong: " + error.message);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={(e) => Log(e)}>
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  value={email}
                  onChange={(e) => { setEmail(e.target.value) }}
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <p onClick={resetPass} className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <input
                  value={pass}
                  onChange={(e) => { setPass(e.target.value) }}
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button disabled={loading}
                className={loading ? "cursor-not-allowed flex w-full justify-center rounded-md bg-indigo-400 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs" : "cursor-pointer flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"}
              >
                {loading ? <svg class="mr-3 -ml-1 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Login'}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Don't have an account ?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Signup
            </Link>
          </p>
        </div>
      </div>
      {/* Dialog box */}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
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
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:size-10">
                    <CheckCircleIcon aria-hidden="true" className="size-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                      Rest Password
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        An Email is sent to {email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 cursor-pointer sm:ml-3 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}