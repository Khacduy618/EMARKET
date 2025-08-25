// app/components/CountdownTimer.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  expiryTimestamp: string; // ISO 8601 string, e.g., "2025-08-25 12:30:00"
  onExpire: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryTimestamp, onExpire }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryTimestamp) - +new Date();
    let timeLeft = { minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        onExpire();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }); // Chạy mỗi giây

  const isExpired = timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className={`p-4 rounded-md text-center my-4 transition-colors ${isExpired ? 'bg-red-100 border-red-300 text-red-800' : 'bg-yellow-100 border-yellow-300 text-yellow-800'}`}>
        <div className="flex items-center justify-center font-semibold">
            <Timer size={18} className="mr-2" />
            {isExpired ? (
                <span>Đơn hàng đã hết hạn thanh toán</span>
            ) : (
                <span>
                    Vui lòng hoàn tất thanh toán trong: {' '}
                    <span className="font-bold text-lg tabular-nums">
                        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                </span>
            )}
        </div>
    </div>
  );
};

export default CountdownTimer;