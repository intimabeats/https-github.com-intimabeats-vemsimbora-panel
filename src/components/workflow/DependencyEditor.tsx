import React, { useState, useEffect } from 'react';
import { TaskAction } from '../../types/firestore-schema';
import { GitBranch, Check, X, AlertTriangle, Info } from 'lucide-react';

interface DependencyEditorProps {
  actions: TaskAction[];
  currentActionId: string;
  onUpdateDependencies: (actionId: string, dependsOn: string[]) => void;
  onClose: () => void;
}

export const DependencyEditor: React.FC<DependencyEditorProps> = ({
  actions,
  currentActionId,
  onUpdateDependencies,
  onClose
}) => {
  const currentAction = actions.find(a => a.id === currentActionId);
  const [selectedDeps, setSelectedDeps] = useState<string[]>(
    currentAction?.dependsOn || []
  );
  const [error, setError] = useState<string | null>(null);
  
  // Reset selected dependencies when current action changes
  useEffect(() => {
    setSelectedDeps(currentAction?.dependsOn || []);
    setError(null);
  }, [currentAction]);
  
  // Filter actions to avoid cycles and self-dependencies
  const availableActions = actions.filter(a => a.id !== currentActionId);
  
  const handleToggleDependency = (actionId: string) => {
    setSelectedDeps(prev => {
      if (prev.includes(actionId)) {
        return prev.filter(id => id !== actionId);
      } else {
        return [...prev, actionId];
      }
    });
    setError(null);
  };
  
  const handleSave = () => {
    try {
      // Check for potential cycles before saving
      const tempDeps = new Map<string, string[]>();
      actions.forEach(action => {
        if (action.id === currentActionId) {
          tempDeps.set(action.id, [...selectedDeps]);
        } else if (action.dependsOn) {
          tempDeps.set(action.id, [...action.dependsOn]);
        } else {
          tempDeps.set(action.id, []);
        }
      });
      
      // Check for cycles
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      
      const checkCycle = (actionId: string): boolean => {
        if (recursionStack.has(actionId)) {
          return true; // Cycle detected
        }
        
        if (visited.has(actionId)) {
          return false; // Already checked, no cycle
        }
        
        visited.add(actionId);
        recursionStack.add(actionId);
        
        const dependencies = tempDeps.get(actionId) || [];
        for (const depId of dependencies) {
          if (checkCycle(depId)) {
            return true;
          }
        }
        
        recursionStack.delete(actionId);
        return false;
      };
      
      if (checkCycle(currentActionId)) {
        setError("Cannot save: this would create a circular dependency");
        return;
      }
      
      onUpdateDependencies(currentActionId, selectedDeps);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating dependencies");
    }
  };

  if (!currentAction) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-700">
        Action not found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border p-4">
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h3 className="font-medium text-lg flex items-center">
          <GitBranch className="mr-2 text-blue-500" size={20} />
          Edit Dependencies for "{currentAction.title}"
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center text-red-700">
          <AlertTriangle className="mr-2 flex-shrink-0" size={18} />
          {error}
        </div>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center text-blue-700">
        <Info className="mr-2 flex-shrink-0" size={18} />
        Select actions that must be completed before this action can be started.
      </div>
      
      <div className="max-h-60 overflow-y-auto mb-4 border rounded-lg divide-y">
        {availableActions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No other actions available to set as dependencies.
          </div>
        ) : (
          availableActions.map(action => (
            <div 
              key={action.id} 
              className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedDeps.includes(action.id) ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleToggleDependency(action.id)}
            >
              <div className={`w-5 h-5 rounded-md border mr-3 flex items-center justify-center ${
                selectedDeps.includes(action.id) 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-gray-300'
              }`}>
                {selectedDeps.includes(action.id) && (
                  <Check size={14} className="text-white" />
                )}
              </div>
              <div className="flex-grow">
                <div className="font-medium text-gray-800">{action.title}</div>
                <div className="text-xs text-gray-500 truncate">{action.description || 'No description'}</div>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {action.type}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <Check size={18} className="mr-2" />
          Save Dependencies
        </button>
      </div>
    </div>
  );
};
