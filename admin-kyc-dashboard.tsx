/*
===============================================================================
FIREBASE KYC ADMIN DASHBOARD COMPONENTS
===============================================================================
This file contains React components for the Firebase KYC admin dashboard.
These components are provided as reference for implementing in your web app.

USAGE:
- Copy these components to your web application
- Adapt the styling to match your design system
- Update API endpoints to match your deployment URLs
- Add proper TypeScript types if using TypeScript

API ENDPOINTS USED:
- GET /api/v1/admin/technicians/pending-review (paginated list)
- POST /api/v1/admin/technicians/:id/final-verification (approve/reject)
- GET /api/v1/admin/kyc-statistics (dashboard stats)

FEATURES:
- Real-time KYC statistics dashboard
- Firebase confidence score display
- Document preview with thumbnails
- Admin approval/rejection workflow
- Audit trail and notes
===============================================================================
*/

// Enhanced admin dashboard component for KYC review
// export const AdminKYCDashboard = () => {
//   const [pendingReviews, setPendingReviews] = useState([]);
//   const [kycStats, setKycStats] = useState({});
//   const [selectedTechnician, setSelectedTechnician] = useState(null);

//   useEffect(() => {
//     fetchPendingReviews();
//     fetchKycStatistics();
//   }, []);

//   const fetchPendingReviews = async () => {
//     const response = await fetch('/api/v1/admin/technicians/pending-review');
//     const data = await response.json();
//     setPendingReviews(data.items);
//   };

//   const fetchKycStatistics = async () => {
//     const response = await fetch('/api/v1/admin/kyc-statistics');
//     const data = await response.json();
//     setKycStats(data);
//   };

//   const handleFinalDecision = async (technicianId, decision, notes) => {
//     await fetch(`/api/v1/admin/technicians/${technicianId}/final-verification`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ decision, adminNotes: notes })
//     });
    
//     // Refresh the list
//     fetchPendingReviews();
//     fetchKycStatistics();
//   };

//   return (
//     <div className="admin-kyc-dashboard">
//       {/* KYC Statistics */}
//       <div className="stats-grid">
//         <StatCard title="Pending Firebase KYC" value={kycStats.pending} />
//         <StatCard title="Firebase Verified" value={kycStats.firebaseVerified} />
//         <StatCard title="Awaiting Admin Review" value={kycStats.awaitingAdminReview} />
//         <StatCard title="Admin Approved" value={kycStats.adminApproved} />
//       </div>

//       {/* Pending Reviews List */}
//       <div className="pending-reviews">
//         <h3>Technicians Awaiting Final Review</h3>
//         {pendingReviews.map(technician => (
//           <TechnicianReviewCard 
//             key={technician.id}
//             technician={technician}
//             onReview={(decision, notes) => 
//               handleFinalDecision(technician.id, decision, notes)
//             }
//             onViewDetails={() => setSelectedTechnician(technician)}
//           />
//         ))}
//       </div>

//       {/* Detailed Review Modal */}
//       {selectedTechnician && (
//         <TechnicianDetailModal 
//           technician={selectedTechnician}
//           onClose={() => setSelectedTechnician(null)}
//           onDecision={handleFinalDecision}
//         />
//       )}
//     </div>
//   );
// };

// const TechnicianReviewCard = ({ technician, onReview, onViewDetails }) => {
//   const { firebaseKycData } = technician;
//   const confidenceScore = firebaseKycData?.confidenceScore || 0;
  
//   return (
//     <div className="review-card">
//       <div className="technician-info">
//         <h4>{technician.username}</h4>
//         <p>{technician.email}</p>
//         <p>Category: {technician.category.name}</p>
//       </div>
      
//       <div className="firebase-results">
//         <span className={`status ${technician.firebaseKycStatus.toLowerCase()}`}>
//           {technician.firebaseKycStatus}
//         </span>
//         <div className="confidence-score">
//           Confidence: {(confidenceScore * 100).toFixed(1)}%
//         </div>
//       </div>
      
//       <div className="document-preview">
//         {firebaseKycData?.documentUrls?.map((url, index) => (
//           <img key={index} src={url} alt={`Document ${index + 1}`} className="doc-thumbnail" />
//         ))}
//       </div>
      
//       <div className="actions">
//         <button onClick={onViewDetails} className="btn-secondary">
//           View Details
//         </button>
//         <button onClick={() => onReview('approve', '')} className="btn-success">
//           Approve
//         </button>
//         <button onClick={() => onReview('reject', '')} className="btn-danger">
//           Reject
//         </button>
//       </div>
//     </div>
//   );
// };
