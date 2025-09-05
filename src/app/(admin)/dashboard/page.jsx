'use client';
import { useEffect, useState } from 'react';
import { pb } from '@/app/lib/pocketbase';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserMd,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faFilter,
  faArrowLeft,
  faEye,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboardPage() {
  const [therapistRequests, setTherapistRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTherapists: 0,
    pendingTherapists: 0,
    acceptedTherapists: 0,
    rejectedTherapists: 0
  });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user statistics
      const users = await pb.collection('users').getFullList();
      const userProfiles = await pb.collection('user_profile').getFullList();
      
      // Fetch therapist statistics with different statuses
      const allTherapists = await pb.collection('therapist_profile').getFullList();
      const pendingTherapists = allTherapists.filter(t => t.status === 'pending');
      const acceptedTherapists = allTherapists.filter(t => t.status === 'accepted');
      const rejectedTherapists = allTherapists.filter(t => t.status === 'rejected');
      
      // Set statistics
      setStats({
        totalUsers: userProfiles.length,
        totalTherapists: allTherapists.length,
        pendingTherapists: pendingTherapists.length,
        acceptedTherapists: acceptedTherapists.length,
        rejectedTherapists: rejectedTherapists.length
      });
      
      // Apply filters to therapist requests
      let filterQuery = '';
      if (statusFilter !== 'all') {
        filterQuery = `status = "${statusFilter}"`;
      }
      
      // Add date filter if needed
      if (dateFilter !== 'all') {
        const today = new Date();
        let startDate = new Date();
        
        if (dateFilter === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'week') {
          startDate.setDate(today.getDate() - 7);
        } else if (dateFilter === 'month') {
          startDate.setMonth(today.getMonth() - 1);
        }
        
        if (dateFilter !== 'all') {
          const dateFilterStr = `created >= "${startDate.toISOString()}"`;
          filterQuery = filterQuery ? `${filterQuery} && ${dateFilterStr}` : dateFilterStr;
        }
      }
      
      // Fetch filtered therapist requests
      const res = await pb.collection('therapist_profile').getFullList({
        filter: filterQuery,
        sort: '-created',
        expand: 'therapistId'
      });
      
      setTherapistRequests(res);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  // Approve Therapist Request
  const handleApprove = async (id) => {
    try {
      await pb.collection('therapist_profile').update(id, { status: 'accepted' });
      alert("Therapist profile approved successfully.");
      fetchDashboardData();
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request: " + error.message);
    }
  };

  // Reject Therapist Request
  const handleReject = async (id) => {
    try {
      await pb.collection('therapist_profile').update(id, { status: 'rejected' });
      alert("Therapist profile rejected.");
      fetchDashboardData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request: " + error.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, dateFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors mb-4">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-purple-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and therapist applications</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Users Card */}
          <div className="bg-white rounded-lg shadow-md p-3  border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          {/* Total Therapists Card */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faUserMd} className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Therapists</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTherapists}</p>
              </div>
            </div>
          </div>

          {/* Pending Therapists Card */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Pending Therapists</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTherapists}</p>
              </div>
            </div>
          </div>

          {/* Accepted Therapists Card */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Accepted Therapists</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedTherapists}</p>
              </div>
            </div>
          </div>

          {/* Rejected Therapists Card */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Rejected Therapists</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.rejectedTherapists}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-purple-800 flex items-center">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filter Therapist Applications
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-800 font-medium">Loading dashboard data...</p>
          </div>
        )}

        {/* Requests List */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-purple-800">Therapist Applications</h2>
            </div>
            
            {therapistRequests.length === 0 ? (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faChartBar} className="text-gray-400 text-4xl mb-3" />
                <p className="text-gray-500">No therapist applications found with the current filters.</p>
              </div>
            ) : (
              <div className="divide-y">
                {therapistRequests.map((request) => (
                  <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-3 md:mb-0">
                        <h3 className="font-semibold text-lg text-purple-900">
                          {request.username || 'Therapist'}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Applied: {new Date(request.created).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Email: {request.expand?.therapistId?.email || 'N/A'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>

                        <div className="flex gap-2">
                          <Link
                            href={`/admin_view_therapist/${request.id}`}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition-colors flex items-center"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            View
                          </Link>

                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm hover:bg-green-200 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}