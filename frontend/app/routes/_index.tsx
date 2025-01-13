import { useState } from "react";
import { useNavigate } from "@remix-run/react";

const IndexPage = () => {
  const [indexNo, setIndexNo] = useState<string>("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (indexNo.trim()) {
      navigate(`/profile/${indexNo}`);
    } else {
      alert("Please enter a valid index number.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Student Portal</h1>
        
        <form onSubmit={handleSearch} className="flex items-center mb-6">
          <input
            type="text"
            value={indexNo}
            onChange={(e) => setIndexNo(e.target.value)}
            placeholder="Enter Index Number"
            className="flex-grow border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none"
          >
            Search
          </button>
        </form>

        <div className="flex justify-between">
          <a
            href="/login"
            className="text-blue-500 hover:underline"
          >
            Login
          </a>
          <a
            href="/register"
            className="text-blue-500 hover:underline"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
