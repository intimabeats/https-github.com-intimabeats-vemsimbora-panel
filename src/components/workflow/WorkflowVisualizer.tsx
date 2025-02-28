import React, { useMemo } from 'react';
import { TaskAction } from '../../types/firestore-schema';
import { GitBranch, GitMerge, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface WorkflowVisualizerProps {
  actions: TaskAction[];
  onSelectAction?: (actionId: string) => void;
  highlightActionId?: string;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ 
  actions, 
  onSelectAction,
  highlightActionId
}) => {
  // Organize actions into levels based on dependencies
  const actionLevels = useMemo(() => {
    const actionMap = new Map<string, TaskAction>();
    actions.forEach(action => actionMap.set(action.id, action));
    
    // Find actions with no dependencies (initial actions)
    const initialActions = actions.filter(action => 
      !action.dependsOn || action.dependsOn.length === 0
    );
    
    // Organize in levels
    const levels: TaskAction[][] = [];
    let currentLevel = initialActions;
    
    while (currentLevel.length > 0) {
      levels.push(currentLevel);
      
      // Find next level (actions that depend only on actions already processed)
      const processedActionIds = new Set<string>();
      levels.flat().forEach(action => processedActionIds.add(action.id));
      
      const nextLevel = actions.filter(action => {
        if (processedActionIds.has(action.id)) return false;
        
        // Check if all dependencies are already processed
        return action.dependsOn?.every(depId => processedActionIds.has(depId)) ?? true;
      });
      
      currentLevel = nextLevel;
    }
    
    return levels;
  }, [actions]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (actions.length === 0) return 0;
    const completedCount = actions.filter(a => a.completed).length;
    return Math.round((completedCount / actions.length) * 100);
  }, [actions]);

  // Get action status class
  const getActionStatusClass = (action: TaskAction) => {
    if (action.id === highlightActionId) {
      return 'border-2 border-blue-500 bg-blue-50';
    }
    
    if (action.completed) {
      return 'bg-green-50 border-green-200';
    }
    
    // Check if all dependencies are completed
    const allDependenciesCompleted = !action.dependsOn || action.dependsOn.length === 0 || 
      action.dependsOn.every(depId => {
        const dep = actions.find(a => a.id === depId);
        return dep && dep.completed;
      });
    
    if (allDependenciesCompleted) {
      return 'bg-blue-50 border-blue-200';
    } else {
      return 'bg-gray-50 border-gray-200 opacity-60';
    }
  };

  // Get action status icon
  const getActionStatusIcon = (action: TaskAction) => {
    if (action.completed) {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    
    const allDependenciesCompleted = !action.dependsOn || action.dependsOn.length === 0 || 
      action.dependsOn.every(depId => {
        const dep = actions.find(a => a.id === depId);
        return dep && dep.completed;
      });
    
    if (allDependenciesCompleted) {
      return <Clock size={16} className="text-blue-500" />;
    } else {
      return <AlertTriangle size={16} className="text-gray-400" />;
    }
  };

  if (actions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No actions defined yet. Add actions to visualize the workflow.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Workflow Progress</span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Workflow visualization */}
      <div className="relative">
        {actionLevels.map((level, levelIndex) => (
          <div key={levelIndex} className="flex mb-8 relative">
            {/* Level indicator */}
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-700">
              {levelIndex + 1}
            </div>
            
            {/* Actions in this level */}
            <div className="flex flex-wrap gap-4 pl-4">
              {level.map(action => (
                <div 
                  key={action.id}
                  onClick={() => onSelectAction?.(action.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${getActionStatusClass(action)}`}
                  style={{ minWidth: '200px' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800 truncate max-w-[150px]" title={action.title}>
                      {action.title}
                    </h3>
                    {getActionStatusIcon(action)}
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2" title={action.description}>
                    {action.description || 'No description'}
                  </p>
                  
                  {/* Dependencies */}
                  {action.dependsOn && action.dependsOn.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <GitBranch size={12} className="mr-1" />
                        <span>Depends on {action.dependsOn.length} action{action.dependsOn.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Vertical connector lines */}
        {actionLevels.length > 1 && actionLevels.map((_, levelIndex) => {
          if (levelIndex === actionLevels.length - 1) return null;
          return (
            <div 
              key={`connector-${levelIndex}`}
              className="absolute left-[-4px] w-[2px] bg-gray-300"
              style={{ 
                top: `${levelIndex * 8 + 4}rem`, 
                height: '4rem'
              }}
            ></div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium mb-2">Legend:</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
            <span className="text-xs">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2"></div>
            <span className="text-xs">Ready</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 opacity-60 rounded mr-2"></div>
            <span className="text-xs">Waiting for dependencies</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded mr-2"></div>
            <span className="text-xs">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
