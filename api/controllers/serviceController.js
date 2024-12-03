import Service from "../models/serviceModel.js";

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services", error: err.message });
  }
};

// Get a service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create a new service
export const createService = async (req, res) => {
  try {
    const { name, imageSrc, imageAlt, description, price, rating } = req.body;

    const newService = new Service({
      name,
      imageSrc,
      imageAlt,
      description,
      price,
      rating
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (err) {
    res.status(500).json({ message: "Error creating service", error: err.message });
  }
};

// Update a service by ID
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedService) return res.status(404).json({ message: "Service not found" });
    res.status(200).json(updatedService);
  } catch (err) {
    res.status(500).json({ message: "Error updating service", error: err.message });
  }
};

// Delete a service by ID
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) return res.status(404).json({ message: "Service not found" });
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting service", error: err.message });
  }
};
export const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const services = await Service.find({ category });
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching services', error: err.message });
  }
};

