import * as adminService from '../services/admin.service';

export const getPendingTechnicians = async (req, res) => {
  try {
    const technicians = await adminService.getPendingTechnicians();
    res.status(200).json(technicians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveTechnician = async (req, res) => {
  try {
    const technician = await adminService.approveTechnician(req.params.id);
    res.status(200).json({ message: 'Technician document approved', technician });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectTechnician = async (req, res) => {
  try {
    const technician = await adminService.rejectTechnician(req.params.id);
    res.status(200).json({ message: 'Technician document rejected', technician });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 