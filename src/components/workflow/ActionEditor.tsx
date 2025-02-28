
import React, { useState } from 'react';
import { TaskAction } from '../../types/firestore-schema';
import { 
  Save, X, Trash2, GitBranch, AlertTriangle, 
  Info, Video, Mic, Calendar, FileText, Type, 
  File, CheckSquare, FileEdit
} from 'lucide-react';

interface ActionEditorProps {
  action: TaskAction;
  onSave: (updatedAction: TaskAction) => void;
  onDelete: () => void;
  onEditDependencies: () => void;
  onCancel: () => void;
}

export const ActionEditor: React.FC<ActionEditorProps> = ({
  action,
  onSave,
  onDelete,
  onEditDependencies,
  onCancel
}) => {
  const [editedAction, setEditedAction] = useState<TaskAction>({...action});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (field: keyof TaskAction, value: any) => {
    setEditedAction(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateAction = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!editedAction.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    // Add more validation as needed for specific action types
    if (editedAction.type === 'info') {
      if (editedAction.hasAttachments && !editedAction.infoTitle?.trim()) {
        newErrors.infoTitle = 'Title is required for info with attachments';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateAction()) {
      onSave(editedAction);
    }
  };

  // Get icon based on action type
  const getActionTypeIcon = () => {
    switch (editedAction.type) {
      case 'text': return <Type size={20} className="text-blue-500" />;
      case 'long_text': return <FileText size={20} className="text-indigo-500" />;
      case 'file_upload': return <File size={20} className="text-green-500" />;
      case 'document': return <FileEdit size={20} className="text-orange-500" />;
      case 'info': return <Info size={20} className="text-cyan-500" />;
      case 'approval': return <CheckSquare size={20} className="text-red-500" />;
      case 'date': return <Calendar size={20} className="text-purple-500" />;
      case 'video_upload': return <Video size={20} className="text-pink-500" />;
      case 'video_decoupage': return <GitBranch size={20} className="text-yellow-500" />;
      case 'audio_processing': return <Mic size={20} className="text-teal-500" />;
      default: return <Info size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border p-4">
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h3 className="font-medium text-lg flex items-center">
          {getActionTypeIcon()}
          <span className="ml-2">Edit Action</span>
        </h3>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>
      
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-700 mb-2">
            <AlertTriangle size={18} className="mr-2" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="list-disc pl-5 text-sm text-red-600">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Common fields for all action types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={editedAction.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>