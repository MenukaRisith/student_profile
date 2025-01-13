import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { fetchFromApi } from "../utils/api";

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    indexNumber: "",
    studentClass: "",
    birthday: "",
    profilePicture: null as File | null,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let profilePictureBase64 = null;
    if (formData.profilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        profilePictureBase64 = reader.result as string;

        const data = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          indexNumber: formData.indexNumber,
          studentClass: formData.studentClass,
          birthday: formData.birthday,
          profilePicture: profilePictureBase64,
        };

        sendRegisterRequest(data);
      };
      reader.readAsDataURL(formData.profilePicture);
    } else {
      const data = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        indexNumber: formData.indexNumber,
        studentClass: formData.studentClass,
        birthday: formData.birthday,
        profilePicture: null,
      };
      sendRegisterRequest(data);
    }
  };

  const sendRegisterRequest = async (data: object) => {
    try {
      const response = await fetchFromApi("/students/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.studentId) {
        navigate("/login");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Register</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="indexNumber"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Index Number
            </label>
            <input
              id="indexNumber"
              name="indexNumber"
              type="text"
              value={formData.indexNumber}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="studentClass"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Class
            </label>
            <input
              id="studentClass"
              name="studentClass"
              type="text"
              value={formData.studentClass}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="birthday"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Birthday
            </label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="profilePicture"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Profile Picture
            </label>
            <input
              id="profilePicture"
              name="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterScreen;
