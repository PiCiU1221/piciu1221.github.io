import React, { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";
import axios from "axios";

import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

interface Firefighter {
  firefighterId: number;
  fireDepartment: {
    departmentId: number;
    departmentName: string;
    departmentCity: string;
    departmentStreet: string;
    departmentLatitude: number;
    departmentLongitude: number;
    departmentChiefUserId: number;
  };
  firefighterName: string;
  firefighterUsername: string;
  firefighterCommander: boolean;
  firefighterDriver: boolean;
  firefighterTechnicalRescue: boolean;
}

const FirefightersContent = () => {
  const [username, setUsername] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [firefighters, setFirefighters] = useState<Firefighter[]>([]);
  const [selectedFirefighter, setSelectedFirefighter] =
    useState<Firefighter | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [nextPageCount, setNextPageCount] = useState<number>(0);

  const fetchUserRole = async (username: string) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/auth/user-role?username=${username}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (response.data.role) {
        setUserRole(response.data.role);
      }
    } catch (error) {
      console.error("Error during fetching user role:", error);
    }
  };

  const fetchFirefighters = async (page: number) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      let response;

      if (userRole === "ADMIN") {
        response = await axios.get<Firefighter[]>(
          `${apiBaseUrl}/api/firefighters?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );
      } else {
        // Make the new API call for non-admin users
        response = await axios.get<Firefighter[]>(
          `${apiBaseUrl}/api/firefighters/firefighters-by-username?page=${page}&username=${username}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );
      }

      setFirefighters(response.data);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching firefighters:", error);
    }
  };

  const handleFirefighterClick = (firefighter: Firefighter) => {
    setSelectedFirefighter(
      firefighter === selectedFirefighter ? null : firefighter
    );
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (nextPageCount > 0) {
      setPage(page + 1);
    }
  };

  const fetchNextPageCount = async () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      let response;

      if (userRole === "ADMIN") {
        response = await axios.get<Firefighter[]>(
          `${apiBaseUrl}/api/firefighters?page=${page + 1}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );
      } else {
        // Make the new API call for non-admin users
        response = await axios.get<Firefighter[]>(
          `${apiBaseUrl}/api/firefighters/firefighters-by-username?page=${
            page + 1
          }&username=${username}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );
      }

      setNextPageCount(response.data.length);
    } catch (error) {
      console.error("Error fetching next page count:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("token");
      const decodedToken = token ? jwtDecode<JwtPayload>(token) : null;
      const fetchedUsername = decodedToken ? decodedToken.sub : "";
      setUsername(fetchedUsername);

      try {
        await fetchUserRole(fetchedUsername);
      } catch (error) {
        console.error("Error during data fetching:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (username !== "" && userRole !== "") {
      fetchFirefighters(page);
      fetchNextPageCount();
    }
  }, [page, username, userRole]);

  return (
    <div className="flex flex-col w-full h-screen px-8">
      <h2 className="text-3xl mb-4 ml-6 font-semibold">Firefighters</h2>
      {isLoading ? (
        <div className="flex justify-center items-center flex-grow">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="w-1/2 mx-auto mt-8">
          <ul>
            {firefighters.map((firefighter) => (
              <li key={firefighter.firefighterId} className="mb-2">
                <button
                  className={`w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-300`}
                  onClick={() => handleFirefighterClick(firefighter)}
                  style={{
                    height:
                      selectedFirefighter === firefighter ? "auto" : "4rem",
                  }}
                >
                  <div className="flex justify-between text-left">
                    <div>
                      <p className="font-semibold">
                        {firefighter.firefighterName}
                      </p>
                      <p className="text-gray-400">
                        {firefighter.firefighterUsername}
                      </p>
                    </div>
                    {userRole === "ADMIN" && (
                      <p className="text-gray-400 ml-auto mr-2">
                        {firefighter.fireDepartment.departmentName}
                      </p>
                    )}
                    <span
                      className={`float-right ${
                        selectedFirefighter === firefighter
                          ? "transform rotate-180"
                          : ""
                      } transition-transform duration-300`}
                    >
                      ↓
                    </span>
                  </div>
                  {selectedFirefighter === firefighter && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="flex">
                        <p className="mr-4">
                          Commander:{" "}
                          {firefighter.firefighterCommander ? (
                            <FontAwesomeIcon icon={faCheck} />
                          ) : (
                            <FontAwesomeIcon icon={faTimes} />
                          )}
                        </p>
                        <p className="mr-4">
                          Driver:{" "}
                          {firefighter.firefighterDriver ? (
                            <FontAwesomeIcon icon={faCheck} />
                          ) : (
                            <FontAwesomeIcon icon={faTimes} />
                          )}
                        </p>
                        <p>
                          Technical Rescue:{" "}
                          {firefighter.firefighterTechnicalRescue ? (
                            <FontAwesomeIcon icon={faCheck} />
                          ) : (
                            <FontAwesomeIcon icon={faTimes} />
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-between mt-2 mb-4">
            <button
              className={`bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 w-1/5 ${
                page === 0 ? "opacity-50 cursor-not-allowed" : "bg-gray-300"
              }`}
              onClick={handlePreviousPage}
              disabled={page === 0}
            >
              Previous
            </button>
            <span className="text-xl flex items-center">{page + 1}</span>
            <button
              className={`bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 w-1/5 ${
                nextPageCount === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-gray-300"
              }`}
              onClick={handleNextPage}
              disabled={nextPageCount === 0}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirefightersContent;
