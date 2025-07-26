import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../assets/Firebase/Firebase"
import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { addDoc, arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const AddSkill = () => {
    const [username, setUsername] = useState("")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [active, setActive] = useState("Teach")
    const [skill, setSkill] = useState("")
    const [tags, setTags] = useState([]);
    const [input, setInput] = useState("");
    const [desc, setDesc] = useState("");
    const [Uuid, setUid] = useState("")

    const nav = useNavigate()

    const checkLogin = () => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const uid = user.uid;
                setUid(uid)
                const docRef = doc(db, "Users", uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUsername(docSnap.data().name);
                } else {
                    console.log("No such document!");
                }
            } else {
                setOpen(true)
            }
        });
    }
    useEffect(() => {
        document.title = "Add Skill | SkillSwap.";
        checkLogin()
    }, [])

    const handleKeyDown = (e) => {
        if (e.key === "," && input.trim() !== "") {
            e.preventDefault();

            const newTag = input.trim().replace(/,$/, "");
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInput("");
        }

        if (e.key === "Backspace" && input === "" && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const subSkill = async (e) => {
        e.preventDefault();
        setLoading(true)

        if (!skill.trim() || !desc.trim() || tags.length === 0) {
            toast.error("Please complete all fields");
            setLoading(false)
            return;
        }

        const cleanTags = tags.map(tag => tag.trim().toLowerCase());

        try {
            await addDoc(collection(db, "Skills"), {
                author: username,
                author_lower: username.toLowerCase(),
                skill,
                skill_lower: skill.toLowerCase(),
                status: active,
                description: desc,
                tags: cleanTags,
                uid: Uuid
            });

            const userRef = doc(db, "Users", Uuid);
            if (active === "Teach") {
                await updateDoc(userRef, {
                    toTeach: arrayUnion(skill)
                });
            } else {
                await updateDoc(userRef, {
                    toLearn: arrayUnion(skill)
                });
            }

            toast.success("Skill added successfully!");
            setSkill("");
            setDesc("");
            setTags([]);
        } catch (error) {
            console.error("Error adding skill: ", error);
            toast.error("Something went wrong. Please try again.");
        }

        setLoading(false);
        setTimeout(() => {
            nav('/')
        }, 2000);
    }


    return (
        <>
            <ToastContainer />
            <div>
                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
                            Add Skill
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form onSubmit={(e) => { subSkill(e) }} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                                    Display Name
                                </label>
                                <input
                                    id="name"
                                    value={username}
                                    type="text"
                                    readOnly
                                    className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 outline-1 outline-gray-300 sm:text-sm cursor-not-allowed text-gray-700"
                                />
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                                    Skill Name
                                </label>
                                <input
                                    id="name"
                                    value={skill}
                                    onChange={(e) => { setSkill(e.target.value) }}
                                    type="text"
                                    placeholder="Eg: Graphic Design"
                                    className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">
                                    Status
                                </label>
                                <div className="flex mt-2 justfify-start items-start gap-3">
                                    <button onClick={() => setActive("Teach")} type="button" className={`sm:text-sm border-gray-200 focus:outline-none cursor-pointer py-1 px-4 rounded hover:border-indigo-600 transition ease-in-out duration-300 ${active == "Teach" ? "bg-indigo-600 text-white font-semibold" : "bg-transparent border-1"}`}>Teach</button>
                                    <button onClick={() => setActive("Learn")} type="button" className={`sm:text-sm border-gray-200 focus:outline-none cursor-pointer py-1 px-4 rounded hover:border-indigo-600 transition ease-in-out duration-300 ${active == "Learn" ? "bg-indigo-600 text-white font-semibold" : "bg-transparent border-1"}`}>Learn</button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="desc" className="block text-sm font-medium text-gray-900">
                                    Description
                                </label>
                                <textarea
                                    id="desc"
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    rows="2"
                                    className="mt-2 block px-3 py-1.5 w-full text-gray-900 rounded outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
                                    placeholder={`Eg: ${active == "Teach" ? `I can teach ${skill || "Graphic Designing"}` : `I want to learn ${skill || "Graphic Designing"}`}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">
                                    Tags
                                </label>
                                <div className="mt-2 w-full p-2 outline-1 outline-gray-300 rounded text-gray-900">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {tags.map((tag, index) => (
                                            <div
                                                key={index}
                                                className="bg-transparent text-indigo-600 px-2 gap-1 py-1 rounded flex justify-between items-center outline-1 outline-indigo-600"
                                            >
                                                <p className="sm:text-sm">{tag}</p>
                                            </div>
                                        ))}

                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="flex-grow min-w-[120px] border-none focus:outline-none sm:text-sm"
                                            placeholder={tags.length === 0 ? "Enter tags seperated by comma" : ""}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button disabled={loading}
                                    className={loading ? "cursor-not-allowed flex w-full justify-center rounded-md bg-indigo-400 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs" : "cursor-pointer flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"}
                                >
                                    {loading ? <svg class="mr-3 -ml-1 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                {/* Dialog box */}
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
            </div>
        </>
    )
}

export default AddSkill
