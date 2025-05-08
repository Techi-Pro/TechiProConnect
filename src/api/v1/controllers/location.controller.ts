import * as locationService from '../services/location.service';

export const upsertLocation = async (req, res) => {
    const { latitude, longitude, address, technicianId } = req.body;
    try {
        if (!latitude || !longitude || !address || !technicianId) {
            return res.status(400).json({ message: 'Latitude, longitude, address, and technicianId are required' });
        }
        await locationService.upsertLocation({ technicianId, latitude, longitude, address });
        res.status(200).json({ message: 'Location upserted successfully' });
    } catch (error) {
        console.error('Location upsert error:', error);
        res.status(500).json({ message: error.message });
    }
};
