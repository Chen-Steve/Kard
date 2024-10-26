import React from 'react';

interface PerformanceSummaryProps {
  totalCards: number;
  correctAnswers: number;
  maxStreak?: number;  // Optional
  retriedCards?: number;  // Optional
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  totalCards,
  correctAnswers,
  maxStreak,
  retriedCards,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Session Summary</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Total Cards:</span>
          <span className="font-semibold">{totalCards}</span>
        </div>
        <div className="flex justify-between">
          <span>Correct Answers:</span>
          <span className="font-semibold text-green-600">{correctAnswers}</span>
        </div>
        <div className="flex justify-between">
          <span>Accuracy:</span>
          <span className="font-semibold">{((correctAnswers / totalCards) * 100).toFixed(1)}%</span>
        </div>
        {maxStreak !== undefined && (
          <div className="flex justify-between">
            <span>Max Correct Streak:</span>
            <span className="font-semibold text-blue-600">{maxStreak}</span>
          </div>
        )}
        {retriedCards !== undefined && (
          <div className="flex justify-between">
            <span>Cards Retried:</span>
            <span className="font-semibold text-orange-600">{retriedCards}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceSummary;
