import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AddFireDepartment from "./AddFireDepartment";

interface FireDepartment {
  departmentId: number;
  departmentName: string;
  departmentCity: string;
  departmentStreet: string;
}

const FireDepartmentsContent: React.FC = () => {
  const [fireDepartments, setFireDepartments] = useState<FireDepartment[]>([]);
  const [page, setPage] = useState<number>(0);
  const [selectedDepartment, setSelectedDepartment] =
    useState<FireDepartment | null>(null);
  const [nextPageCount, setNextPageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const token = Cookies.get("token");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleAddNewDepartment = () => {
    setShowAddForm(true);
  };

  const handleBackToFireDepartments = () => {
    setShowAddForm(false);
  };

  const fetchFireDepartments = async () => {
    try {
      const response = await axios.get<FireDepartment[]>(
        `${apiBaseUrl}/api/fire-departments?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFireDepartments(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching fire departments:", error);
    }
  };

  const fetchNextPageCount = async () => {
    try {
      const response = await axios.get<FireDepartment[]>(
        `${apiBaseUrl}/api/fire-departments?page=${page + 1}`,
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

  useEffect(() => {
    fetchFireDepartments();
    fetchNextPageCount();
  }, [page, token]);

  const handleDepartmentClick = (department: FireDepartment) => {
    setSelectedDepartment(
      department === selectedDepartment ? null : department
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

  const refreshFireDepartments = async () => {
    try {
      await fetchFireDepartments();
      await fetchNextPageCount();
    } catch (error) {
      console.error("Error refreshing firefighters:", error);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen px-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold ml-6">Fire Departments</h2>
        <div className="flex items-center">
          <button
            className="bg-green-500 text-white rounded-lg py-2 px-4 w-64 mr-4 h-9 flex items-center justify-center"
            onClick={
              showAddForm ? handleBackToFireDepartments : handleAddNewDepartment
            }
          >
            {showAddForm ? "Back" : "+ Add New Fire Department"}
          </button>
        </div>
      </div>
      {showAddForm ? (
        <AddFireDepartment refreshFireDepartments={refreshFireDepartments} />
      ) : isLoading ? (
        <div className="flex justify-center items-center flex-grow">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="flex justify-center mt-8">
          <div className="w-1/2">
            <ul>
              {fireDepartments.map((department) => (
                <li key={department.departmentId} className="mb-2">
                  <div className="flex justify-center">
                    <button
                      className={`w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-300 `}
                      onClick={() => handleDepartmentClick(department)}
                      style={{
                        height:
                          selectedDepartment === department ? "auto" : "4rem",
                      }}
                    >
                      {department.departmentName}
                      <span
                        className={`float-right ${
                          selectedDepartment === department
                            ? "transform rotate-180"
                            : ""
                        } transition-transform duration-300`}
                      >
                        ↓
                      </span>
                      {selectedDepartment === department && (
                        <div className="mt-6">
                          <p>City: {department.departmentCity}</p>
                          <p>Street: {department.departmentStreet}</p>
                        </div>
                      )}
                    </button>
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
                Back
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
        </div>
      )}
    </div>
  );
};

export default FireDepartmentsContent;
