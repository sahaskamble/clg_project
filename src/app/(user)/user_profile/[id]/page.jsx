'use client';
import { pb } from '../../../lib/pocketbase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUser, faLock,faCreditCard, faArrowLeft, faUserPlus, faSave, faEdit, faGraduationCap, faBriefcase, faTags, faPlus, faTimes, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

export default function UserViewPage() {
    const router = useRouter();

    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [profession, setProfession] = useState('');
    const [profileExists, setProfileExists] = useState(false);
    const [profileId, setProfileId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [concerns, setConcerns] = useState(['']);
    const [bookings, setBookings] = useState([]);
    const [dateFilter, setDateFilter] = useState('all');
    const [customDate, setCustomDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');


    useEffect(() => {
        // Only check authentication, no need to set userId
        if (!pb.authStore.isValid || !pb.authStore.model?.id) {
            alert("please log in first");
            router.push('/user_login');
        }
    }, [router]);

    const fetchData = async () => {
        try {
            const authData = pb.authStore.model;
            const userId = authData?.id;

            if (!userId) {
                console.warn("No userId found in authStore.");
                return;
            }

            // Fetch the user profile by userId filter
            const res = await pb.collection('user_profile').getFirstListItem(`userId="${userId}"`);

            if (res) {
                setProfileExists(true);
                setProfileId(res.id);

                setGender(res.gender || '');
                setAge(res.age || '');
                setProfession(res.profession || '');

                // Handle concerns field
                if (Array.isArray(res.concerns)) {
                    setConcerns(res.concerns);
                } else if (res.concerns) {
                    try {
                        const parsed = typeof res.concerns === 'string'
                            ? JSON.parse(res.concerns)
                            : res.concerns;
                        setConcerns(Array.isArray(parsed) ? parsed : [parsed]);
                    } catch (err) {
                        setConcerns([res.concerns.toString()]);
                    }
                } else {
                    setConcerns(['']);
                }

                setIsEditing(false);
            } else {
                setProfileExists(false);
                setIsEditing(true);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setProfileExists(false);
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        try {
            const filteredConcerns = concerns.filter(concern => concern.trim() !== '');
            console.log("filteredConcerns", filteredConcerns);
            if (!profileExists) {
                console.log({
                    gender,
                    age,
                    profession,
                    concerns: filteredConcerns,

                });
            }
            if (profileExists) {

                // Update existing profile
                await pb.collection('user_profile').update(profileId, {
                    gender: gender,
                    age: Number(age),
                    profession: profession,
                    concerns: filteredConcerns,
                });
                alert("Profile updated successfully");
                setIsEditing(false);
            } else {
                // Create new profile
                const record = await pb.collection('user_profile').create({
                    gender: gender,
                    age: age,
                    profession: profession,
                    concerns: filteredConcerns,
                    userId: pb.authStore.model.id
                });

                setProfileId(record.id);
                setProfileExists(true);
                alert("Profile created successfully");
                setIsEditing(false);
            }
            await fetchData();
        } catch (error) {
            console.log("Error saving profile:", error);
            alert("Failed to save profile: " + error.message);
        }
    }



    const handleConcernChange = (index, value) => {
        const newConcerns = [...concerns];
        newConcerns[index] = value;
        setConcerns(newConcerns);
    };

    const addConcern = () => {
        if (concerns.length < 6) {
            setConcerns([...concerns, '']);
        }
    };

    const removeConcern = (index) => {
        if (concerns.length > 1) {
            const newConcerns = concerns.filter((_, i) => i !== index);
            setConcerns(newConcerns);
        }
    };

    useEffect(() => {
        // Just call fetchData once on mount
        fetchData();
    }, []);

    useEffect(() => {
        if (!profileExists) {
            setIsEditing(true);
        }
    }, [profileExists]);

    const fetchUserBookings = async () => {
        if (pb.authStore.isValid) {
            try {
                const user_id = pb.authStore.model.id;
                const bookingsData = await pb.collection('booking_request').getList(1, 50, {
                    filter: `user_id="${user_id}"`,
                    sort: '-date',
                    expand: 'therapist_id'
                });
                setBookings(bookingsData.items);
            } catch (error) {
                console.log("error fetching bookings:", error);
            }
        }
    };

    useEffect(() => {
        fetchUserBookings();
    }, []);


    const onDeleteAccount = async () => {
        try {
            if (!profileId) {
                alert("No profile found to delete");
                return;
            }

            // Confirm before deletion
            const confirmDelete = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");
            if (!confirmDelete) {
                return;
            }

            console.log("Deleting profile with ID:", profileId);
            await pb.collection('user_profile').delete(profileId);
            alert("Profile deleted successfully");
            router.push('/user_login');
        } catch (error) {
            console.error("Error deleting profile:", error);
            alert("Failed to delete account: " + error.message);
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        let matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        let matchesDate = true;
        const bookingDate = new Date(booking.date);

        if (dateFilter === 'today') {
            const today = new Date();
            matchesDate = bookingDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'yesterday') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            matchesDate = bookingDate.toDateString() === yesterday.toDateString();
        } else if (dateFilter === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            matchesDate = bookingDate.toDateString() === tomorrow.toDateString();
        } else if (dateFilter === 'custom' && customDate) {
            matchesDate = bookingDate.toDateString() === new Date(customDate).toDateString();
        }

        return matchesStatus && matchesDate;
    });


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-blue-800 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-lg shadow-lg p-6 mb-8 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">
                                {profileExists ? 'Your User Profile' : 'Create Your User Profile'}
                            </h1>
                            <p className="mt-2 text-blue-100">
                                {profileExists
                                    ? 'Manage your personal information'
                                    : 'Set up your profile to get personalized care'}
                            </p>
                        </div>
                        {profileExists && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white text-blue-800 px-4 py-2 rounded-md flex items-center hover:bg-blue-100 transition-colors"
                            >
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Main content card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Profile content */}
                    <div className="p-8">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="gender" className="flex items-center text-md font-medium text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                                        Gender
                                    </label>
                                    {isEditing ? (
                                        <select
                                            id="gender"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                        </select>
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            {gender ? (
                                                <p className="text-gray-700 capitalize">{gender.replace('_', ' ')}</p>
                                            ) : (
                                                <p className="text-gray-400 italic">Not specified</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="age" className="flex items-center text-md font-medium text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
                                        Age
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            id="age"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Enter your age"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            min="1"
                                            max="120"
                                        />
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            {age ? (
                                                <p className="text-gray-700">{age} years</p>
                                            ) : (
                                                <p className="text-gray-400 italic">Not specified</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="profession" className="flex items-center text-md font-medium text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-blue-500" />
                                        Profession
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="profession"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Enter your profession"
                                            value={profession}
                                            onChange={(e) => setProfession(e.target.value)}
                                        />
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            {profession ? (
                                                <p className="text-gray-700">{profession}</p>
                                            ) : (
                                                <p className="text-gray-400 italic">Not specified</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Health Concerns Section */}
                                <div>
                                    <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                                        <FontAwesomeIcon icon={faTags} className="mr-2 text-blue-500" />
                                        Health Concerns
                                        {isEditing && concerns.length < 6 && (
                                            <button
                                                onClick={addConcern}
                                                className="ml-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                                                title="Add concern"
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                            </button>
                                        )}
                                    </label>

                                    {isEditing ? (
                                        <div className="space-y-3">
                                            {concerns.map((concern, index) => (
                                                <div key={index} className="flex items-center">
                                                    <input
                                                        type="text"
                                                        className="flex-grow border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        placeholder={`Concern ${index + 1} (e.g., Anxiety, Depression)`}
                                                        value={concern}
                                                        onChange={(e) => handleConcernChange(index, e.target.value)}
                                                    />
                                                    {concerns.length > 1 && (
                                                        <button
                                                            onClick={() => removeConcern(index)}
                                                            className="ml-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                                                            title="Remove concern"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <p className="text-sm text-gray-500 mt-1">
                                                Add up to 6 health concerns you'd like to discuss with therapists
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            {concerns.filter(c => c.trim() !== '').length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {concerns
                                                        .filter(c => c.trim() !== '')
                                                        .map((concern, index) => (
                                                            <span
                                                                key={index}
                                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                                            >
                                                                {concern}
                                                            </span>
                                                        ))
                                                    }
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 italic">No health concerns listed</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end space-x-3 pt-6">
                                    {profileExists && (
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                fetchData(); // Reset to original data
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSave}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-lg flex items-center transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                                        {profileExists ? 'Update Profile' : 'Create Profile'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-blue-900 mb-4">Your Appointments</h2>


                            {/* Filters Section with Dropdowns */}
                            <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-blue-700 mr-2">Filter by Date:</span>
                                    <div className="relative">
                                        <select
                                            className="px-3 text-black py-1 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={dateFilter}
                                            onChange={(e) => {
                                                setDateFilter(e.target.value);
                                                if (e.target.value !== 'custom') setCustomDate('');
                                            }}
                                        >
                                            <option value="all">All Dates</option>
                                            <option value="yesterday">Yesterday</option>
                                            <option value="today">Today</option>
                                            <option value="tomorrow">Tomorrow</option>
                                            <option value="custom">Custom Date</option>
                                        </select>
                                    </div>

                                    {dateFilter === 'custom' && (
                                        <label className="flex items-center ml-2">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-blue-600" />
                                            <input
                                                type="date"
                                                className="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                                value={customDate}
                                                onChange={e => setCustomDate(e.target.value)}
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-blue-700 mr-2">Status:</span>
                                    <div className="relative">
                                        <select
                                            className="px-3 py-1 text-black rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All </option>
                                            <option value="accepted">Accepted</option>
                                            <option value="declined">Rejected</option>
                                            <option value="completed">Completed</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {filteredBookings.length === 0 ? (
                                <p className="text-gray-500">You haven't booked any appointments yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {filteredBookings.map(booking => (
                                        <div key={booking.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {booking.user_name || 'Therapist'}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        {new Date(booking.date).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })} at {booking.time}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    </span>
                                                    {/* Payment Button - Only show for accepted bookings with unpaid status */}
                                                    {booking.status === 'accepted' && booking.payment_status === 'unpaid' && (
                                                        <Link href={`/payment/${booking.id}`}>
                                                        <button
                                                            
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center mt-2"
                                                        >
                                                            <FontAwesomeIcon icon={faCreditCard} className="mr-1 " />
                                                            Make Payment
                                                        </button>
                                                        </Link>
                                                    )}

                                                    {/* Show payment status if paid */}
                                                    {booking.payment_status === 'paid' && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                            Paid
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-10">
                            <Link href="/user-chats">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                                    My Chats
                                </button>
                            </Link>
                            <button className="bg-red-500 text-white px-9 py-2 rounded-lg transition-colors duration-300 border-2 border-transparent hover:border-red-900 hover:bg-transparent hover:text-black"
                                onClick={onDeleteAccount}
                            >Delete Account
                            </button>
                        </div>
                    </div>

                </div>



                <div className="mt-6">
                    <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back to Home
                    </Link>
                </div>


            </div>
        </div>
    );
}