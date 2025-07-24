import { collection, query, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../assets/Firebase/Firebase";
import { Link } from "react-router-dom";

const Home = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getData = async () => {
        setLoading(true);
        const q = query(collection(db, "Skills"));
        const querySnapshot = await getDocs(q);
        const dataArr = [];
        querySnapshot.forEach((doc) => {
            dataArr.push({ id: doc.id, ...doc.data() });
        });
        setData(dataArr);
        setLoading(false);
    };

    useEffect(() => {
        getData();
    }, []);

    if (loading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }


    return (
        <div className="flex flex-wrap justify-start items-start gap-5 p-6">
            {data.map((elem, idx) => (
                <div key={idx} className="min-w-60 border-1 border-gray-200 px-4 py-3 rounded-lg">
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
    );
};

export default Home;
