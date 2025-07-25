import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updateEmail, verifyBeforeUpdateEmail, updatePassword, deleteUser } from "firebase/auth";
import { auth, db } from "../assets/Firebase/Firebase";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";

const Profile = () => {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [userName, setUserName] = useState([])
    const [email, setEmail] = useState("")
    const [open, setOpen] = useState(false)
    const [openP, setOpenP] = useState(false)
    const [openPD, setOpenPD] = useState(false)
    const [bgColor, setBgColor] = useState("")
    const [textColor, setTextColor] = useState("")
    const [uid, setUid] = useState("")
    const [loading, setLoading] = useState(false)
    const [checkPass, setCheckPass] = useState("")
    const [checkPassD, setCheckPassD] = useState("")
    const [currentPass, setCurrentPass] = useState("")
    const [newPass, setNewPass] = useState("")
    const [confirmNewPass, setConfirmNewPass] = useState("")
    const [shakeError, setShakeError] = useState(false);
    const nav = useNavigate()
    const Info = () => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUid(user.uid)
                const docRef = doc(db, "Users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const nameArray = docSnap.data().name.split(" ");
                    setUserName(nameArray);
                    setBgColor(docSnap.data().bgColor)
                    setTextColor(docSnap.data().color)
                    setEmail(docSnap.data().email)
                    getFirstAndLastName(nameArray)
                } else {
                    console.log("No such document!");
                }

            } else {
                nav('/')
            }
        });
    }

    useEffect(() => {
        Info()
    }, [])
    
    useEffect(()=>{
        document.title = `Profile | ${firstName}`;
    },[firstName])

    const Avatar = () => {
        if (userName.length > 1) {
            return <img
                alt={userName.concat(" ")}
                src={`https://ui-avatars.com/api/?name=${userName[0]}+${userName[userName.length - 1]}&background=${bgColor.replace("#", "")}&color=${textColor.replace("#", "")}&bold=true`}
                className="size-12 rounded-md"
            />
        } else if (userName.length === 1) {
            return <img
                alt={userName.concat(" ")}
                src={`https://ui-avatars.com/api/?name=${userName[0]}&background=${bgColor.replace("#", "")}&color=${textColor.replace("#", "")}&bold=true`}
                className="size-12 rounded-md"
            />
        }
    }

    const changeAvatar = async () => {
        setLoading(true);
        const washingtonRef = doc(db, "Users", uid);

        try {
            await updateDoc(washingtonRef, {
                bgColor,
                color: textColor
            });
            toast.success("Avatar updated successfully.");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update avatar.");
        } finally {
            setLoading(false);
        }
    };


    const getFirstAndLastName = (userNameArray) => {

        const lastName = userNameArray[userNameArray.length - 1];
        const firstName = userNameArray.slice(0, -1).join(" ");

        setFirstName(firstName)
        setLastName(lastName)
    };
    const openDialog = (e) => {
        e.preventDefault()
        setOpenP(true)
    }
    const reauthenticateUser = async () => {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, checkPass);
        try {
            await reauthenticateWithCredential(user, credential);
            return true;
        } catch (error) {
            toast.error("Incorrect password. Please try again.");
            return false;
        }
    };

    const changeInfo = async () => {
        setLoading(true);

        const user = auth.currentUser;
        const nameChanged = firstName + " " + lastName;
        const emailChanged = email !== user.email;

        try {
            if (emailChanged) {
                const success = await reauthenticateUser();
                if (!success) {
                    setLoading(false);
                    return;
                }
                await verifyBeforeUpdateEmail(user, email);
                toast.success("Verification link sent to your new email. Please verify to complete the change.");
            }

            const docRef = doc(db, "Users", uid);
            await updateDoc(docRef, {
                name: nameChanged,
                ...(emailChanged && { email })
            });

            toast.success("Profile updated successfully.");
            setOpenP(false);
        } catch (error) {
            console.error("Error during profile update:", error);
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const changePass = async (e) => {
        e.preventDefault();

        if (newPass !== confirmNewPass) {
            toast.error("Passwords don't match");

            setShakeError(true);
            setTimeout(() => {
                setShakeError(false);
            }, 400);
            return;
        }

        try {
            setLoading(true)
            const user = auth.currentUser;

            const credential = EmailAuthProvider.credential(
                user.email,
                currentPass
            );

            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPass).then(() => {
                setCurrentPass("")
                setNewPass("")
                setConfirmNewPass("")
                setLoading(false)
            })

            toast.success("Password changed successfully!");

        } catch (error) {
            setLoading(false)
            console.error(error);
            if (error.code === "auth/wrong-password") {
                toast.error("Current password is incorrect");
            } else {
                toast.error("Failed to change password");
            }
        }
    };

    const deleteAccount = async () => {
        try {
            setLoading(true)
            const user = auth.currentUser;

            if (!user || !user.email) {
                setLoading(false);
                toast.error("User is not authenticated");
                return;
            }

            const credential = EmailAuthProvider.credential(
                user.email,
                checkPassD
            );

            await reauthenticateWithCredential(user, credential);
            await deleteUser(user)
            await deleteDoc(doc(db, "Users", uid));
            setLoading(false)
            toast.success("Account deleted successfully");
            nav("/login");
        } catch (error) {
            setLoading(false)
            console.error(error);
            if (error.code === "auth/wrong-password") {
                toast.error("Current password is incorrect");
            } else {
                toast.error("Failed to delete Account");
            }
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="bg-white text-gray-900 min-h-screen py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-16">
                    <form onSubmit={(e) => { openDialog(e) }} className="bg-white p-8 rounded-lg border-1 border-gray-200">
                        <h2 className="text-xl font-semibold mb-1">Personal Information</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Use a permanent address where you can receive mail.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                            {Avatar()}
                            <div>
                                <button type="button" onClick={() => setOpen(true)} className="bg-white-700 text-gray-800 px-4 py-2 rounded-md cursor-pointer border-1 border-gray-200">
                                    Edit Profile Picture
                                </button>
                                <p className="text-xs text-gray-400 mt-1">
                                    Change Background and Text color
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => { setFirstName(e.target.value) }}
                                placeholder="First name"
                                className="bg-white-700 text-gray-800 p-3 rounded-md w-full focus:outline-none border-1 border-gray-200"
                            />
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => { setLastName(e.target.value) }}
                                placeholder="Last name"
                                className="bg-white-700 text-gray-800 p-3 rounded-md w-full focus:outline-none border-1 border-gray-200"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value) }}
                                placeholder="Email address"
                                className="bg-white-700 text-gray-800 p-3 rounded-md w-full col-span-1 md:col-span-2 focus:outline-none border-1 border-gray-200"
                            />
                        </div>

                        <button className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-md">
                            Save
                        </button>
                    </form>

                    <form onSubmit={(e) => { changePass(e) }} className="bg-white p-8 rounded-xl border-1 border-gray-200">
                        <h2 className="text-xl font-semibold mb-1">Change password</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Update your password associated with your account.
                        </p>

                        <div className="space-y-4 mb-6">
                            <input
                                value={currentPass}
                                onChange={(e) => { setCurrentPass(e.target.value) }}
                                type="password"
                                placeholder="Current password"
                                className="bg-white-700 text-gray-800 p-3 rounded-md w-full focus:outline-none border-1 border-gray-200"
                            />
                            <input
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                type="password"
                                placeholder="New password"
                                id="pass2"
                                className={`bg-white-700 text-gray-800 p-3 rounded-md w-full focus:outline-none border-1 border-gray-200 transition duration-150 ease-in-out ${shakeError ? 'border-red-500 border-1' : ''}`}
                            />

                            <input
                                value={confirmNewPass}
                                onChange={(e) => setConfirmNewPass(e.target.value)}
                                type="password"
                                placeholder="Confirm password"
                                id="pass3"
                                className={`bg-white-700 text-gray-800 p-3 rounded-md w-full focus:outline-none border-1 border-gray-200 transition duration-150 ease-in-out ${shakeError ? 'border-red-500 border-1' : ''}`}
                            />

                        </div>

                        <button disabled={loading}
                            className={loading ? "w-full cursor-not-allowed flex justify-center rounded-md bg-indigo-400 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs sm:w-auto" : "w-full cursor-pointer flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"}
                        >
                            {loading ? <svg className="size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save Changes'}
                        </button>
                    </form>

                    <div className="flex justify-between items-center bg-white p-8 rounded-xl border-1 border-gray-200">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">Delete Account</h2>
                            <p className="text-sm text-gray-400">
                                Delete your SkillSwap account permenantly
                            </p>
                        </div>
                        <button onClick={() => { setOpenPD(true) }} className="cursor-pointer bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-md">Delete Account</button>
                    </div>
                </div>
                {/* Dialog Box */}
                <Dialog open={open} onClose={setOpen} className="relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center px-4 py-6 text-center sm:items-center sm:p-0">
                            <DialogPanel
                                transition
                                className="relative w-full max-w-lg transform overflow-hidden rounded-t-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:rounded-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-200 sm:mx-0 sm:size-10">
                                            {Avatar()}
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <label htmlFor="bgcolor" className="text-gray-800 block text-sm font-semibold">
                                                Background Color
                                            </label>
                                            <input
                                                id="bgcolor"
                                                name="bgcolor"
                                                type="color"
                                                value={bgColor}
                                                className="w-full mt-1"
                                                onChange={(e) => setBgColor(e.target.value)}
                                            />

                                            <label htmlFor="color" className="mt-5 block text-sm font-semibold text-gray-800">
                                                Text Color
                                            </label>
                                            <input
                                                id="color"
                                                name="color"
                                                type="color"
                                                value={textColor}
                                                className="w-full mt-1"
                                                onChange={(e) => setTextColor(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button disabled={loading}
                                        type="button"
                                        onClick={changeAvatar}
                                        className={loading ? "cursor-not-allowed flex justify-center rounded-md bg-indigo-400 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs" : "cursor-pointer flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"}
                                    >
                                        {loading ? <svg class="mr-3 -ml-1 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save Changes'}
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                    {/* For Pass Authentication */}
                </Dialog>
                <Dialog open={openP} onClose={setOpenP} className="relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center px-4 py-6 text-center sm:items-center sm:p-0">
                            <DialogPanel
                                transition
                                className="relative w-full max-w-lg transform overflow-hidden rounded-t-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:rounded-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:size-10">
                                            <InformationCircleIcon aria-hidden="true" className="size-6 text-indigo-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                                Enter Password
                                            </DialogTitle>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Enter your current password to save changes.
                                                </p>
                                            </div>
                                            <input
                                                id="pass"
                                                name="pass"
                                                type="password"
                                                onChange={(e) => { setCheckPass(e.target.value) }}
                                                className="w-full mt-3 border-1 border-gray-200 rounded py-1 px-3 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button disabled={loading}
                                        type="button"
                                        onClick={changeInfo}
                                        className={loading ? "sm:ml-3 w-full cursor-not-allowed flex justify-center rounded-md bg-indigo-400 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs sm:w-auto" : "w-full cursor-pointer flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto"}
                                    >
                                        {loading ? <svg className="size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        data-autofocus
                                        onClick={() => setOpenP(false)}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
                <Dialog open={openPD} onClose={setOpenPD} className="relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center px-4 py-6 text-center sm:items-center sm:p-0">
                            <DialogPanel
                                transition
                                className="relative w-full max-w-lg transform overflow-hidden rounded-t-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:rounded-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:size-10">
                                            <InformationCircleIcon aria-hidden="true" className="size-6 text-indigo-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                                Enter Password
                                            </DialogTitle>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Enter your current password to delete the account.
                                                </p>
                                            </div>
                                            <input
                                                id="pass"
                                                name="pass"
                                                type="password"
                                                onChange={(e) => { setCheckPassD(e.target.value) }}
                                                className="w-full mt-3 border-1 border-gray-200 rounded py-1 px-3 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button disabled={loading}
                                        type="button"
                                        onClick={deleteAccount}
                                        className={loading ? "sm:ml-3 w-full cursor-not-allowed flex justify-center rounded-md bg-red-400 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs sm:w-auto" : "w-full cursor-pointer flex justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto"}
                                    >
                                        {loading ? <svg className="size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Delete'}
                                    </button>
                                    <button
                                        type="button"
                                        data-autofocus
                                        onClick={() => setOpenPD(false)}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            </div >
        </>
    );
};

export default Profile;