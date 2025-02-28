import React from 'react';
import { 
  FileText, Type, List, File, Info, Video, 
  GitMerge, Mic, Calendar, CheckSquare, FileEdit 
} from 'lucide-react';

interface ActionTypeSelectorProps {
  onSelectType: (type: string) => void;
  onClose: () => void;
}

export const ActionTypeSelector: React.FC<ActionTypeSelectorProps> = ({ 
  onSelectType, 
  onClose 
}) => {
  const actionTypes = [
    { 
      type: 'text', 
      label: 'Text Input', 
      icon: <Type size={20} className="text-blue-500" />,
      description: 'Simple text input field'
    },
    { 
      type: 'long_text', 
      label: 'Long Text', 
      icon: <FileText size={20} className="text-indigo-500" />,
      description: 'Multi-line text area for longer content'
    },
    { 
      type: 'file_upload', 
      label: 'File Upload', 
      icon: <File size={20} className="text-green-500" />,
      description: 'Upload files of any type'
    },
    { 
      type: 'document', 
      label: 'Rich Document', 
      icon: <FileEdit size={20} className="text-orange-500" />,
      description: 'Rich text editor with formatting'
    },
    { 
      type: 'info', 
      label: 'Information', 
      icon: <Info size={20} className="text-cyan-500" />,
      description: 'Display information with optional attachments'
    },
    { 
      type: 'approval', 
      label: 'Approval', 
      icon: <CheckSquare size={20} className="text-red-500" />,
      description: 'Request approval from managers'
    },
    { 
      type: 'date', 
      label: 'Date Input', 
      icon: <Calendar size={20} className="text-purple-500" />,
      description: 'Date selection field'
    },
    { 
      type: 'video_upload', 
      label: 'Video Upload', 
      icon: <Video size={20} className="text-pink-500" />,
      description: 'Upload and process video files'
    },
    { 
      type: 'video_decoupage', 
      label: 'Video Decoupage', 
      icon: <GitMerge size={20} className="text-yellow-500" />,
      description: 'Break down video into scenes and segments'
    },
    { 
      type: 'audio_processing', 
      label: 'Audio Processing', 
      icon: <Mic size={20} className="text-teal-500" />,
      description: 'Process and edit audio files'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border p-4 w-full max-w-md">
      <h3 className="text-lg font-medium mb-4 pb-2 border-b">Select Action Type</h3>
      
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {actionTypes.map(actionType => (
          <button
            key={actionType.type}
            onClick={() => {
              onSelectType(actionType.type);
              onClose();
            }}
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
          >
            <div className="p-3 rounded-full bg-gray-100 mb-2">
              {actionType.icon}
            </div>
            <span className="font-medium text-gray-800">{actionType.label}</span>
            <span className="text-xs text-gray-500 mt-1 text-center">
              {actionType.description}
            </span>
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
