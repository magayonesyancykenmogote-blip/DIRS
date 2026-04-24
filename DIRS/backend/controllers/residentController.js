import { getResidentModel } from "../models/residentModel.js";
import { getCaseModel } from "../models/blotterModel.js";

export const getResidents = async (req, res) => {
  try {
    const Resident = await getResidentModel();
    const { search } = req.query;
    const page = parseInt(req.query.page || 1, 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    let query = { archival_state: 'ACTIVE' }; // Only active residents

    if (search) {
      // Search by name (first, middle, last)
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { middle_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { resident_code: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Resident.countDocuments(query);
    const residents = await Resident.find(query).skip(skip).limit(limit);
    const pages = Math.ceil(total / limit);

    res.json({ count: residents.length, total, page, pages, data: residents });
  } catch (error) {
    console.error("Database error:", error.message);
    // Return mock data for development when DB is not available
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log("⚠️  Returning mock resident data (database offline)");
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
      res.json({ count: mockResidents.length, total: mockResidents.length, page: 1, pages: 1, data: mockResidents });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
};

export const getResidentById = async (req, res) => {
  try {
    const Resident = await getResidentModel();
    const resident = await Resident.findById(req.params.id);
    if (!resident) return res.status(404).json({ error: "Resident not found" });
    res.json(resident);
  } catch (error) {
    console.error("Database error:", error.message);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log("⚠️  Returning mock resident data (database offline)");
      // Return mock data for the requested ID
      const mockResident = {
        _id: req.params.id,
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
      };
      res.json(mockResident);
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
};

export const checkBlotterRecord = async (req, res) => {
  try {
    const { first_name, middle_name, last_name, extension } = req.body;
    const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const nameParts = [first_name, middle_name, last_name, extension].filter(Boolean).map((part) => escapeRegex(part.trim()));
    const fullNameRegex = new RegExp(nameParts.join('.*'), 'i');
    const firstLastRegex = new RegExp(`${escapeRegex(first_name)}.*${escapeRegex(last_name)}`, 'i');

    const Case = await getCaseModel();
    const blotterRecord = await Case.findOne({
      resident: { $regex: fullNameRegex },
      $or: [
        { type: 'BLACKLISTED' },
        { status: 'BLACKLISTED' }
      ]
    }) || await Case.findOne({
      resident: { $regex: firstLastRegex },
      $or: [
        { type: 'BLACKLISTED' },
        { status: 'BLACKLISTED' }
      ]
    });

    if (blotterRecord) {
      return res.json({ hasBlotterRecord: true, message: "Resident has an active blotter record and is not eligible for document issuance." });
    }

    return res.json({ hasBlotterRecord: false });
  } catch (error) {
    console.error("Database error:", error.message);
    res.json({ hasBlotterRecord: false });
  }
};