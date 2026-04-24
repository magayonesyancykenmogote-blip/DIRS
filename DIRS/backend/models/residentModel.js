import mongoose from "mongoose";

// Create a separate connection for profiling database
let profilingConnection;

const createProfilingConnection = async () => {
  if (!profilingConnection) {
    try {
      profilingConnection = mongoose.createConnection(process.env.PROFILING_MONGO_URI || process.env.MONGO_URI, {
        dbName: 'profiling_db',
      });
      console.log("✅ Connected to profiling_db");
    } catch (error) {
      console.error("❌ Failed to connect to profiling_db:", error.message);
      // Create a mock connection for development with sample residents
      const mockResidents = [
        {
          _id: '507f1f77bcf86cd799439011',
          resident_code: 'RES-2026-00001',
          first_name: 'Juan',
          middle_name: 'Dela',
          last_name: 'Cruz',
          extension: '',
          birthdate: '1990-01-15T00:00:00.000Z',
          address_text: '123 Main St, Barangay Center',
          status: 'ACTIVE',
          archival_state: 'ACTIVE',
          tags: []
        },
        {
          _id: '507f1f77bcf86cd799439012',
          resident_code: 'RES-2026-00002',
          first_name: 'Maria',
          middle_name: 'Santos',
          last_name: 'Reyes',
          extension: '',
          birthdate: '1985-03-20T00:00:00.000Z',
          address_text: '456 Oak Ave, Barangay North',
          status: 'ACTIVE',
          archival_state: 'ACTIVE',
          tags: []
        }
      ];

      profilingConnection = {
        model: () => ({
          find: async () => mockResidents,
          findById: async (id) => mockResidents.find((resident) => resident._id === id) || mockResidents[0] || null
        })
      };
    }
  }
  return profilingConnection;
};

const residentSchema = new mongoose.Schema({
  resident_code: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_name: { type: String },
  last_name: { type: String, required: true },
  extension: { type: String },
  gender: { type: String },
  birthdate: { type: Date },
  civil_status: { type: String },
  contact_number: { type: String },
  email: { type: String },
  occupation_sector: { type: String },
  occupation_type: { type: String },
  voter_status: { type: String },
  household_id: { type: mongoose.Schema.Types.ObjectId },
  purok_id: { type: mongoose.Schema.Types.ObjectId },
  address_text: { type: String },
  is_senior: { type: Boolean, default: false },
  is_pwd: { type: Boolean, default: false },
  is_indigent: { type: Boolean, default: false },
  is_solo_parent: { type: Boolean, default: false },
  is_ofw: { type: Boolean, default: false },
  is_kasambahay: { type: Boolean, default: false },
  tags: [{ type: String }],
  status: { type: String, default: 'ACTIVE' },
  archival_state: { type: String, default: 'ACTIVE' },
  death_cause: { type: String },
  death_date: { type: Date },
  archive_reason: { type: String },
  archived_at: { type: Date },
  photo_file_id: { type: mongoose.Schema.Types.ObjectId },
  _mock: { type: Boolean, default: false },
}, { timestamps: true });

// Create the model with lazy connection
let Resident;

const getResidentModel = async () => {
  if (!Resident) {
    const connection = await createProfilingConnection();
    Resident = connection.model("Resident", residentSchema, 'residents');
  }
  return Resident;
};

export { getResidentModel };