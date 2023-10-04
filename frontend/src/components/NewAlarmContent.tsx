import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";

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
      }

      fetchRoute(selectedDepartment);
    } else {
      // Deselect all departments
      setSelectedFireDepartments([]);
      setSelectedFireDepartmentNames([]);
    }
  };

  const fetchRoute = async (selectedDepartment: FireDepartment) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;

      const response = await axios.get(
        //`https://api.openrouteservice.org/v2/directions/driving-car`,
        `http://localhost:8081/ors/v2/directions/driving-car`,
        {
          params: {
            //api_key: apiKey,
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
      try {
        const response = await axios.get<FireDepartment[]>(
          "/api/fire-departments/all",
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
        const response = await axios.post("/api/dispatch", alarmData, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        });
        console.log("Alarm dispatched:", response.data);
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
    <div className="flex flex-col w-full h-screen p-8">
      <h2 className="text-4xl mb-4 ml-6 font-semibold">New Alarm</h2>
      <div className="flex justify-center flex-1 mt-8 bg-gray-800">
        {/* Form for geocoding address */}
        <div className="flex-3 border p-4" style={{ flex: "0 0 30%" }}>
          <h3 className="text-lg font-semibold mb-2 text-center">
            Alarm Information
          </h3>
          <form onSubmit={handleSubmit} className="mb-4">
            <label className="block mb-2">Enter Address:</label>
            <input
              className="text-black border rounded p-1 w-full"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded py-1 px-4 mt-2"
            >
              Geocode
            </button>
          </form>
          <h3 className="text-lg font-semibold mb-2">Geocoded Address:</h3>
          {geocodedAddress ? (
            <p>{geocodedAddress.display_name}</p>
          ) : (
            <p>No geocoded address available</p>
          )}

          {/* Alarm Description */}
          <div className="mb-4">
            <label className="block mb-2">Alarm Description:</label>
            <textarea
              className="border rounded p-1 w-full text-black"
              value={alarmDescription}
              onChange={(e) => setAlarmDescription(e.target.value)}
              required
            />
          </div>

          {/* Dispatch Button */}
          {dispatchError && <p className="text-red-500">{dispatchError}</p>}
          <button
            className="bg-blue-500 text-white rounded py-2 px-4 mt-2 w-full"
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
          <h3 className="text-lg font-semibold mb-2 text-center">
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
                            {department.distance !== undefined && (
                              <p className="mr-2">
                                Distance: {department.distance.toFixed(2)}{" "}
                                kilometers
                              </p>
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
                            {department.duration !== undefined && (
                              <p>
                                Duration: {department.duration.toFixed(2)}{" "}
                                minutes
                              </p>
                            )}
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
    </div>
  );
};

export default NewAlarmContent;
