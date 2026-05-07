import { useEffect, useState } from "react";
import axiosInstance from "../../api/Axios";
import { SearchIcon } from "../../assets/SVG/Svg";
import './style.css';
import LoadingSkeleton from "../../components/LoadingSkeleton/LoadingSkeleton";

type DoctorType = { id: number, fullName: string };
type PatientType = { id: number, fullName: string };
type ConsultType = {
  id: number;
  scheduled_date: string;
  doctor: DoctorType;
  patient: PatientType;
  patient_notes: string;
  doctor_result: string;
  status: string;
};

type AppointmentType = {
  id: number;
  date: string;
  doctor_name: string;
  patient_name: string;
  patient_description: string;
  result: string;
  status: string;
};

const sortableFields = [
  { label: "Consult ID", value: "consult_id" },
  { label: "Date", value: "date" },
  { label: "Doctor", value: "doctor_name" },
  { label: "Patient", value: "patient_name" },
  { label: "Description", value: "patient_description" },
  { label: "Result", value: "result" },
];

export default function PatientAppointment() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("UNKNOWN");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortField, setSortField] = useState<keyof AppointmentType | ''>('');
  const [sortOrder, setSortOrder] = useState<'increase' | 'decrease'>('increase');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id);
      } catch {
        setUserId("UNKNOWN");
      }
    }
  }, []);

  useEffect(() => {
    // Fetch consults of this patient & resolve doctor/patient name
    async function fetchConsults() {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/appointment/my');
        const allConsults: ConsultType[] = response.data;

        const appointments: AppointmentType[] = allConsults.map((c) => ({
          id: c.id,
          date: c.scheduled_date ? new Date(c.scheduled_date).toLocaleDateString('en-CA') : '',
          doctor_name: c.doctor?.fullName || 'N/A',
          patient_name: c.patient?.fullName || 'N/A',
          patient_description: c.patient_notes,
          result: c.doctor_result || 'Pending',
          status: c.status
        }));

        setAppointments(appointments);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
        setAppointments([]);
      }
      setLoading(false);
    }
    fetchConsults();
  }, [userId]);

  // Filter, sort, paginate
  const filtered = appointments.filter(item =>
    (item.id.toString().includes(searchTerm.toLowerCase())) ||
    (item.date && item.date.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.doctor_name && item.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.patient_name && item.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.patient_description && item.patient_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.result && item.result.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'increase' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRows = sorted.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortField, sortOrder]);

  const renderSortIcon = (field: keyof AppointmentType | '') => {
    if (sortField !== field) return <span className='init_sort_icon_admin'>▲</span>;
    return sortOrder === "increase" ? <span className='active_sort_icon_admin'>▼</span> : <span className='active_sort_icon_admin'>▲</span>;
  };

  const handleHeaderClick = (field: keyof AppointmentType | '') => {
    if (sortField === field) setSortOrder(sortOrder === "increase" ? "decrease" : "increase");
    else { setSortField(field); setSortOrder("increase"); }
  };

  return (
    <div className="background_diagnose_history">
      <div className="header_diagnose_history">Appointment History</div>
      {/* Search */}
      <div className="search_container_diagnose_history">
        <SearchIcon className="search_icon_diagnose_history" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search_input_diagnose_history"
        />
      </div>
      {/* Table */}
      <div className="table_diagnose_history">
        <div className="header_table_diagnose_history">
          {sortableFields.map(field => (
            <div
              key={field.value}
              onClick={() => handleHeaderClick(field.value as keyof AppointmentType)}
            >
              {field.label}
              {renderSortIcon(field.value as keyof AppointmentType)}
            </div>
          ))}
        </div>
        <div>
          {loading ? (
            <LoadingSkeleton type="table" rows={5} />
          ) : currentRows.length === 0 ? (
            <div className="empty_diagnose_history">No Appointment found.</div>
          ) : (
            currentRows.map(d => (
              <div className="row_diagnose_history" key={d.id}>
                <div title={d.id.toString()}>{d.id}</div>
                <div title={d.date}>{d.date}</div>
                <div title={d.doctor_name}>{d.doctor_name}</div>
                <div title={d.patient_name}>{d.patient_name}</div>
                <div title={d.patient_description}>{d.patient_description || '-'}</div>
                <div>{d.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Pagination */}
      <div className="diagnose_pagination">
        <div>
          Show {currentRows.length} / {sorted.length} appointments
        </div>
        {totalPages > 1 && (
          <div className="doctor_pagination">
            <button onClick={() => setCurrentPage(c => Math.max(1, c - 1))} disabled={currentPage === 1} className="pagination_button">
              Before
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`pagination_button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} disabled={currentPage === totalPages} className="pagination_button">
              After
            </button>
            <div className="pagination_info">
              Page {currentPage} / {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}