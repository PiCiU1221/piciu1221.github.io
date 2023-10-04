import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

interface Alarm {
  alarmId: number;
  alarmCity: string;
  alarmStreet: string;
  alarmDescription: string;
  dateTime: string;
}

interface FireDepartment {
  departmentId: number;
  departmentName: string;
  departmentCity: string;
  departmentStreet: string;
}

interface AlarmWithFireDepartments {
  alarm: Alarm;
  fireDepartments: FireDepartment[];
}

const AlarmsContent: React.FC = () => {
  const [alarmsWithDepartments, setAlarmsWithDepartments] = useState<
    AlarmWithFireDepartments[]
  >([]);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [page, setPage] = useState<number>(0);
  const [nextPageCount, setNextPageCount] = useState<number>(0); // Store the number of alarms on the next page
  const [isLoading, setIsLoading] = useState<boolean>(true); // Track loading state

  const token = Cookies.get("token"); // Get the token from cookies

  useEffect(() => {
    // Fetch alarms with fire departments from your backend API
    const fetchAlarmsWithDepartments = async () => {
      try {
        const response = await axios.get<AlarmWithFireDepartments[]>(
          `/api/get-alarms-pages?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAlarmsWithDepartments(response.data);
        setIsLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error("Error fetching alarms with fire departments:", error);
      }
    };

    fetchAlarmsWithDepartments();

    // Fetch the number of alarms on the next page
    const fetchNextPageCount = async () => {
      try {
        const response = await axios.get<AlarmWithFireDepartments[]>(
          `/api/get-alarms-pages?page=${page + 1}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNextPageCount(response.data.length);
      } catch (error) {
        console.error("Error fetching next page count:", error);
      }
    };

    fetchNextPageCount();
  }, [page, token]);

  const handleAlarmClick = (alarm: Alarm) => {
    setSelectedAlarm(alarm === selectedAlarm ? null : alarm);
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

  return (
    <div className="flex flex-col h-screen w-full">
      <h2 className="text-3xl mb-4 ml-6">Alarms</h2>
      {isLoading ? ( // Show loading spinner when isLoading is true
        <div className="flex justify-center items-center h-screen">
          <div className="loader"></div> {/* Add a CSS class for a spinner */}
        </div>
      ) : (
        <div className="flex justify-center flex-1 mt-16">
          <div className="w-1/2">
            <ul>
              {alarmsWithDepartments.map((data) => (
                <div
                  key={data.alarm.alarmId}
                  className="mb-2 flex justify-center"
                >
                  <button
                    className={`w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-300 `}
                    onClick={() => handleAlarmClick(data.alarm)}
                    style={{
                      height: selectedAlarm === data.alarm ? "auto" : "4rem", // Adjust the height as needed
                    }}
                  >
                    {data.alarm.alarmDescription}
                    <span
                      className={`float-right ${
                        selectedAlarm === data.alarm
                          ? "transform rotate-180"
                          : ""
                      } transition-transform duration-300`}
                    >
                      ↓
                    </span>
                    {selectedAlarm === data.alarm && (
                      <div className="mt-6 flex">
                        <div className="w-1/2 pr-4">
                          <p>City: {data.alarm.alarmCity}</p>
                          <p>Street: {data.alarm.alarmStreet}</p>
                          <p>DateTime: {data.alarm.dateTime}</p>
                        </div>
                        <div className="w-1/2 pl-4">
                          <p>Responding Fire Departments:</p>
                          <ul>
                            {data.fireDepartments.map((department) => (
                              <li key={department.departmentId}>
                                <span className="bullet">&#8226;</span>{" "}
                                {department.departmentName}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
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
                Back
              </button>
              <span className="text-xl flex items-center">{page + 1}</span>{" "}
              {/* Page Number */}
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
        </div>
      )}
    </div>
  );
};

export default AlarmsContent;
