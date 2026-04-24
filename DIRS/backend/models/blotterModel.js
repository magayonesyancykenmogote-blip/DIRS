import mongoose from "mongoose";

// Create a separate connection for blotter database
let blotterConnection;

const createBlotterConnection = async () => {
  if (!blotterConnection) {
    try {
      const uri = "mongodb+srv://blotter_service_user:Pm9nxDFMy6pNP8o6@barangaycluster.seb5lfn.mongodb.net/blotter_db?authSource=admin";
      blotterConnection = mongoose.createConnection(uri, {
        dbName: 'blotter_db',
      });
      console.log("✅ Connected to blotter_db");
    } catch (error) {
      console.error("❌ Failed to connect to blotter_db:", error.message);
      // Create a mock connection for development
      blotterConnection = {
        model: () => ({
          find: async () => [],
          findOne: async () => null
        })
      };
    }
  }
  return blotterConnection;
};

const caseSchema = new mongoose.Schema({
  resident: { type: String, required: true },
  complainantName: { type: String },
  type: { type: String },
  status: { type: String },
  caseNo: { type: String },
  contact: { type: String },
  date: { type: String },
  fullData: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// Create the model with lazy connection
let Case;

const getCaseModel = async () => {
  if (!Case) {
    const connection = await createBlotterConnection();
    Case = connection.model("Case", caseSchema, 'cases');
  }
  return Case;
};

export { getCaseModel };