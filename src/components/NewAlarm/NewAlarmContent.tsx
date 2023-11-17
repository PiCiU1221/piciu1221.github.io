import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";

import { FaTimes } from "react-icons/fa";

// Load MapDisplay dynamically
const MapDisplayDynamic = dynamic(() => import("./MapDisplay"), {
  loading: () => <p>Loading Map...</p>,
  ssr: false, // This disables server-side rendering for the component
});

// Define the FireDepartment interface
interface FireDepartment {
  departmentId: number;
  departmentName: string;
  departmentCity: string;
  departmentStreet: string;
  departmentLatitude: number;
  departmentLongitude: number;
  distance?: number;
  duration?: number;
}

// Define the NewAlarmContent component
const NewAlarmContent = () => {
  // States
  const [addressInput, setAddressInput] = useState<string>("");
  const [geocodedAddress, setGeocodedAddress] = useState<any | null>(null);
  const [fireDepartments, setFireDepartments] = useState<FireDepartment[]>([]);
  const [selectedFireDepartments, setSelectedFireDepartments] = useState<
    FireDepartment[]
  >([]);
  const [selectedFireDepartmentNames, setSelectedFireDepartmentNames] =
    useState<string[]>([]);
  const [alarmDescription, setAlarmDescription] = useState<string>("");
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [showStartupPopup, setShowStartupPopup] = useState(true);

  const token = Cookies.get("token"); // Get the token from cookies

  // Handle form submission to geocode the address
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  // Handle clicking on a fire department marker
  const handleMarkerClick = (selectedDepartment: FireDepartment | null) => {
    if (!geocodedAddress) {
      return;
    }

    if (selectedDepartment) {
      // Check if the department is already selected
      const isAlreadySelected = selectedFireDepartments.some(
        (dep) => dep.departmentId === selectedDepartment.departmentId
      );

      if (isAlreadySelected) {
        // Deselect the department by filtering it out
        const updatedSelectedDepartments = selectedFireDepartments.filter(
          (dep) => dep.departmentId !== selectedDepartment.departmentId
        );
        setSelectedFireDepartments(updatedSelectedDepartments);
        setSelectedFireDepartmentNames((prevNames) =>
          prevNames.filter((name) => name !== selectedDepartment.departmentName)
        );
      } else {
        // Select the department
        setSelectedFireDepartments((prevSelected) => [
          ...prevSelected,
          selectedDepartment,
        ]);
        setSelectedFireDepartmentNames((prevNames) => [
          ...prevNames,
          selectedDepartment.departmentName,
        ]);

        fetchRoute(selectedDepartment);
      }
    } else {
      // Deselect all departments
      setSelectedFireDepartments([]);
      setSelectedFireDepartmentNames([]);
    }
  };

  const fetchRoute = async (selectedDepartment: FireDepartment) => {
    // Check if geocodedAddress is defined before making the API call
    if (!geocodedAddress) {
      console.log("geocodedAddress is undefined. Skipping API call.");
      return;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;

      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        //`http://localhost:8081/ors/v2/directions/driving-car`,
        {
          params: {
            api_key: apiKey,
            start: `${geocodedAddress.lon},${geocodedAddress.lat}`,
            end: `${selectedDepartment.departmentLongitude},${selectedDepartment.departmentLatitude}`,
          },
        }
      );

      const route = response.data.features[0];
      const distance = route.properties.segments[0].distance / 1000;
      const duration = route.properties.segments[0].duration / 60;

      // Update the selected department with distance and duration
      setSelectedFireDepartments((prevSelected) =>
        prevSelected.map((dep) =>
          dep.departmentId === selectedDepartment.departmentId
            ? { ...dep, distance, duration }
            : dep
        )
      );
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Fetch fire departments on component mount
  useEffect(() => {
    const fetchFireDepartments = async () => {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      try {
        const response = await axios.get<FireDepartment[]>(
          `${apiBaseUrl}/api/fire-departments/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the header
            },
          }
        );
        setFireDepartments(response.data);
      } catch (error) {
        console.error("Error fetching fire departments:", error);
      }
    };

    fetchFireDepartments();
  }, []);

  // Handle form submission to dispatch the alarm
  const handleDispatch = async () => {
    if (!geocodedAddress) {
      setDispatchError("Please geolocate an address.");
      return;
    }

    if (!alarmDescription) {
      setDispatchError("Please add alarm description.");
      return;
    }

    if (selectedFireDepartments.length === 0) {
      setDispatchError("Please select at least one fire department.");
      return;
    }

    // Reset dispatch error if conditions are met
    setDispatchError(null);

    if (geocodedAddress && selectedFireDepartments.length > 0) {
      // Split the display_name by comma
      const addressComponents = geocodedAddress.display_name.split(",");

      // Extract the street (index 1) and city (index 4) values
      const street =
        addressComponents[1].trim() + " " + addressComponents[0].trim();
      const city = addressComponents[4].trim();

      const alarmData = {
        city: city,
        street: street,
        description: alarmDescription,
        selectedDepartments: selectedFireDepartments.map(
          (dep) => dep.departmentId
        ),
      };

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.post(
          `${apiBaseUrl}/api/alarm/dispatch`,
          alarmData,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the header
            },
          }
        );
        console.log("Alarm dispatched:", response.data);
        setShowSuccessPopup(true);

        // Reset form after successful dispatch
        setAddressInput("");
        setGeocodedAddress(null);
        setAlarmDescription("");
        setSelectedFireDepartments([]);
        setSelectedFireDepartmentNames([]);
      } catch (error) {
        console.error("Error dispatching alarm:", error);
      }
    } else {
      console.log("Cannot dispatch without address and selected departments");
    }
  };

  // Render the NewAlarmContent component
  return (
    <div className="flex flex-col w-full h-screen px-8">
      <h2 className="text-3xl mb-4 ml-6 font-semibold">New Alarm</h2>
      <div className="flex justify-center flex-1 mt-6 bg-gray-800">
        {/* Form for geocoding address */}
        <div
          className="flex-3 border p-4"
          style={{ flex: "0 0 30%", display: "flex", flexDirection: "column" }}
        >
          <h3 className="text-lg font-semibold mb-4 text-center">
            Alarm Information
          </h3>

          <form onSubmit={handleSubmit}>
            <label className="block mb-2">Enter Address:</label>
            <input
              className="text-base text-black border rounded p-2 w-full mb-2"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              required
              placeholder="Enter Address"
            />
            <button className="bg-blue-500 text-white rounded py-2 px-4 w-full">
              <span className="geocode-button">Geocode</span>
            </button>
          </form>

          <h3 className="text-lg font-semibold mb-2 mt-16">
            Geocoded Address:
          </h3>
          {geocodedAddress ? (
            <p>{geocodedAddress.display_name}</p>
          ) : (
            <p>No geocoded address available</p>
          )}

          {/* Alarm Description */}
          <div className="mb-8 mt-16 flex-grow">
            <label className="block mb-2">Alarm Description:</label>
            <textarea
              className="border rounded p-2 w-full h-full text-black resize-none text-base"
              value={alarmDescription}
              onChange={(e) => setAlarmDescription(e.target.value)}
              required
              spellCheck={false}
              placeholder="Enter Alarm Description"
            />
          </div>

          {/* Dispatch Button */}
          {dispatchError && (
            <p className="text-red-500 mt-4 border border-red-500 p-2 rounded-md">
              {dispatchError}
            </p>
          )}
          <button
            className="bg-blue-500 text-white rounded mt-4 py-3 px-4 w-full text-xl font-semibold"
            onClick={handleDispatch}
          >
            Dispatch
          </button>
        </div>

        {/* Dynamic MapDisplay component */}
        <div className="flex-4 border p-4" style={{ flex: "0 0 40%" }}>
          <MapDisplayDynamic
            latitude={
              geocodedAddress ? parseFloat(geocodedAddress.lat) : 52.1006
            }
            longitude={
              geocodedAddress ? parseFloat(geocodedAddress.lon) : 19.3752
            }
            zoom={geocodedAddress ? 17 : 6}
            showMarker={geocodedAddress ? true : false}
            fireDepartments={fireDepartments}
            selectedFireDepartments={selectedFireDepartments}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Display selected fire departments */}
        <div className="flex-3 border p-4" style={{ flex: "0 0 30%" }}>
          <h3 className="text-lg font-semibold mb-4 text-center">
            Selected Fire Departments:
          </h3>
          {selectedFireDepartmentNames.map((name) => (
            <div key={name} className="mb-4">
              <button
                className="bg-transparent hover:bg-gray-900 border border-white rounded py-1 px-2 w-full mb-2 flex flex-col items-center"
                onClick={() => {
                  const department = selectedFireDepartments.find(
                    (dep) => dep.departmentName === name
                  );
                  if (department) {
                    handleMarkerClick(department);
                  }
                }}
              >
                <div className="mb-2">{name}</div>
                <div className="flex justify-between w-full">
                  <div>
                    {selectedFireDepartments.map((department) => {
                      if (department.departmentName === name) {
                        return (
                          <div key={department.departmentId} className="flex">
                            {geocodedAddress ? (
                              <p>
                                Distance:{" "}
                                {department.distance !== undefined
                                  ? `${department.distance.toFixed(
                                      2
                                    )} kilometers`
                                  : "Loading..."}
                              </p>
                            ) : null}

                            {geocodedAddress == undefined && (
                              <div className="w-full text-center">
                                <p>You haven't geocoded any address yet.</p>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <div>
                    {selectedFireDepartments.map((department) => {
                      if (department.departmentName === name) {
                        return (
                          <div key={department.departmentId} className="flex">
                            {geocodedAddress ? (
                              <p>
                                Duration:{" "}
                                {department.duration !== undefined
                                  ? department.duration.toFixed(2) + " minutes"
                                  : "Loading... "}
                              </p>
                            ) : null}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
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

      <div className="bg-yellow-600 text-white py-4 px-6 rounded absolute bottom-4 right-4 w-96 h-96 flex flex-col">
        <span className="mb-auto mt-auto">
          To test the dispatch, use this website to open the desktop app in the
          browser:
          <br />
          <br />
          <a
            href="https://firesignaldesktopapp.onrender.com"
            className="text-blue-500 underline"
          >
            firesignaldesktopapp.onrender.com
          </a>
          <br />
          <br />
          Use this test account:
          <br />
          <strong>Username:</strong> anowak
          <br />
          <strong>Password:</strong> anowak
          <br />
          <br />
          then dispatch an alarm for the fire department in the middle of
          Stargard.
        </span>
        <button
          className="text-white absolute top-2 right-2 focus:outline-none"
          onClick={() => setShowStartupPopup(false)}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default NewAlarmContent;
