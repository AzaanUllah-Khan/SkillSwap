import { useNavigate, useParams } from "react-router-dom"
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../assets/Firebase/Firebase";
import { ExclamationTriangleIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { onAuthStateChanged } from "firebase/auth";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { toast, ToastContainer } from "react-toastify";

const SeeProfile = () => {
    const nav = useNavigate()
    const { id } = useParams()
    const [Uuid, setUuid] = useState("")
    const [data, setData] = useState([])
    const [editUid, setEditUid] = useState("")
    const [open, setOpen] = useState(false)
    const [openP, setOpenP] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editSkill, setEditSkill] = useState("")
    const [editDesc, setEditDesc] = useState("")
    const [editStatus, setEditStatus] = useState("")
    const [dataLoading, setDataLoading] = useState(true);
    const [user, setUser] = useState("")
    const getData = async () => {
        try {
            const q = query(collection(db, "Skills"), where("uid", "==", id));
            const querySnapshot = await getDocs(q);
            const dataArr = [];
            querySnapshot.forEach((doc) => {
                dataArr.push({ id: doc.id, ...doc.data() });
            });
            setData(dataArr);
        } catch (error) {
            console.error("Failed to fetch skills:", error);
        } finally {
            setDataLoading(false);
        }
    };

    const getUid = () => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUuid(user.uid);
                getData();
            } else {
                setOpenP(true);
                setDataLoading(false);
            }
        });
    };

    const getUserName = async () => {
        try {
            const docRef = doc(db, "Users", id);
            const docSnap = await getDoc(docRef);
            setUser(docSnap.data().name)
        } catch { }
    }

    useEffect(() => {
        getUid()
    }, [])

    useEffect(() => {
        if(id){
            getUserName()
        }
    }, [id])

    useEffect(() => {
        document.title = `Skills - ${user}`
    }, [user])

    if (dataLoading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const delThis = async (id) => {
        await deleteDoc(doc(db, "Skills", id));
        getData()
        toast.success("Document Deleted Successfully")
    }
    const toEdit = async (id) => {
        setEditUid(id)

        const docRef = doc(db, "Skills", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setEditSkill(docSnap.data().skill)
            setEditDesc(docSnap.data().description)
            setEditStatus(docSnap.data().status)
        } else {
            console.log("No such document!");
        }
        setOpen(true)
    }
    const editThis = async (e) => {
        setLoading(true)
        const washingtonRef = doc(db, "Skills", e);
        try {
            await updateDoc(washingtonRef, {
                skill: editSkill,
                description: editDesc,
                status: editStatus
            })
            setLoading(false)
            toast.success("Document Updated Successfully")
            setOpen(false)
            getData()
        } catch {
            setLoading(false)
            toast.error("Failed to update document")
        }
    }
    return (
        <>
            <ToastContainer />
            <div className="flex flex-wrap justify-center items-start gap-5 p-6">
                {data.map(function (elem, idx) {
                    return <div key={idx} className="w-full sm:w-auto sm:min-w-70 bg-white border-1 border-gray-200 rounded-lg">
                        <div className="px-5 py-3 rounded-t-xl">
                            <h1 className="text-xl font-semibold mb-1">{elem.skill}</h1>
                            <h1 className="mb-2">{elem.description}</h1>
                            <button className={`text-white px-2.5 py-0.5 rounded text-sm mb-1 ${elem.status == "Teach" ? "bg-green-400" : "bg-yellow-400"}`}>{elem.status}</button>
                            <div className="flex flex-wrap justify-start items-center gap-1.5 my-3">
                                {elem.tags.map(function (e, i) {
                                    return <button key={i} className="bg-white border-1 border-indigo-600 text-indigo-600 py-0.5 px-2.5 rounded font-medium">{e.toUpperCase()}</button>
                                })}
                            </div>
                            <h1 className="text-sm text-gray-600">{elem.author}</h1>
                        </div>
                        {elem.uid == Uuid ? <div className="flex gap-3 justify-end items-center border-t-1 border-gray-300 py-3 px-5"><PencilSquareIcon onClick={() => toEdit(elem.id)} className="size-5 text-indigo-600 cursor-pointer hover:text-indigo-400" /><TrashIcon onClick={() => delThis(elem.id)} className="size-5 text-red-600 cursor-pointer hover:text-red-400" /></div> : ""}
                    </div>
                })}
            </div>
            {/* Dialog Panel */}
            <Dialog open={open} onClose={() => { }} className="relative z-10">
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
                                <div className="sm:flex sm:items-start flex-col gap-3">
                                    <div className="text-center sm:text-left w-full">
                                        <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                            Skill
                                        </DialogTitle>
                                        <input
                                            name="skill"
                                            value={editSkill}
                                            onChange={(e) => { setEditSkill(e.target.value) }}
                                            type="text"
                                            className="w-full mt-2 border-1 border-gray-200 rounded py-1 px-3 focus:outline-none"
                                        />
                                    </div>
                                    <div className="mt-3 text-center sm:text-left w-full">
                                        <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                            Description
                                        </DialogTitle>
                                        <input
                                            name="desc"
                                            value={editDesc}
                                            onChange={(e) => { setEditDesc(e.target.value) }}
                                            type="text"
                                            className="w-full mt-2 border-1 border-gray-200 rounded py-1 px-3 focus:outline-none"
                                        />
                                    </div>
                                    <div className="mt-3 text-center sm:text-left w-full">
                                        <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                            Status
                                        </DialogTitle>
                                        <div className="w-full flex justify-start items-center gap-2 mt-3">
                                            <button onClick={() => setEditStatus("Teach")} className={`${editStatus == "Teach" ? "border-none bg-indigo-600 text-white font-semibold" : ""} border-1 border-indigo-600 text-indigo-600 text-sm px-4 py-1 cursor-pointer rounded`}>Teach</button>
                                            <button onClick={() => setEditStatus("Learn")} className={`${editStatus == "Learn" ? "border-none bg-indigo-600 text-white font-semibold" : ""} border-1 border-indigo-600 text-indigo-600 text-sm px-4 py-1 cursor-pointer rounded`}>Learn</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="gap-3 bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button disabled={loading}
                                    type="button"
                                    onClick={() => editThis(editUid)}
                                    className={loading ? "cursor-not-allowed flex justify-center rounded-md bg-indigo-400 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs" : "cursor-pointer flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"}
                                >
                                    {loading ? <svg className="size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save Changes'}
                                </button>
                                <button
                                    disabled={loading}
                                    type="button"
                                    onClick={() => {
                                        setEditSkill("")
                                        setEditDesc("")
                                        setEditStatus("")
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
            {/* Dialog Panel 2 */}
            <Dialog open={openP} onClose={() => { }} className="relative z-10">
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

export default SeeProfile
