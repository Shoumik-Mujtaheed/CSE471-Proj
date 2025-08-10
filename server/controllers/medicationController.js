// controllers/medicationController.js
import Inventory from '../models/Inventory.js';

/* =================== MEDICATION SEARCH & AUTO-SUGGESTIONS ====================== */

// GET /api/medications/search
// Search medications with auto-suggestions
export const searchMedications = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Search query must be at least 2 characters long' 
      });
    }

    // Build search filter
    const filter = {
      name: { $regex: query, $options: 'i' }
    };

    const medications = await Inventory.find(filter)
      .select('name price quantity')
      .limit(parseInt(limit))
      .sort({ name: 1 });

    res.json({
      success: true,
      count: medications.length,
      medications
    });

  } catch (error) {
    console.error('Medication search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during medication search' 
    });
  }
};

// GET /api/medications
// Get all medications with pagination
export const getAllMedications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const medications = await Inventory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Inventory.countDocuments(filter);

    res.json({
      success: true,
      medications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching medications' 
    });
  }
};

// GET /api/medications/:id
// Get specific medication details
export const getMedicationById = async (req, res) => {
  try {
    const medication = await Inventory.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ 
        success: false,
        message: 'Medication not found' 
      });
    }

    res.json({
      success: true,
      medication
    });

  } catch (error) {
    console.error('Get medication by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching medication' 
    });
  }
};