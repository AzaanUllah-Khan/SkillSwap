import { collection, query, getDocs, where, orderBy, startAt, endAt } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../assets/Firebase/Firebase";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/16/solid'

const Home = () => {
    const type = [
        { id: 1, name: 'All' },
        { id: 2, name: 'Teach' },
        { id: 3, name: 'Learn' }
    ];

    const [selected, setSelected] = useState(type[0]);
    const [data, setData] = useState([]);
    const [inpVal, setInpVal] = useState(""); // Skill Name
    const [inpVal2, setInpVal2] = useState(""); // Author Name
    const [loading, setLoading] = useState(true);
    const [loggedin, setLoggedIn] = useState(false);

    const toShowFilter = () => {
        onAuthStateChanged(auth, (user) => {
            setLoggedIn(!!user);
        });
    };

    const getFilteredData = async () => {
        setLoading(true);
        try {
            const filters = [];
            const skillsRef = collection(db, "Skills");

            // Apply status filter if not "All"
            if (selected.name !== "All") {
                filters.push(where("status", "==", selected.name));
            }

            // Apply skill name filter
            if (inpVal.trim() !== "") {
                filters.push(where("skill_lower", "==", inpVal.toLowerCase()));
            }

            let q;

            // Apply author name with range search
            if (inpVal2.trim() !== "") {
                q = query(
                    skillsRef,
                    ...filters,
                    orderBy("author_lower"),
                    startAt(inpVal2.toLowerCase()),
                    endAt(inpVal2.toLowerCase() + '\uf8ff')
                );
            } else {
                q = query(skillsRef, ...filters);
            }

            const querySnapshot = await getDocs(q);
            const dataArr = [];
            querySnapshot.forEach((doc) => {
                dataArr.push({ id: doc.id, ...doc.data() });
            });

            setData(dataArr);
        } catch (error) {
            console.error("Filtering failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        toShowFilter();
        getFilteredData();
        document.title = "SkillSwap | Teach what you know. Learn what you want.";
    }, []);

    useEffect(() => {
        if (!loading) {
            getFilteredData();
        }
    }, [selected]);

    if (loading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col gap-6">
            {loggedin && (
                <div className="flex flex-col items-end gap-2 justify-start w-full sm:flex-row sm:items-start sm:gap-4">
                    <input
                        type="text"
                        value={inpVal2}
                        onChange={(e) => setInpVal2(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && getFilteredData()}
                        className="w-full border-1 border-gray-300 outline-none py-1.5 px-2 text-left text-gray-900 rounded-md"
                        placeholder="Search by Author Name"
                    />
                    <input
                        type="text"
                        value={inpVal}
                        onChange={(e) => setInpVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && getFilteredData()}
                        className="w-full border-1 border-gray-300 outline-none py-1.5 px-2 text-left text-gray-900 rounded-md"
                        placeholder="Search by Skill Name"
                    />
                    <Listbox value={selected} onChange={setSelected}>
                        <div className="relative w-full sm:w-50">
                            <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 border-1 border-gray-300 focus:outline-none sm:text-sm/6">
                                <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                                    <span className="block truncate">{selected.name}</span>
                                </span>
                                <ChevronDownIcon
                                    aria-hidden="true"
                                    className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                />
                            </ListboxButton>
                            <ListboxOptions
                                transition
                                className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm"
                            >
                                {type.map((elem) => (
                                    <ListboxOption
                                        key={elem.id}
                                        value={elem}
                                        className="group relative cursor-pointer py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                                    >
                                        <div className="flex items-center">
                                            <span className="pl-2 block truncate font-normal group-data-selected:font-semibold">
                                                {elem.name}
                                            </span>
                                        </div>
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </div>
                    </Listbox>
                </div>
            )}
            <div className="flex flex-wrap justify-start items-start gap-5">
                {data.map((elem, idx) => (
                    <div key={idx} className="w-full border-1 border-gray-200 px-4 py-3 rounded-lg sm:w-auto sm:min-w-60">
                        <Link to={`/seeprofile/${elem.uid}`}>
                            <h1 className="text-indigo-600 text-sm mb-2">{elem.author}</h1>
                        </Link>
                        <div className="flex w-full justify-between items-center mb-3 gap-5">
                            <h1 className="text-xl font-semibold">{elem.skill}</h1>
                            <button
                                className={`text-white px-2.5 py-0.5 rounded text-sm ${elem.status === "Teach" ? "bg-green-400" : "bg-yellow-400"}`}
                            >
                                {elem.status}
                            </button>
                        </div>
                        <Link
                            to={`/course/${elem.id}`}
                            className="hover:bg-indigo-500 bg-indigo-600 text-white px-2 py-1 rounded text-sm cursor-pointer"
                        >
                            View Details
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;