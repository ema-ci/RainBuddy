import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

function Admin() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
    };

    // Fetch reports on render
    useEffect(() => { fetchReports(); }, []);

    if (loading) return <div style={{ padding: 24 }}><p>Loading...</p></div>;

    return (
        <div style={{ padding: 24 }}>
            <h2>Admin - User Reports</h2>
            {reports.length === 0 ? (
                <p>No reports found.</p>
            ) : (
                <ul>
                    {reports.map(r => (
                        <li key={r.id} style={{ marginBottom: 16, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
                            <strong>User:</strong> {r.id}<br />
                            <strong>Report:</strong> {r.report}<br />
                            <strong>Date:</strong> {r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Admin;