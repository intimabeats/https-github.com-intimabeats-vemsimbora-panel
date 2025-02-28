import React from 'react';
import { TaskAction } from '../../types/firestore-schema';
import { GitMerge, CheckCircle, Clock } from 'lucide-react';

interface WorkflowProgressProps {
  actions: TaskAction[];
  currentActionId?: string;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ 
  actions, 
  currentActionId 
}) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  // Calculate completion percentage
  const completedCount = actions.filter(a => a.completed).length;
  const totalCount = actions.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  
  // Find current action index
  const currentActionIndex = currentActionId 
    ? actions.findIndex(a => a.id === currentActionId)
    : actions.findIndex(a => !a.completed);
  
  // Calculate progress stages (simplified for visualization)
  const stages = [
    { name: 'Start', complete: true },
    { name: '25%', complete: completionPercentage >= 25 },
    { name: '50%', complete: completionPercentage >= 50 },
    { name: '75%', complete: completionPercentage >= 75 },
    { name: 'Complete', complete: completionPercentage === 100 }
  ];

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <GitMerge className="mr-2 text-purple-600" />
        Workflow Progress
      </h3>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {completedCount} of {totalCount} actions completed
          </span>
          <span className="text-sm font-medium text-purple-700">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Progress stages */}
      <div className="relative pt-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200"></div>
        <div className="flex justify-between">
          {stages.map((stage, index) => (
            <div key={index} className="relative flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                stage.complete ? 'bg-purple-600' : 'bg-gray-300'
              }`}>
                {stage.complete && <CheckCircle size={14} className="text-white" />}
              </div>
              <span className={`text-xs mt-1 ${
                stage.complete ? 'text-purple-600 font-medium' : 'text-gray-500'
              }`}>
                {stage.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Current action indicator */}
      {currentActionIndex >= 0 && (
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <Clock className="text-blue-500 mr-2" size={18} />
            <div>
              <span className="text-sm font-medium text-blue-700">Current Action:</span>
              <span className="ml-2 text-sm text-blue-600">
                {actions[currentActionIndex].title}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
