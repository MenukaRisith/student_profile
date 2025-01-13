import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { fetchFromApi } from "../utils/api";
import jsPDF from "jspdf";

interface Achievement {
  achievementId: string;
  studentId: string;
  date: string;
  description: string;
}

interface Role {
  roleId: string;
  studentId: string;
  roleName: string;
  societyName: string;
  yearAppointed: number;
  yearEnded?: number | null;
}

interface Behavior {
  behaviorId: string;
  studentId: string;
  type: "good" | "bad";
  description: string;
  date: string;
}

interface StudentDetails {
  fullName: string;
  class: string;
  email: string;
  profilePicture: string | null;
  achievements: Achievement[];
}

interface DashboardData {
  userId: string;
  email: string;
  role: string;
  profilePicture: string | null;
  createdAt: string;
  class?: string;
}

interface Request {
  requestId: string;
  studentId: string;
  details: string;
  requestType: "role" | "behavior";
  societyName?: string | null;
  yearAppointed?: number | null;
  yearEnded?: number | null;
  createdAt: string;
}

interface Certificate {
  certId: string;
  indexNumber: string;
  issuedByUserId: string;
  issuedByName: string;
  dateIssued: string;
  description: string;
  blockHash: string;
  behaviors?: string;
  achievements?: string;
  societyDetails?: string;
}

interface SocietyAdminDashboardProps {
  onAssignRole: (
    indexNumber: string,
    roleName: string,
    societyName: string,
    yearAppointed: string,
    yearEnded: string
  ) => void;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }
  
        console.log("Fetching dashboard data...");
  
        const dashboardResponse = await fetchFromApi("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Dashboard Response:", dashboardResponse);
  
        setUserRole(dashboardResponse.role);
        setDashboardData(dashboardResponse.dashboardData);
  
        if (dashboardResponse.studentDetails) {
          setStudentDetails(dashboardResponse.studentDetails);
        }
  
        if (dashboardResponse.role === "admin") {
          const requestsResponse = await fetchFromApi("/requests", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Requests Response:", requestsResponse);
          setRequests(requestsResponse.requests);
        }
  
        const certificatesResponse = await fetchFromApi("/certificates", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Certificates Response:", certificatesResponse);
  
        if (certificatesResponse.certificates) {
          setCertificates(certificatesResponse.certificates);
        } else {
          console.log("No certificates found.");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard. Please try again later.");
      }
    };
  
    fetchDashboardData();
  }, [navigate]);
  
  
    const handleLogout = () => {
      localStorage.removeItem("authToken");
      navigate("/login");
    };
  
    const handleAddStudent = async (indexNumber: string, teacherClass: string) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
  
        const response = await fetchFromApi("/teachers/add-student", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ indexNumber, class: teacherClass }),
        });
  
        alert(response.message);
      } catch (err) {
        alert("Failed to add student.");
      }
    };
  
    const handleAssignRole = async (indexNumber: string, roleName: string, societyName: string) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
  
        const currentYear = new Date().getFullYear(); 
        const yearAppointed = currentYear;
        const yearEnded = null; 
  
        const response = await fetchFromApi("/societies/assign-role", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            indexNumber,
            role: roleName,
            societyName,
            yearAppointed,
            yearEnded,
          }),
        });
  
        alert(response.message);
      } catch (err) {
        alert("Failed to assign role.");
      }
    };
  
    const handleCreateAchievementRequest = async (indexNumber: string, description: string) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
  
        const response = await fetchFromApi("/teachers/create-achievement", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ indexNumber, description }),
        });
  
        alert(response.message);
      } catch (err) {
        alert("Failed to create achievement request.");
      }
    };
  
    const handleApproveRequest = async (requestId: string, requestType: string, status: string) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
  
        let endpoint = "";
        if (requestType === "role") {
          endpoint = "/admins/approve-role";
        } else if (requestType === "behavior") {
          endpoint = "/admins/approve-behavior";
        } else if (requestType === "achievement") {
          endpoint = "/admins/approve-achievement";
        }
  
        const response = await fetchFromApi(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId, status }),
        });
  
        alert(response.message);
      } catch (err) {
        alert("Failed to approve request.");
      }
    };   

    const handleAddBehavior = async (indexNumber: string, type: string, description: string) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
    
        const response = await fetchFromApi("/teachers/add-behavior", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ indexNumber, type, description }),
        });
    
        alert(response.message);
      } catch (err) {
        alert("Failed to add behavior.");
      }
    };

    const handleGenerateCertificate = async (indexNumber: string, description: string) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          alert("Unauthorized. Please log in.");
          navigate("/login");
          return;
        }
    
        const response = await fetchFromApi("/certificates/generate", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ indexNumber, description }),
        });
    
        if (response.ok) {
          const { certificate } = await response.json();
          alert("Certificate generated successfully!");
          setCertificates((prev) => [...prev, certificate]); 
        } else {
          const error = await response.json();
          alert(error.message || "Failed to generate certificate.");
        }
      } catch (err) {
        alert("Failed to generate certificate. Please try again.");
        console.error(err);
      }
    };
    
    const renderDashboardContent = () => {
      switch (userRole) {
        case "admin":
          return <AdminDashboard requests={requests} certificates={certificates} onGenerateCertificate={handleGenerateCertificate} onApproveRequest={handleApproveRequest} />;
          case "teacher":
            return (
              <TeacherDashboard
                onAddStudent={handleAddStudent}
                onCreateAchievementRequest={handleCreateAchievementRequest}
                onAddBehavior={handleAddBehavior}
                classList={dashboardData.map((data) => data.class || "").filter(Boolean)}
              />
            );        case "societyAdmin":
          return <SocietyAdminDashboard onAssignRole={handleAssignRole} />;
        case "student":
          return <StudentDashboard studentDetails={studentDetails} />;
        default:
          return <p className="text-black">No role-specific dashboard available.</p>;
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
        <div className="w-full max-w-5xl bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-black">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          {userRole ? (
            <>{renderDashboardContent()}</>
          ) : (
            <p className="text-black">Loading...</p>
          )}
        </div>
      </div>
    );
  };  

  const AdminDashboard = ({
    requests,
    certificates,
    onGenerateCertificate,
    onApproveRequest,
  }: {
    requests: Request[];
    certificates: Certificate[];
    onGenerateCertificate: (indexNumber: string, description: string) => Promise<void>;
    onApproveRequest: (requestId: string, requestType: string, status: string) => void;
  }) => {
    const [indexNumber, setIndexNumber] = useState<string>("");
    const [description, setDescription] = useState<string>("");
  
    const handleGenerateCertificateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (indexNumber && description) {
        try {
          await onGenerateCertificate(indexNumber, description);
          alert("Certificate generated successfully!");
          setIndexNumber("");
          setDescription("");
        } catch (error) {
          alert("Failed to generate certificate.");
          console.error(error);
        }
      } else {
        alert("Please fill out both fields.");
      }
    };
  
    const handleGeneratePDF = (certificate: Certificate) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const behaviors = certificate.behaviors ? JSON.parse(certificate.behaviors) : [];
      const achievements = certificate.achievements ? JSON.parse(certificate.achievements) : [];
      const societyDetails = certificate.societyDetails ? JSON.parse(certificate.societyDetails) : [];
    
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Student Profile Report", pageWidth / 2, 20, { align: "center" });
    
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Certificate Details", 10, 40);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Certificate ID: ${certificate.certId}`, 10, 50);
      doc.text(`Index Number: ${certificate.indexNumber}`, 10, 60);
      doc.text(`Description: ${certificate.description}`, 10, 70);
      doc.text(`Issued By: ${certificate.issuedByName} (${certificate.issuedByUserId})`, 10, 80);
      doc.text(`Date Issued: ${new Date(certificate.dateIssued).toLocaleDateString()}`, 10, 90);
      doc.text(`Block Hash: ${certificate.blockHash}`, 10, 100);
    
      if (behaviors.length > 0) {
        let y = 110;
        doc.setFont("helvetica", "bold");
        doc.text("Behaviors", 10, y);
        doc.setFont("helvetica", "normal");
        behaviors.forEach((behavior: Behavior, index: number) => {
          y += 10;
          doc.text(`${index + 1}. ${behavior.type.toUpperCase()}: ${behavior.description}`, 15, y);
        });
      }
    
      if (achievements.length > 0) {
        let y = behaviors.length > 0 ? 120 + behaviors.length * 10 + 10 : 120;
        doc.setFont("helvetica", "bold");
        doc.text("Achievements", 10, y);
        doc.setFont("helvetica", "normal");
        achievements.forEach((achievement: Achievement, index: number) => {
          y += 10;
          doc.text(`${index + 1}. ${achievement.description} (${new Date(achievement.date).toLocaleDateString()})`, 15, y);
        });
      }
    
      if (societyDetails.length > 0) {
        let y =
          120 +
          (behaviors.length > 0 ? behaviors.length * 10 + 10 : 0) +
          (achievements.length > 0 ? achievements.length * 10 + 10 : 0);
        doc.setFont("helvetica", "bold");
        doc.text("Society Details", 10, y);
        doc.setFont("helvetica", "normal");
        societyDetails.forEach((role: Role, index: number) => {
          y += 10;
          doc.text(
            `${index + 1}. ${role.roleName} - ${role.societyName} (Year Appointed: ${role.yearAppointed}, Year Ended: ${
              role.yearEnded || "Ongoing"
            })`,
            15,
            y
          );
        });
      }
    
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, pageHeight - 10);
      doc.text("Powered by Student Profile System", pageWidth - 70, pageHeight - 10);
    
      doc.save(`Student_Profile_${certificate.indexNumber}.pdf`);
    };    
  
    return (
      <div>
        <h2 className="text-xl font-semibold text-black mb-4">Admin Dashboard</h2>
  
        <h3 className="text-lg font-semibold text-black mb-2">Pending Requests</h3>
        {requests.length > 0 ? (
          <table className="table-auto w-full mb-6">
            <thead>
              <tr className="text-left text-black border-b">
                <th className="px-4 py-2">Student ID</th>
                <th className="px-4 py-2">Request Type</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.requestId} className="border-b">
                  <td className="px-4 py-2 text-black">{request.studentId}</td>
                  <td className="px-4 py-2 text-black">{request.requestType}</td>
                  <td className="px-4 py-2 text-black">
                    {JSON.parse(request.details).description || JSON.parse(request.details).roleName}
                  </td>
                  <td className="px-4 py-2 text-black">
                    <button
                      onClick={() => onApproveRequest(request.requestId, request.requestType, "approved")}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onApproveRequest(request.requestId, request.requestType, "rejected")}
                      className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No pending requests.</p>
        )}
  
        <form onSubmit={handleGenerateCertificateSubmit} className="mb-6">
          <h3 className="text-lg font-semibold text-black mb-2">Generate Certificate</h3>
          <div className="mb-4">
            <label htmlFor="indexNumber" className="block text-black font-medium mb-2">
              Student Index Number
            </label>
            <input
              type="text"
              id="indexNumber"
              value={indexNumber}
              onChange={(e) => setIndexNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter student index number"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-black font-medium mb-2">
              Certificate Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter certificate description"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate Certificate
          </button>
        </form>
  
        <h3 className="text-lg font-semibold text-black mb-2">Generated Certificates</h3>
        {certificates.length > 0 ? (
          <ul className="list-disc pl-5">
            {certificates.map((certificate) => (
              <li key={certificate.certId} className="mb-2 text-black">
                <strong>Certificate ID:</strong> {certificate.certId} <br />
                <strong>Index Number:</strong> {certificate.indexNumber} <br />
                <strong>Description:</strong> {certificate.description} <br />
                <strong>Issued By:</strong> {certificate.issuedByName} ({certificate.issuedByUserId}) <br />
                <strong>Date Issued:</strong> {new Date(certificate.dateIssued).toLocaleDateString()} <br />
                <strong>Block Hash:</strong> {certificate.blockHash} <br />
                <button
                  onClick={() => handleGeneratePDF(certificate)}
                  className="bg-blue-500 text-white px-2 py-1 mt-2 rounded"
                >
                  Download PDF
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No certificates generated yet.</p>
        )}
      </div>
    );
};
  
const TeacherDashboard = ({
  onAddStudent,
  onAddBehavior,
  onCreateAchievementRequest,
  classList,
}: {
  onAddStudent: (indexNumber: string, teacherClass: string) => void;
  onAddBehavior: (indexNumber: string, type: string, description: string) => void;
  onCreateAchievementRequest: (indexNumber: string, description: string) => void;
  classList: string[] | undefined; 
}) => {
  const safeClassList = classList || [];

  const [indexNumber, setIndexNumber] = useState("");
  const [teacherClass, setTeacherClass] = useState<string>(safeClassList[0] || "");
  const [behaviorIndexNumber, setBehaviorIndexNumber] = useState("");
  const [behaviorType, setBehaviorType] = useState("good");
  const [behaviorDescription, setBehaviorDescription] = useState("");
  const [achievementIndexNumber, setAchievementIndexNumber] = useState("");
  const [achievementDescription, setAchievementDescription] = useState("");

  const handleStudentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (indexNumber && teacherClass) {
      onAddStudent(indexNumber, teacherClass);
      setIndexNumber("");
    } else {
      alert("Please fill out all fields.");
    }
  };

  const handleBehaviorFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (behaviorIndexNumber && behaviorType && behaviorDescription) {
      onAddBehavior(behaviorIndexNumber, behaviorType, behaviorDescription);
      setBehaviorIndexNumber("");
      setBehaviorDescription("");
    } else {
      alert("Please fill out all fields.");
    }
  };

  const handleAchievementFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (achievementIndexNumber && achievementDescription) {
      onCreateAchievementRequest(achievementIndexNumber, achievementDescription);
      setAchievementIndexNumber("");
      setAchievementDescription("");
    } else {
      alert("Please fill out all fields.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-black mb-2">Teacher Dashboard</h2>
      <p className="text-black">Manage your classes, behaviors, and students&apos; achievements.</p>

      <form onSubmit={handleStudentFormSubmit} className="mt-4">
        <h3 className="text-lg font-semibold text-black mb-2">Add Student</h3>
        <div className="mb-4">
          <label htmlFor="indexNumber" className="block text-black font-medium mb-2">
            Student Index Number
          </label>
          <input
            type="text"
            id="indexNumber"
            value={indexNumber}
            onChange={(e) => setIndexNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter student index number"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="teacherClass" className="block text-black font-medium mb-2">
            Class
          </label>
          <select
            id="teacherClass"
            value={teacherClass}
            onChange={(e) => setTeacherClass(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {safeClassList.length > 0 ? (
              safeClassList.map((cls, index) => (
                <option key={index} value={cls}>
                  {cls}
                </option>
              ))
            ) : (
              <option value="">No classes available</option>
            )}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Student
        </button>
      </form>

      <form onSubmit={handleBehaviorFormSubmit} className="mt-8">
        <h3 className="text-lg font-semibold text-black mb-2">Add Behavior</h3>
        <div className="mb-4">
          <label htmlFor="behaviorIndexNumber" className="block text-black font-medium mb-2">
            Student Index Number
          </label>
          <input
            type="text"
            id="behaviorIndexNumber"
            value={behaviorIndexNumber}
            onChange={(e) => setBehaviorIndexNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter student index number"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="behaviorType" className="block text-black font-medium mb-2">
            Behavior Type
          </label>
          <select
            id="behaviorType"
            value={behaviorType}
            onChange={(e) => setBehaviorType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="good">Good</option>
            <option value="bad">Bad</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="behaviorDescription" className="block text-black font-medium mb-2">
            Description
          </label>
          <textarea
            id="behaviorDescription"
            value={behaviorDescription}
            onChange={(e) => setBehaviorDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter behavior description"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Behavior
        </button>
      </form>

      <form onSubmit={handleAchievementFormSubmit} className="mt-8">
        <h3 className="text-lg font-semibold text-black mb-2">Create Achievement</h3>
        <div className="mb-4">
          <label htmlFor="achievementIndexNumber" className="block text-black font-medium mb-2">
            Student Index Number
          </label>
          <input
            type="text"
            id="achievementIndexNumber"
            value={achievementIndexNumber}
            onChange={(e) => setAchievementIndexNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter student index number"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="achievementDescription" className="block text-black font-medium mb-2">
            Description
          </label>
          <textarea
            id="achievementDescription"
            value={achievementDescription}
            onChange={(e) => setAchievementDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter achievement description"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Achievement
        </button>
      </form>
    </div>
  );
};

const SocietyAdminDashboard = ({ onAssignRole }: SocietyAdminDashboardProps) => {
    const [indexNumber, setIndexNumber] = useState("");
    const [roleName, setRoleName] = useState("");
    const [societyName, setSocietyName] = useState("");
    const [yearAppointed, setYearAppointed] = useState("");
    const [yearEnded, setYearEnded] = useState("");
    const [error, setError] = useState<string | null>(null); 
    
    const roles = ["President", "Member", "Secretary", "Treasurer"];
  
    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
  
      setError(null);
  
      if (!indexNumber || !roleName || !societyName || !yearAppointed || !yearEnded) {
        setError("Please fill out all fields.");
        return;
      }
  
      onAssignRole(indexNumber, roleName, societyName, yearAppointed, yearEnded);
      
      setIndexNumber("");
      setRoleName("");
      setSocietyName("");
      setYearAppointed("");
      setYearEnded("");
    };
  
    return (
      <div>
        <h2 className="text-xl font-semibold text-black mb-2">Society Admin Dashboard</h2>
        <p className="text-black">Assign roles and manage society-related tasks.</p>
  
        {error && <p className="text-red-600 mb-4">{error}</p>}
    
        <form onSubmit={handleFormSubmit} className="mt-4">
          <div className="mb-4">
            <label htmlFor="indexNumber" className="block text-black font-medium mb-2">
              Student Index Number
            </label>
            <input
              type="text"
              id="indexNumber"
              value={indexNumber}
              onChange={(e) => setIndexNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter student index number"
            />
          </div>
    
          <div className="mb-4">
            <label htmlFor="roleName" className="block text-black font-medium mb-2">
              Role
            </label>
            <select
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              {roles.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
    
          <div className="mb-4">
            <label htmlFor="societyName" className="block text-black font-medium mb-2">
              Society Name
            </label>
            <input
              type="text"
              id="societyName"
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter society name"
            />
          </div>
  
          <div className="mb-4">
            <label htmlFor="yearAppointed" className="block text-black font-medium mb-2">
              Year Appointed
            </label>
            <input
              type="number"
              id="yearAppointed"
              value={yearAppointed}
              onChange={(e) => setYearAppointed(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter year appointed"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
  
          <div className="mb-4">
            <label htmlFor="yearEnded" className="block text-black font-medium mb-2">
              Year Ended (Leave blank if ongoing)
            </label>
            <input
              type="number"
              id="yearEnded"
              value={yearEnded}
              onChange={(e) => setYearEnded(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter year ended (if applicable)"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
    
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Assign Role
          </button>
        </form>
      </div>
    );
};

const StudentDashboard = ({ studentDetails }: { studentDetails: StudentDetails | null }) => (
  <div>
    <h2 className="text-xl font-semibold text-black mb-2">Student Dashboard</h2>
    {studentDetails ? (
      <>
        <p className="text-black">Full Name: {studentDetails.fullName}</p>
        <p className="text-black">Class: {studentDetails.class}</p>
        <p className="text-black">Email: {studentDetails.email}</p>
        {studentDetails.profilePicture && (
            <img src={`http://localhost:3000${studentDetails.profilePicture}`} alt="Profile" className="rounded-full w-24 h-24 mt-4" />
        )}
        <h3 className="mt-4">Achievements</h3>
        <ul>
          {studentDetails.achievements.map((achievement, index) => (
            <li key={index}>
              {achievement.description} - {achievement.date}
            </li>
          ))}
        </ul>
      </>
    ) : (
      <p className="text-gray-500 mt-4">No student-specific data available.</p>
    )}
  </div>
);

export default Dashboard;
