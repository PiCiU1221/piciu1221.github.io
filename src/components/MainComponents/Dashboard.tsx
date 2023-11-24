import React, { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";
import axios from "axios";

import NewAlarmContent from "../NewAlarm/NewAlarmContent";
import AlarmsContent from "../AlarmsContent";
import FireDepartmentsContent from "../FireDepartments/FireDepartmentsContent";
import FireEnginesContent from "../FireEnginesContent";
import FirefightersContent from "../FirefightersContent";
import LoadingScreen from "../Helpers/LoadingScreen";

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

interface DashboardProps {
  activeMenu: string;
}

const Dashboard: React.FC<DashboardProps> = ({ activeMenu }) => {
  const [username, setUsername] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [hasFireDepartment, setHasFireDepartment] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchUserData = async () => {
    try {
      const token = Cookies.get("token");
      if (token) {
        const decodedToken = jwtDecode<JwtPayload>(token);
        const fetchedUsername = decodedToken ? decodedToken.sub : "";
        setUsername(fetchedUsername);

        const response = await axios.get(
          `${apiBaseUrl}/api/auth/user-role?username=${fetchedUsername}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.role) {
          setUserRole(response.data.role);
        }
      }
    } catch (error) {
      console.error("Error during fetching user data:", error);
      setError("Error fetching user data");
    } finally {
      // Loading is set to false only if both userRole and hasFireDepartment are set
      if (userRole !== "" && (userRole === "ADMIN" || hasFireDepartment)) {
        setIsLoading(false);
      }
    }
  };

  const checkFireDepartment = async () => {
    try {
      if (username && userRole !== "ADMIN") {
        const response = await axios.get(
          `${apiBaseUrl}/api/firefighters/has-department?username=${username}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );

        setHasFireDepartment(response.data.data);
      }
    } catch (error) {
      console.error("Error checking fire department:", error);
      setError("Error checking fire department");
    } finally {
      // Loading is set to false only if both userRole and hasFireDepartment are set
      if (userRole !== "" && (userRole === "ADMIN" || hasFireDepartment)) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchUserData(), checkFireDepartment()]);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingScreen isLoading={isLoading} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center flex-1 px-6 py-8 mx-auto h-screen text-2xl">
        <p>{error}</p>
      </div>
    );
  }

  if (!hasFireDepartment && userRole !== "ADMIN") {
    return (
      <div className="flex items-center justify-center flex-1 px-6 py-8 mx-auto h-screen text-2xl">
        <p>Contact your fire chief to assign you to a fire department.</p>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 mx-auto h-screen">
        {activeMenu === "new-alarm" && <NewAlarmContent />}
        {activeMenu === "alarms" && <AlarmsContent />}
        {activeMenu === "fire-departments" && <FireDepartmentsContent />}
        {activeMenu === "fire-engines" && <FireEnginesContent />}
        {activeMenu === "firefighters" && <FirefightersContent />}
      </div>
    );
  }
};

export default Dashboard;
