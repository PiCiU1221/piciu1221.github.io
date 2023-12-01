import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import Cookies from "js-cookie";

import { FaCheckSquare, FaRegSquare } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

interface AddFirefighterProps {
  refreshFireDepartments: () => void;
}

// Load FireDepartmentGeocodingMap dynamically
const FireDepartmentGeocodingMapDynamic = dynamic(
  () => import("./FireDepartmentGeocodingMap"),
  {
    loading: () => <p>Loading Map...</p>,
    ssr: false,
  }
);

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Define the AddFireDepartment component
const AddFireDepartment: React.FC<AddFirefighterProps> = ({
  refreshFireDepartments,
}) => {
  const [addressInput, setAddressInput] = useState<string>("");
  const [geocodedAddress, setGeocodedAddress] = useState<any | null>(null);
  const [chiefUsername, setChiefUsername] = useState<string>("");
  const [chiefFirstName, setChiefFirstName] = useState<string>("");
  const [chiefSecondName, setChiefSecondName] = useState<string>("");
  const [isDriver, setIsDriver] = useState<boolean>(false);
  const [isCommander, setIsCommander] = useState<boolean>(false);
  const [isTechnicalRescue, setIsTechnicalRescue] = useState<boolean>(false);
  const [departmentName, setDepartmentName] = useState<string>("");
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

  const handleGeocode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.get<any[]>(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            format: "json",
            q: addressInput,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        setGeocodedAddress(response.data[0]);
      } else {
        setGeocodedAddress(null);
      }
    } catch (error) {
      console.error("Error while geocoding:", error);
      setGeocodedAddress(null);
    }
  };

  const handleCheckUsername = async () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/user/check-user/${chiefUsername}`,
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

  const handleAddFireDepartment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!geocodedAddress) {
      setSubmitError("Please geolocate an address.");
      return;
    }

    if (userExist === null || userExist === false) {
      setSubmitError("Please check the username");
      return;
    }

    // Split the display_name by comma
    const addressComponents = geocodedAddress.display_name.split(",");

    // Extract the street (index 1) and city (index 4) values
    const street =
      addressComponents[1].trim() + " " + addressComponents[0].trim();
    const city = addressComponents[4].trim();

    // Prepare the data without making the actual request
    const requestData = {
      departmentName,
      departmentCity: city,
      departmentStreet: street,
      departmentLatitude: parseFloat(geocodedAddress.lat).toFixed(8),
      departmentLongitude: parseFloat(geocodedAddress.lon).toFixed(8),
      chiefUsername,
      chiefFirstName,
      chiefSecondName,
      isDriver,
      isCommander,
      isTechnicalRescue,
    };

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await axios.post(
        `${apiBaseUrl}/api/fire-departments/add`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        }
      );

      // Check if the request was successful
      if (response.status === 200) {
        //const responseData = response.data;
        //console.log("Response Data:", responseData);

        // Reset input fields
        setAddressInput("");
        setGeocodedAddress(null);
        setChiefUsername("");
        setChiefFirstName("");
        setChiefSecondName("");
        setIsDriver(false);
        setIsCommander(false);
        setIsTechnicalRescue(false);
        setDepartmentName("");

        // Show success popup
        setShowSuccessPopup(true);
        setSubmitError(null); // Clear any previous error
        refreshFireDepartments();
      } else {
        const errorText = response.data || "Unknown error";
        setSubmitError(`Error: ${errorText}`);
        console.error("Error:", errorText);
      }
    } catch (error: any) {
      console.error("Error:", error);
      setSubmitError(`${error.response.data.message || error.message}`);
    }
  };

  return (
    <div className="flex flex-1 w-full mt-6 bg-gray-800">
      <div className="w-1/3 border p-4">
        <FireDepartmentGeocodingMapDynamic
          latitude={geocodedAddress ? parseFloat(geocodedAddress.lat) : 52.1006}
          longitude={
            geocodedAddress ? parseFloat(geocodedAddress.lon) : 19.3752
          }
          zoom={geocodedAddress ? 17 : 6}
          showMarker={geocodedAddress ? true : false}
        />
      </div>
      <div className="w-2/3 border flex-col flex p-4">
        <h2 className="text-2xl font-semibold mb-8">Add New Fire Department</h2>

        {/* Geocoding Form */}
        <form onSubmit={handleGeocode} className="mb-4">
          <label className="block mb-2">Enter Department Address:</label>
          <div className="flex">
            <div className="w-2/3">
              <input
                className="text-base text-black border rounded p-2 w-full"
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                required
                placeholder="Enter Address"
              />
            </div>
            <div className="w-1/3 ml-2">
              <button className="bg-blue-500 text-white rounded py-2 px-4 w-full">
                <span className="geocode-button">Geocode</span>
              </button>
            </div>
          </div>
        </form>

        {/* Geocoded Address Display */}
        <h3 className="text-lg font-semibold mb-2 mt-4">Geocoded Address:</h3>
        {geocodedAddress ? (
          <p>{geocodedAddress.display_name}</p>
        ) : (
          <p>No geocoded address available</p>
        )}

        {/* Additional Fields Form */}
        <form
          onSubmit={handleAddFireDepartment}
          className="mt-auto flex flex-col mt-4"
        >
          <label className="block mb-2 mt-2">Department Name:</label>
          <input
            className="text-base text-black border rounded p-2 w-full mb-2"
            type="text"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            required
            placeholder="Enter Department Name"
          />

          <div className="mt-2">
            <label className="block mb-2">Chief Username:</label>
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
                  value={chiefUsername}
                  onChange={(e) => setChiefUsername(e.target.value)}
                  required
                  placeholder="Enter Chief Username"
                />
              </div>
              <div className="w-1/3 ml-2">
                <button
                  className="bg-blue-500 text-white rounded py-2 px-4 w-full h-3/4"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent the form submission
                    handleCheckUsername();
                  }}
                >
                  <span className="geocode-button">Check</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex">
            <label className="block mb-2 w-1/2">Chief First Name:</label>
            <label className="block mb-2 w-1/2">Chief Second Name:</label>
          </div>

          <div className="flex mb-6">
            <input
              className="text-base text-black border rounded p-2 w-1/2 mr-2"
              type="text"
              value={chiefFirstName}
              onChange={(e) =>
                setChiefFirstName(capitalizeFirstLetter(e.target.value))
              }
              required
              placeholder="Enter Chief First Name"
            />
            <input
              className="text-base text-black border rounded p-2 w-1/2"
              type="text"
              value={chiefSecondName}
              onChange={(e) =>
                setChiefSecondName(capitalizeFirstLetter(e.target.value))
              }
              required
              placeholder="Enter Chief Second Name"
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

          {submitError && (
            <p className="text-red-500 mb-2 border border-red-500 p-2 rounded-md">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white rounded py-2 px-4 w-full"
          >
            Add New Fire Department
          </button>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="bg-green-500 text-white py-4 px-6 rounded absolute bottom-4 right-4 w-96 h-32 flex flex-col">
          <span className="mb-auto mt-auto text-center">
            Fire department added successfully!
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

export default AddFireDepartment;
