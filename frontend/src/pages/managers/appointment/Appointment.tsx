import '../doctors/Doctor.css';
import { useState, useEffect } from 'react';
import axiosInstance from '../../../api/Axios';
import { DoctorType, PatientType, ConsultType, AppointmentType } from '../../../types/Types';
import { DeleteIcon, FixIcon, LockUpIcon } from '../../../assets/SVG/Svg';

type SortField = keyof AppointmentType | '';
type SortOrder = 'increase' | 'decrease';

const sortableFields: { label: string, value: SortField }[] = [
  { label: "Consult ID", value: "consult_id" },
  { label: "Date", value: "date" },
  { label: "Doctor", value: "doctor_name" },
  { label: "Patient", value: "patient_name" },
  { label: "Description", value: "patient_description" },
  { label: "Result", value: "result" }
];

// Generate a unique consult_id for a new appointment
function getNextConsultId(appointments: AppointmentType[]): string {
  const prefix = "CST";
  const usedNumbers = appointments
    .map(app => app.consult_id)
    .filter(id => id && id.startsWith(prefix))
    .map(id => parseInt(id.replace(prefix, ""), 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  let nextNum = 1;
  for (let num of usedNumbers) {
    if (num === nextNum) nextNum++;
    else break;
  }
  return prefix + nextNum.toString().padStart(3, "0");
}

export default function Appointment() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(false);

  // Sort state
  const [sortField, setSortField] = useState<SortField>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('increase');

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    consult_id: '',
    date: '',
    doctor_id: '',
    patient_id: '',
    patient_description: '',
    result: '',
  });
  const [editForm, setEditForm] = useState({
    consult_db_id: '',
    consult_id: '',
    date: '',
    doctor_id: '',
    patient_id: '',
    patient_description: '',
    result: '',
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [doctors, setDoctors] = useState<DoctorType[]>([]);
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch doctors and patients for select options
  useEffect(() => {
    async function fetchDoctorsAndPatients() {
      try {
        const docRes = await axiosInstance.get('/users/doctors');
        setDoctors(docRes.data);
        // Assuming there might be a /users/patients endpoint soon, for now list all doctors
      } catch (err) {
        setDoctors([]);
      }
    }
    fetchDoctorsAndPatients();
  }, []);

  // Fetch all appointments
  const fetchAllAppointments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/appointment');
      const allAppointments = response.data.map((app: any) => ({
        consult_id: app.id,
        consult_db_id: app.id,
        date: app.scheduled_date ? new Date(app.scheduled_date).toLocaleDateString('en-CA') : '',
        doctor_id: app.doctor?.id || '',
        doctor_name: app.doctor?.fullName || 'N/A',
        patient_id: app.patient?.id || '',
        patient_name: app.patient?.fullName || 'N/A',
        patient_description: app.patient_notes,
        result: app.doctor_result || 'Pending',
      }));
      setAppointments(allAppointments);
    } catch (err) {
      console.error("Failed to fetch all appointments", err);
      setAppointments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllAppointments();
    // eslint-disable-next-line
  }, []);

  // Search filter
  const filteredAppointments = appointments.filter(item =>
    (item.consult_id && item.consult_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.date && item.date.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.doctor_name && item.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.patient_name && item.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.patient_description && item.patient_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.result && item.result.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort Logic
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    // String
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      if (sortOrder === 'increase') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAppointments = sortedAppointments.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortField, sortOrder]);

  // Sort control render
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className='init_sort_icon_admin'>▲</span>;
    }
    if (sortOrder === "increase") {
      return <span className='active_sort_icon_admin'>▼</span>;
    }
    return <span className='active_sort_icon_admin'>▲</span>;
  };

  const handleHeaderClick = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === "increase" ? "decrease" : "increase");
    } else {
      setSortField(field);
      setSortOrder("increase");
    }
  };

  // Add
  const handleAddAppointment = () => {
    const newId = getNextConsultId(appointments);
    setAddForm({
      consult_id: newId,
      date: '',
      doctor_id: '',
      patient_id: '',
      patient_description: '',
      result: '',
    });
    setShowAddForm(true);
  };

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await axiosInstance.post('/appointment', {
        scheduled_date: new Date(addForm.date).toISOString(),
        doctor_id: Number(addForm.doctor_id),
        patient_id: Number(addForm.patient_id),
        patient_notes: addForm.patient_description,
      });
      setShowAddForm(false);
      await fetchAllAppointments();
    } catch {
      alert('Add appointment failure!');
    }
    setAddLoading(false);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setAddForm({
      consult_id: '',
      date: '',
      doctor_id: '',
      patient_id: '',
      patient_description: '',
      result: '',
    });
  };

  // Edit
  const handleEditAppointment = (item: AppointmentType) => {
    setEditForm({
      consult_db_id: item.consult_db_id,
      consult_id: item.consult_id,
      date: item.date,
      doctor_id: item.doctor_id,
      patient_id: item.patient_id,
      patient_description: item.patient_description,
      result: item.result,
    });
    setShowEditForm(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axiosInstance.patch(`/appointment/${editForm.consult_db_id}/result`, {
        doctor_result: editForm.result,
      });
      setShowEditForm(false);
      await fetchAllAppointments();
    } catch {
      alert('Adjust failure!');
    }
    setEditLoading(false);
  };

  const handleCancelEdit = () => setShowEditForm(false);

  // Delete
  const handleDeleteAppointment = async (item: AppointmentType) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/appointment/${item.consult_db_id}`);
      await fetchAllAppointments();
    } catch {
      alert('Delete failure!');
    }
    setLoading(false);
  };

  // Pagination
  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
  const handlePrevious = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="doctor_container">
      {/* Header */}
      <div className="doctor_header">
        <div className="doctor_title">List of appointments</div>
        <div className="doctor_controls">
          <div className="doctor_search_container">
            <LockUpIcon className="doctor_search_icon" />
            <input
              type="text"
              placeholder="Find an appointment..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="doctor_search_input"
            />
          </div>
          {/* <button
            onClick={handleAddAppointment}
            className="doctor_add_button"
          >
            Add new appointment
          </button> */}
        </div>
      </div>

      {/* Add Appointment Form */}
      {showAddForm && (
        <div className="doctor_add_form_overlay">
          <form className="doctor_add_form" onSubmit={handleAddFormSubmit}>
            <h3>Add a new appointment</h3>
            <input name="consult_id" placeholder="Consult ID" value={addForm.consult_id} readOnly required />
            <input name="date" type="date" placeholder="Date" value={addForm.date} onChange={handleAddFormChange} required />
            <select name="doctor_id" value={addForm.doctor_id} onChange={handleAddFormChange} required>
              <option value="">Choose a doctor</option>
              {doctors.map(d => <option value={d.id} key={d.id}>{d.fullName}</option>)}
            </select>
            <select name="patient_id" value={addForm.patient_id} onChange={handleAddFormChange} required>
              <option value="">Choose a patient</option>
              {patients.map(p => <option value={p.id} key={p.id}>{p.fullName}</option>)}
            </select>
            <input name="patient_description" placeholder="Patient description" value={addForm.patient_description} onChange={handleAddFormChange} required />
            <input name="result" placeholder="Result" value={addForm.result} onChange={handleAddFormChange} required />
            <div className="doctor_add_form_buttons">
              <button type="submit" className="doctor_add_button" disabled={addLoading}>
                {addLoading ? "Saving..." : "Saved"}
              </button>
              <button type="button" className="doctor_cancel_button" onClick={handleCancelAdd} disabled={addLoading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Appointment Form */}
      {showEditForm && (
        <div className="doctor_add_form_overlay">
          <form className="doctor_add_form" onSubmit={handleEditFormSubmit}>
            <h3>Adjust the appointment</h3>
            <input name="consult_id" placeholder="Consult ID" value={editForm.consult_id} onChange={handleEditFormChange} required />
            <input name="date" type="date" placeholder="Date" value={editForm.date} onChange={handleEditFormChange} required />
            <select name="doctor_id" value={editForm.doctor_id} onChange={handleEditFormChange} required>
              <option value="">Choose a doctor</option>
              {doctors.map(d => <option value={d.id} key={d.id}>{d.fullName}</option>)}
            </select>
            <select name="patient_id" value={editForm.patient_id} onChange={handleEditFormChange} required>
              <option value="">Choose patient</option>
              {patients.map(p => <option value={p.id} key={p.id}>{p.fullName}</option>)}
            </select>
            <input name="patient_description" placeholder="Patient Description" value={editForm.patient_description} onChange={handleEditFormChange} required />
            <input name="result" placeholder="Result" value={editForm.result} onChange={handleEditFormChange} required />
            <div className="doctor_add_form_buttons">
              <button type="submit" className="doctor_add_button" disabled={editLoading}>
                {editLoading ? "Saving..." : "Saved"}
              </button>
              <button type="button" className="doctor_cancel_button" onClick={handleCancelEdit} disabled={editLoading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="doctor_table">
        {/* Table Header */}
        <div className="doctor_table_header">
          <div className="doctor_table_header_grid">
            {sortableFields.map(field => (
              <div
                key={field.value}
                className='header_table_admin'
                onClick={() => handleHeaderClick(field.value)}
              >
                {field.label}
                {renderSortIcon(field.value)}
              </div>
            ))}
            <div>Operation</div>
          </div>
        </div>
        {/* Table Body */}
        <div className="doctor_table_body">
          {loading ? (
            <div className="doctor_no_results">Loading...</div>
          ) : currentAppointments.length ? (
            currentAppointments.map(item => (
              <div key={item.consult_id} className="doctor_table_row">
                <div className="doctor_table_row_grid">
                  <div className="doctor_cell_id">{item.consult_id}</div>
                  <div className="doctor_cell_text">{item.date}</div>
                  <div className="doctor_cell_name">{item.doctor_name}</div>
                  <div className="doctor_cell_name">{item.patient_name}</div>
                  <div className="doctor_cell_text">{item.patient_description}</div>
                  <div className="doctor_cell_text">{item.result}</div>
                  <div className="doctor_actions">
                    <button
                      onClick={() => handleEditAppointment(item)}
                      className="action_button edit_button"
                      title="Edit Appointment"
                    >
                      <FixIcon className='action_icon' />
                      Fix
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(item)}
                      className="action_button delete_button"
                      title="Delete appointment"
                    >
                      <DeleteIcon className='action_icon' />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="doctor_no_results">
              No suitable appointment found
            </div>
          )}
        </div>
      </div>

      {/* Summary and Pagination */}
      <div className="doctor_summary">
        <div>
          Show {currentAppointments.length} / {sortedAppointments.length} appointments
        </div>
        {totalPages > 1 && (
          <div className="doctor_pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="pagination_button"
            >
              Before
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination_button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="pagination_button"
            >
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