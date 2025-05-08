import * as ratingService from '../services/rating.service';

export const createRating = async (req, res) => {
    try {
        const rating = await ratingService.createRating(req.body);
        res.status(201).json(rating);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getRatingsByTechnician = async (req, res) => {
    try {
        const ratings = await ratingService.getRatingsByTechnician(req.params.technicianId);
        res.status(200).json(ratings);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
