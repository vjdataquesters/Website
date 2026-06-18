import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CountdownTimer = ({ targetDate, size = "normal" }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div key={interval} className="flex flex-col items-center mx-1 sm:mx-2">
        <div className={`flex items-center justify-center font-bold text-white bg-[#0f323f] rounded-lg shadow-md ${size === 'small' ? 'w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-lg' : 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-4xl'}`}>
          {timeLeft[interval].toString().padStart(2, "0")}
        </div>
        <span className={`text-gray-600 mt-1 uppercase tracking-wide font-semibold ${size === 'small' ? 'hidden sm:block text-[10px]' : 'text-xs sm:text-sm'}`}>
          {interval}
        </span>
      </div>
    );
  });

  return (
    <div className="flex flex-row justify-center items-center">
      {timerComponents.length ? timerComponents : <span>Event Started!</span>}
    </div>
  );
};

CountdownTimer.propTypes = {
  targetDate: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["small", "normal"]),
};

export default CountdownTimer;
