import * as serviceService from '../services/service.service';

export const getServices = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const [services, total] = await Promise.all([
            serviceService.getServices({ skip, take: limit }),
            serviceService.countServices(),
        ]);
        res.status(200).json({ items: services, total, page, pageSize: limit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createService = async (req, res) => {
    try {
        const service = await serviceService.createService(req.body);
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getService = async (req, res) => {
    try {
        const service = await serviceService.getService(req.params.id);
        res.status(200).json(service);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        const updatedService = await serviceService.updateService(req.params.id, req.body);
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        await serviceService.deleteService(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
