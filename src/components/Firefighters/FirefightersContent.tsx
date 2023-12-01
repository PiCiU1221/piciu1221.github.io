import React, { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";
import axios from "axios";

import AddFirefighter from "./AddFirefighter";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaTimes } from "react-icons/fa";

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
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

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

  const refreshFirefighters = async () => {
    try {
      await fetchFirefighters(page);
      await fetchNextPageCount();
    } catch (error) {
      console.error("Error refreshing firefighters:", error);
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

  const handleDeleteFirefighter = (firefighter: Firefighter) => {
    setSelectedFirefighter(firefighter);
    setIsDeleteConfirmationOpen(true);
  };

  useEffect(() => {
    if (showSuccessPopup) {
      // Automatically hide the popup after 5 seconds
      const timeoutId = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 5000);

      // Clear the timeout when the component unmounts or when the popup is manually closed
      return () => clearTimeout(timeoutId);
    }
  }, [showSuccessPopup]);

  const confirmDelete = async () => {
    if (!selectedFirefighter) {
      console.error("No firefighter selected for deletion.");
      return;
    }

    const username = selectedFirefighter.firefighterUsername;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await axios.delete(
        `${apiBaseUrl}/api/firefighters/${username}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        // Successful deletion, you may want to update the UI or fetch the firefighters again
        console.log("Firefighter deleted successfully");
      } else {
        // Handle other status codes or errors
        console.error("Error deleting firefighter");
      }
    } catch (error) {
      console.error("Error deleting firefighter:", error);
    }

    // Close the modal after deletion
    setIsDeleteConfirmationOpen(false);
    setSelectedFirefighter(null);
    setShowSuccessPopup(true);
    refreshFirefighters();
  };

  const handleAddNewFirefighter = () => {
    setShowAddForm(true);
  };

  const handleBackToFirefighters = () => {
    setShowAddForm(false);
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold ml-6">Firefighters</h2>
        <div className="flex items-center">
          {userRole === "COMMANDER" && (
            <button
              className="bg-green-500 text-white rounded-lg py-2 px-4 w-64 mr-4 h-9 flex items-center justify-center"
              onClick={
                showAddForm ? handleBackToFirefighters : handleAddNewFirefighter
              }
            >
              {showAddForm ? "Back" : "+ Add New Firefighter"}
            </button>
          )}
        </div>
      </div>
      {showAddForm ? (
        <AddFirefighter
          username={username}
          refreshFirefighters={refreshFirefighters}
        />
      ) : isLoading ? (
        <div className="flex justify-center items-center flex-grow">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="w-1/2 mx-auto mt-8">
          <ul>
            {firefighters.map((firefighter) => (
              <li key={firefighter.firefighterId} className="mb-2">
                <div
                  className={`relative w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-300`}
                >
                  <button
                    onClick={() => handleFirefighterClick(firefighter)}
                    className="flex justify-between items-center text-left w-full"
                  >
                    <div>
                      <p className="font-semibold">
                        {firefighter.firefighterName}
                      </p>
                      <p className="text-gray-400">
                        {firefighter.firefighterUsername}
                      </p>
                    </div>
                    <span
                      className={`float-right ${
                        selectedFirefighter === firefighter
                          ? "transform rotate-180"
                          : ""
                      } transition-transform duration-300`}
                    >
                      ↓
                    </span>
                  </button>

                  {selectedFirefighter === firefighter && (
                    <div>
                      <div className="mt-4 flex items-center justify-center">
                        <div className="flex items-center mb-2">
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
                      {userRole === "COMMANDER" && (
                        <div className="flex justify-end w-full">
                          <button
                            className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-lg"
                            onClick={() => handleDeleteFirefighter(firefighter)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

          <DeleteConfirmationModal
            isOpen={isDeleteConfirmationOpen}
            onCancel={() => setIsDeleteConfirmationOpen(false)}
            onConfirm={confirmDelete}
            firefighterName={
              selectedFirefighter ? selectedFirefighter.firefighterName : ""
            }
          />
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="bg-yellow-600 text-white py-4 px-6 rounded absolute bottom-4 right-4 w-96 h-32 flex flex-col">
          <span className="mb-auto mt-auto text-center">
            Firefighter deleted successfully
          </span>
          <button
            className="text-white absolute top-2 right-2 focus:outline-none"
            onClick={() => setShowSuccessPopup(false)}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default FirefightersContent;
