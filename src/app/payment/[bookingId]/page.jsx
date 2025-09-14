"use client";
import { pb } from "@/app/lib/pocketbase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PaymentPage() {
  const { bookingId } = useParams(); // ✅ dynamic route param from /payment/[bookingId]

  const [method, setMethod] = useState("gpay");
  const [number, setNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [booking, setBooking] = useState(null);

  // 1. Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const record = await pb.collection("booking_request").getOne(bookingId);
        setBooking(record);
      } catch (err) {
        console.error("Failed to fetch booking:", err);
      }
    };

    if (bookingId) fetchBooking();
  }, [bookingId]);

  // 2. Handle payment save
  const handleSave = async (e) => {
    e.preventDefault();

    if (!bookingId) {
      console.error("BookingId missing! Cannot save payment.");
      return;
    }

    try {
      // Save payment in "payment" collection
      const record = await pb.collection("payment").create({
        method,
        number,
        expiry_date: expiryDate,
        cvv,
        booking_id: bookingId, // ✅ ensure schema supports this field
      });
      console.log("Payment created:", record);

      // Update booking status
      const updatedBooking = await pb
        .collection("booking_request")
        .update(bookingId, { payment_status: "paid" });
      console.log("Booking updated:", updatedBooking);

      // Save receipt data
      setReceipt({
        id: record.id,
        method,
        number,
        expiryDate,
        therapistName: updatedBooking.therapist_name,
        sessionDetails: `${updatedBooking.date} (${updatedBooking.day}) at ${updatedBooking.time}`,
        userName: updatedBooking.user_name,
        paidAt: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment Failed! Check console for details.");
    }
  };

  // 3. Show receipt after payment
  if (receipt) {
    return (
      <div className="max-w-lg mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Payment Receipt</h2>

        <div className="space-y-3">
          <p><span className="font-semibold">Receipt ID:</span> {receipt.id}</p>
          <p><span className="font-semibold">User:</span> {receipt.userName}</p>
          <p><span className="font-semibold">Therapist:</span> {receipt.therapistName}</p>
          <p><span className="font-semibold">Session:</span> {receipt.sessionDetails}</p>
          <p><span className="font-semibold">Payment Method:</span> {receipt.method}</p>
          <p><span className="font-semibold">Paid At:</span> {receipt.paidAt}</p>

          {(receipt.method === "gpay" || receipt.method === "upi") && (
            <p><span className="font-semibold">ID / Number:</span> {receipt.number}</p>
          )}
          {receipt.method === "card" && (
            <>
              <p><span className="font-semibold">Card Number:</span> {receipt.number}</p>
              <p><span className="font-semibold">Expiry:</span> {receipt.expiryDate}</p>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setReceipt(null)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  // 4. Show payment form if not yet paid
  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Make Payment</h2>

      {booking ? (
        <p className="mb-4 text-gray-600 text-center">
          Paying for session with <b>{booking.therapist_name}</b> on{" "}
          <b>{booking.date}</b> (<b>{booking.day}</b>) at <b>{booking.time}</b>
        </p>
      ) : (
        <p className="text-center text-gray-500">Loading booking details...</p>
      )}

      {/* Payment Method Selection */}
      <div className="flex justify-center gap-3 mb-6">
        {["gpay", "upi", "card"].map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`px-4 py-2 rounded-lg ${
              method === m ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {m === "gpay" ? "GPay" : m === "upi" ? "UPI" : "Credit Card"}
          </button>
        ))}
      </div>

      {/* Dynamic Forms */}
      {method === "gpay" && (
        <form className="space-y-4" onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Enter GPay mobile number"
            className="w-full border px-3 py-2 rounded-lg"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">
            Pay with GPay
          </button>
        </form>
      )}

      {method === "upi" && (
        <form className="space-y-4" onSubmit={handleSave}>
          <input
            type="text"
            placeholder="example@upi"
            className="w-full border px-3 py-2 rounded-lg"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
            Pay with UPI
          </button>
        </form>
      )}

      {method === "card" && (
        <form className="space-y-4" onSubmit={handleSave}>
          <input
            type="text"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="w-full border px-3 py-2 rounded-lg"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full border px-3 py-2 rounded-lg"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="***"
              className="w-full border px-3 py-2 rounded-lg"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">
            Pay with Card
          </button>
        </form>
      )}
    </div>
  );
}
