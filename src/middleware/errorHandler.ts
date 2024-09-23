export const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging

    // Send a generic error message to the client
    res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
};
