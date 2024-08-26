import React, { Suspense, useState } from "react";
import { useLoaderData, Await, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/NavBar.jsx";
import DoctorCard from "./DoctorCard";
import BACKEND_URL from "../services/api";
import Copyright from "../Copyright/Copyright.jsx";

function RequestConsultation() {
    const { role: rolePromise } = useLoaderData();
    const navigate = useNavigate();
    const [availableDoctors, setAvailableDoctors] = useState([]);

    const requestDoctorLogin = async (id) => {
        try {
            let token = localStorage.getItem("token");
            console.log("Requesting doctor login for ID:", id);
            const response = await axios.post(`${BACKEND_URL}/api/consultation/request/${id}`, { token });

            if (response.data.message === "All Mails Sent") {
                setAvailableDoctors(prev => prev.filter(doctor => doctor.uuid !== id));
                // Show success message to the user
                alert("Consultation request sent successfully!");
            } else {
                console.error("Unexpected response:", response.data);
                alert("There was an issue sending the consultation request. Please try again.");
            }
        } catch (err) {
            console.error("Error in requestDoctorLogin:", err.response?.data || err.message);
            alert("An error occurred while sending the consultation request. Please try again later.");
        }
    };

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>}>
            <Await resolve={rolePromise}>
                {(resolvedData) => {
                    console.log("Resolved data:", resolvedData);
                    const { role, doctorList } = resolvedData;

                    if (role === "doctor") {
                        navigate("/consultation/doctor");
                        return null;
                    }

                    if (role === "noRole") {
                        navigate("/");
                        return null;
                    }

                    if (availableDoctors.length === 0 && doctorList) {
                        setAvailableDoctors(doctorList);
                    }

                    return (
                        <div className="flex flex-col min-h-screen">
                            <Navbar isPatient={true} isLogout={true} />
                            <div className="flex-grow container mx-auto px-4 py-8">
                                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                                    Request Consultation
                                </h1>
                                {availableDoctors.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {availableDoctors.map((doctor, index) => (
                                            <DoctorCard
                                                key={doctor.uuid}
                                                name={doctor.name || `Doctor ${doctor.email}`}
                                                picture={doctor.picture}
                                                uuid={doctor.uuid}
                                                logicMagic={() => requestDoctorLogin(doctor.uuid)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-xl text-gray-600">
                                        No doctors available for consultation.
                                    </div>
                                )}
                            </div>
                            <Copyright />
                        </div>
                    );
                }}
            </Await>
        </Suspense>
    );
}

export default RequestConsultation;
