'use client';
import { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';

export default function Calendar({ onSelectSlot, therapistId, therapistName }) {
  const [dateNow, setDateNow] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const user = pb.authStore.model;

  // Fetch available slots when therapist or date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setLoading(true);
      try {
        // Format the date range for the 3 days being displayed
        const startDate = new Date(dateNow);
        startDate.setDate(startDate.getDate() - 1);
        const endDate = new Date(dateNow);
        endDate.setDate(endDate.getDate() + 1);

        // Fetch all booking requests for this therapist in the date range
        const slots = await pb.collection('booking_request').getFullList({
          filter: `therapist_id = "${therapistId}" && date >= "${startDate.toISOString().split('T')[0]}" && date <= "${endDate.toISOString().split('T')[0]}"`,
        });
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoading(false);
      }
    };

    if (therapistId) {
      fetchAvailableSlots();
    }
  }, [therapistId, dateNow]);

  // Refresh slots after dialog closes (booking request sent)
  useEffect(() => {
    if (!showDialog) {
      // Only refresh if dialog just closed (after booking)
      const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
          const startDate = new Date(dateNow);
          startDate.setDate(startDate.getDate() - 1);
          const endDate = new Date(dateNow);
          endDate.setDate(endDate.getDate() + 1);
          const slots = await pb.collection('booking_request').getFullList({
            filter: `therapist_id = "${therapistId}" && date >= "${startDate.toISOString().split('T')[0]}" && date <= "${endDate.toISOString().split('T')[0]}"`,
          });
          setAvailableSlots(slots);
        } catch (err) {
          console.error('Error fetching slots:', err);
        } finally {
          setLoading(false);
        }
      };
      if (therapistId) fetchAvailableSlots();
    }
  }, [showDialog, therapistId, dateNow]);

  const changeDate = (dateNow) => {
    const dateTom = new Date(dateNow);
    dateTom.setDate(dateTom.getDate() + 1);
    setDateNow(dateTom);
    setSelectedDayIndex(1);
  };

  // Generate the 3 days
  const days = [0, 1, 2].map((offset) => {
    const day = new Date(dateNow);
    day.setDate(day.getDate() + offset - 1);
    return {
      index: offset,
      date: day,
      dayName: day.toLocaleDateString('en-US', { weekday: 'long' }),
      dayMonth: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const selectedDay = days.find((day) => day.index === selectedDayIndex);

  const handleSlotSelect = (time, isAvailable) => {
    if (!isAvailable) return;

    const slot = {
      day: selectedDay,
      time,
    };

    setSelectedSlot(slot);
    setShowDialog(true);
    if (onSelectSlot) {
      onSelectSlot(slot);
    }
  };

  const handleSendRequest = async () => {
    if (user?.role === 'therapist') {
      alert("Login as a user to request for a session");
      return;
    };
    setRequestLoading(true);
    setRequestError(null);
    try {
      await pb.collection('booking_request').create({
        therapist_id: therapistId,
        therapist_name: therapistName,
        user_id: user?.id,
        user_name: user?.name || user?.username,
        date: selectedSlot.day.date.toISOString().split('T')[0],
        day: selectedSlot.day.dayName,
        time: selectedSlot.time,
        status: 'pending',
      });
      setShowDialog(false);
      alert('Booking Request Sent!');

      // Refresh available slots after booking
      const startDate = new Date(dateNow);
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(dateNow);
      endDate.setDate(endDate.getDate() + 1);

      const slots = await pb.collection('booking_request').getFullList({
        filter: `therapist_id = "${therapistId}" && date >= "${startDate.toISOString().split('T')[0]}" && date <= "${endDate.toISOString().split('T')[0]}"`,
      });
      setAvailableSlots(slots);
    } catch (err) {
      setRequestError('Failed to send request');
      console.error(err);
    } finally {
      setRequestLoading(false);
    }
  };

  // Reusable slot rendering function
  const renderSlots = (times) => {
    return times.map((time, index) => {
      const dateStr = new Date(selectedDay.date).toISOString().slice(0, 10);

      // Find all bookings for this slot
      const slotBookings = availableSlots.filter(
        (slot) => {
          // Handle different date formats - extract just the date part
          const slotDateStr = new Date(slot.date).toISOString().slice(0, 10); // Extract YYYY-MM-DD from datetime
          return slotDateStr === dateStr && slot.time === time;
        }
      );

      let isAvailable = true;
      let isCompleted = false;

      if (slotBookings.length > 0) {
        // Check if ANY booking has status "accepted", "completed", or "pending"
        const now = new Date();
        const slotDateTime = new Date(selectedDay.date);
        // Parse time string (e.g., "9:00 AM") and set hours/minutes
        const [timeStr, meridian] = time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (meridian === 'PM' && hours !== 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
        slotDateTime.setHours(hours, minutes, 0, 0);

        // If slot is accepted and time has passed, treat as completed
        const hasAccepted = slotBookings.some(
          (slot) => slot.status?.toLowerCase() === 'accepted'
        );
        if (hasAccepted && slotDateTime < now) {
          isCompleted = true;
        }

        // Check for statuses that should block the slot
        const hasBlockedStatus = slotBookings.some(
          (slot) => {
            const status = slot.status?.toLowerCase();
            const shouldBlock = (
              status === 'pending' ||
              status === 'accepted'
            );

            // Debug logging for 11:00 AM slot
            if (time === '11:00 AM') {
              console.log(`Checking booking status: ${status}, shouldBlock: ${shouldBlock}`);
            }

            return shouldBlock;
          }
        );

        if (hasBlockedStatus || isCompleted) {
          isAvailable = false; // disable for completed, pending, or past accepted
        }

        // Debug logging for 11:00 AM slot
        if (time === '11:00 AM') {
          console.log('hasBlockedStatus:', hasBlockedStatus);
          console.log('isCompleted:', isCompleted);
          console.log('Final isAvailable:', isAvailable);
          console.log('=== END DEBUG 11:00 AM ===');
        }
      }

      return (
        <button
          key={index}
          onClick={() => handleSlotSelect(time, isAvailable)}
          className={`flex-shrink-0 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${selectedSlot && selectedSlot.time === time && selectedSlot.day.index === selectedDay.index
            ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md transform hover:-translate-y-1'
            : isCompleted
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : isAvailable
                ? 'bg-yellow-400 text-purple-900 hover:bg-yellow-500 hover:shadow-md transform hover:-translate-y-1'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          disabled={!isAvailable}
        >
          {time}
        </button>
      );
    });
  };


  return (
    <div>
      <div className="calendar-container p-4 bg-white rounded-lg shadow-md">
        <div className="calendar-header flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-900">
            {dateNow.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const prevDate = new Date(dateNow);
                prevDate.setDate(prevDate.getDate() - 1);
                setDateNow(prevDate);
                setSelectedDayIndex(1);
              }}
              className="p-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200"
            >
              Previous
            </button>
            <button
              onClick={() => changeDate(dateNow)}
              className="p-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200"
            >
              Next
            </button>
          </div>
        </div>

        {/* Day buttons */}
        <div className="day-buttons flex space-x-2 mb-4">
          {days.map((day) => (
            <button
              key={day.index}
              onClick={() => setSelectedDayIndex(day.index)}
              className={`flex-1 p-3 rounded-lg transition-all duration-200 ${selectedDayIndex === day.index
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                }`}
            >
              <div className="font-bold">{day.dayName}</div>
              <div>{day.dayMonth}</div>
            </button>
          ))}
        </div>

        {/* Time slots */}
        {selectedDay && (
          <div className="time-slots-card border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              Available Times for {selectedDay.dayName}, {selectedDay.dayMonth}
            </h3>

            {/* Morning slots */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Morning</h4>
              <div className="flex overflow-x-auto pb-2 space-x-3">
                {renderSlots(['9:00 AM', '10:00 AM', '11:00 AM'])}
              </div>
            </div>

            {/* Afternoon slots */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Afternoon</h4>
              <div className="flex overflow-x-auto pb-2 space-x-3">
                {renderSlots(['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'])}
              </div>
            </div>

            {loading && (
              <div className="text-center py-4 text-gray-500">Loading available slots...</div>
            )}

            {!loading && availableSlots.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No available slots found for this therapist.
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Unavailable</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Selected</span>
          </div>
        </div>
      </div>

      {showDialog && selectedSlot && (
        <div className="fixed inset-0 bg-lavendar bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">Send Booking Request?</h3>
            <p className="mb-4">
              <strong>Date:</strong> {selectedSlot.day.dayMonth} <br />
              <strong>Day:</strong> {selectedSlot.day.dayName} <br />
              <strong>Time:</strong> {selectedSlot.time}
            </p>
            {requestError && <p className="text-red-500 mb-2">{requestError}</p>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowDialog(false)}
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={handleSendRequest}
                disabled={requestLoading}
              >
                {requestLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
