import React, { useState } from "react";

const FeedbackCard = () => {
  const [upvotes, setUpvotes] = useState(38);
  
  return (
    <div className="flex items-center justify-between w-full max-w-md p-4 bg-white shadow-md rounded-lg border border-gray-200">
      <div>
        <h3 className="font-bold text-black">PayPal integration</h3>
        <p className="text-gray-600 text-sm">
          20% of users are asking for it, I need it to grow revenue.
        </p>
      </div>
      <button
        className="flex flex-col items-center justify-center bg-yellow-400 text-black font-semibold w-12 h-16 rounded-lg hover:bg-yellow-500 transition"
        onClick={() => setUpvotes(upvotes + 1)}
      >
        <span className="text-lg">▲</span>
        <span>{upvotes}</span>
      </button>
    </div>
  );
};

export default FeedbackCard;
