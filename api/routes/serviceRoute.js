import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';

const router = express.Router();

// Get all services
router.get('/', getAllServices);

// Get a service by ID
router.get('/:id', getServiceById);

// Create a new service
router.post('/', createService);

// Update a service
router.put('/:id', updateService);

// Delete a service
router.delete('/:id', deleteService);

export default router;
