import "./style.css";
import { DoctorType } from "../../types/Types";
import { useState, useEffect } from "react";
import axiosInstance from "../../api/Axios";

type ConsultType = {
    id?: number;
    scheduled_date: string;
    doctor_id: string | number;
    patient_id?: string | number;
    patient_notes: string;
    doctor_result?: string;
    status?: string;
};

const initialFormState = (): ConsultType => ({
    scheduled_date: "",
    doctor_id: "",
    patient_notes: "",
});

const ClientConsult = () => {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [addForm, setAddForm] = useState<ConsultType>(initialFormState());

    // Fetch doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axiosInstance.get('/users/doctors');
                setDoctors(response.data);
            } catch (error) {
                setDoctors([]);
            }
        };
        fetchDoctors();
    }, []);





    const handleAddFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setAddForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalForm = {
            doctor_id: Number(addForm.doctor_id),
            scheduled_date: new Date(addForm.scheduled_date).toISOString(),
            patient_notes: addForm.patient_notes
        };

        try {
            await axiosInstance.post('/appointment', finalForm);
            setAddForm(initialFormState());
            alert('Add appointment success!');
        } catch (err: any) {
            alert('Add appointment failed!');
            console.error(err?.response?.data);
        }
    };

    return (
        <div className="consult-background">
            <div className="consult-container">
                <div className="consult-title">Appointment</div>
                <form className="consult-form" onSubmit={handleAddFormSubmit}>

                    <input
                        type="date"
                        name="scheduled_date"
                        value={addForm.scheduled_date}
                        onChange={handleAddFormChange}
                        required
                    />

                    <select
                        name="doctor_id"
                        value={addForm.doctor_id}
                        onChange={handleAddFormChange}
                        required
                    >
                        <option value="">Chọn bác sĩ</option>
                        {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.fullName}
                            </option>
                        ))}
                    </select>

                    <textarea
                        name="patient_notes"
                        placeholder="Ghi chú triệu chứng"
                        value={addForm.patient_notes}
                        onChange={handleAddFormChange}
                        required
                    />

                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
};

export default ClientConsult;