import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import { FaCheckSquare, FaRegSquare } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

interface AddFirefighterProps {
  username: string;
  refreshFirefighters: () => void;
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const AddFirefighter: React.FC<AddFirefighterProps> = ({
  username,
  refreshFirefighters,
}) => {
  const [firefighterUsername, setFirefighterUsername] = useState<string>("");
  const [firefighterFirstName, setFirefighterFirstName] = useState<string>("");
  const [firefighterSecondName, setFirefighterSecondName] =
    useState<string>("");
  const [isDriver, setIsDriver] = useState<boolean>(false);
  const [isCommander, setIsCommander] = useState<boolean>(false);
  const [isTechnicalRescue, setIsTechnicalRescue] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>("");
  const [userExist, setUserExist] = useState<boolean>();
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  const token = Cookies.get("token"); // Get the token from cookies

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

  const handleCheckUsername = async () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/user/check-user/${firefighterUsername}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        }
      );
      setUserExist(response.data);
    } catch (error) {
      console.error("Error checking username:", error);
    }
  };

  const handleAddFirefighter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userExist === null || userExist === false) {
      setSubmitError("Please check the username");
      return;
    }

    // Concatenate first and second names
    const fullName = `${firefighterFirstName} ${firefighterSecondName}`;

    const requestData = {
      firefighterUsername,
      firefighterName: fullName,
      isDriver,
      isCommander,
      isTechnicalRescue,
    };

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await axios.post(
        `${apiBaseUrl}/api/firefighters/add-with-username?username=${username}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        //const responseData = response.data;
        //console.log("Response Data:", responseData);

        // Reset input fields
        setFirefighterUsername("");
        setFirefighterFirstName("");
        setFirefighterSecondName("");
        setIsDriver(false);
        setIsCommander(false);
        setIsTechnicalRescue(false);

        // Show success popup
        setShowSuccessPopup(true);
        setSubmitError(null); // Clear any previous error
        refreshFirefighters();
      } else {
        const errorText = response.data.data || "Unknown error";
        setSubmitError(`Error: ${errorText}`);
        console.error("Error:", errorText);
      }
    } catch (error: any) {
      console.error("Error:", error);
      setSubmitError(`${error.response.data.message || error.message}`);
    }
  };

  return (
    <div className="flex flex-1 w-1/2 mt-6 bg-gray-800 mx-auto">
      <div className="w-full border flex-col flex p-4">
        <h2 className="text-2xl font-semibold mb-8">Add New Firefighter</h2>
        <form
          onSubmit={handleAddFirefighter}
          className="flex flex-col h-full justify-between"
        >
          <div className="mt-16">
            <div>
              <label className="block mb-2">Username:</label>
              <div className="flex">
                <div className="w-2/3">
                  <input
                    className={`text-base text-black border-2 rounded p-2 w-full mb-4 ${
                      userExist === true
                        ? "border-green-500"
                        : userExist === false
                        ? "border-red-500"
                        : "border"
                    }`}
                    type="text"
                    value={firefighterUsername}
                    onChange={(e) => setFirefighterUsername(e.target.value)}
                    required
                    placeholder="Enter Chief Username"
                  />
                </div>
                <div className="w-1/3 ml-2">
                  <button
                    className="bg-blue-500 text-white rounded py-2 px-4 w-full h-3/4"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCheckUsername();
                    }}
                  >
                    <span className="geocode-button">Check</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex">
              <label className="block mb-2 w-1/2">First Name:</label>
              <label className="block mb-2 w-1/2">Second Name:</label>
            </div>

            <div className="flex mb-6">
              <input
                className="text-base text-black border rounded p-2 w-1/2 mr-2"
                type="text"
                value={firefighterFirstName}
                onChange={(e) =>
                  setFirefighterFirstName(capitalizeFirstLetter(e.target.value))
                }
                required
                placeholder="Enter First Name"
              />
              <input
                className="text-base text-black border rounded p-2 w-1/2"
                type="text"
                value={firefighterSecondName}
                onChange={(e) =>
                  setFirefighterSecondName(
                    capitalizeFirstLetter(e.target.value)
                  )
                }
                required
                placeholder="Enter Second Name"
              />
            </div>

            <div className="flex mb-2">
              <div className="flex mb-20">
                <div className="flex items-center">
                  <div
                    className="cursor-pointer mr-1"
                    onClick={() => setIsDriver(!isDriver)}
                  >
                    {isDriver ? (
                      <FaCheckSquare size={28} color="#4299e1" />
                    ) : (
                      <FaRegSquare size={28} color="#4299e1" />
                    )}
                  </div>
                  <label className="mr-6" htmlFor="driver">
                    Driver
                  </label>
                </div>

                <div className="flex items-center">
                  <div
                    className="cursor-pointer mr-1"
                    onClick={() => setIsCommander(!isCommander)}
                  >
                    {isCommander ? (
                      <FaCheckSquare size={28} color="#4299e1" />
                    ) : (
                      <FaRegSquare size={28} color="#4299e1" />
                    )}
                  </div>
                  <label className="mr-6" htmlFor="commander">
                    Commander
                  </label>
                </div>

                <div className="flex items-center">
                  <div
                    className="cursor-pointer mr-1"
                    onClick={() => setIsTechnicalRescue(!isTechnicalRescue)}
                  >
                    {isTechnicalRescue ? (
                      <FaCheckSquare size={28} color="#4299e1" />
                    ) : (
                      <FaRegSquare size={28} color="#4299e1" />
                    )}
                  </div>
                  <label htmlFor="technicalRescue">Technical Rescue</label>
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <p className="text-red-500 mb-2 border border-red-500 p-2 rounded-md mt-auto">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white rounded py-2 px-4 w-full"
          >
            Add New Firefighter
          </button>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="bg-green-500 text-white py-4 px-6 rounded absolute bottom-4 right-4 w-96 h-32 flex flex-col">
          <span className="mb-auto mt-auto text-center">
            Firefighter added successfully!
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

export default AddFirefighter;
