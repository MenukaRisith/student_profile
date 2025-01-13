import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; 
import axios, { AxiosError, isAxiosError } from 'axios';

interface Role {
  roleId: string;
  societyName: string;
  roleName: string;
  yearAppointed: number;
  yearEnded?: number;
}

interface Achievement {
  achievementId: string;
  date: string;
  description: string;
}

interface Behavior {
  behaviorId: string;
  date: string;
  description: string;
}

interface Profile {
  profilePicture: string;
  fullName: string;
  class: string;
  indexNumber: string;
  email: string;
  birthday: string;
  roles: Role[];
  achievements: Achievement[];
  behaviors: Behavior[];
}

interface ErrorResponse {
  message: string;
}

const PublicProfile: React.FC = () => {
  const { indexNumber } = useParams<{ indexNumber: string }>(); // Get indexNumber from the URL
  const [profileData, setProfileData] = useState<{ profile: Profile } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ profile: Profile }>(
          `http://localhost:3000/students/profile/${indexNumber}`
        );
        setProfileData(response.data);
      } catch (err) {
        if (isAxiosError(err)) {
          const axiosError = err as AxiosError<ErrorResponse>;
          setError(axiosError.response?.data?.message || 'Error fetching profile data');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [indexNumber]);

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  const { profile } = profileData!;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center p-6">
      <div className="bg-white shadow rounded-lg w-full max-w-3xl p-6">
        <div className="flex flex-col items-center">
          <img
            src={`http://localhost:3000${profile.profilePicture}`}
            alt={`${profile.fullName}'s profile`}
            className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{profile.fullName}</h1>
          <p className="text-gray-600">{profile.indexNumber} | {profile.class}</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">Activities and Societies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.roles.length > 0 ? (
            profile.roles.map((role) => (
              <div key={role.roleId} className="bg-gray-100 shadow rounded-lg p-4 text-center">
                <h3 className="text-lg font-bold text-gray-800">{role.societyName}</h3>
                <p className="text-gray-600">{role.roleName}</p>
                <p className="text-gray-500 text-sm">
                  {role.yearAppointed}
                  {role.yearEnded ? ` - ${role.yearEnded}` : ''}
                </p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-500">No roles assigned.</p>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.achievements.length > 0 ? (
            profile.achievements.map((achievement) => (
              <div key={achievement.achievementId} className="bg-gray-100 shadow rounded-lg p-4">
                <p className="text-gray-600">{achievement.description}</p>
                <p className="text-gray-500 text-sm">{new Date(achievement.date).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-500">No achievements recorded.</p>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">Good Behaviors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.behaviors.length > 0 ? (
            profile.behaviors.map((behavior) => (
              <div key={behavior.behaviorId} className="bg-gray-100 shadow rounded-lg p-4">
                <p className="text-gray-600">{behavior.description}</p>
                <p className="text-gray-500 text-sm">{new Date(behavior.date).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-500">No good behaviors recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
