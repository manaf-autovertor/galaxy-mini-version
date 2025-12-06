import { useState } from 'react';
import { X, FileText, Image as ImageIcon, Paperclip, Loader2 } from 'lucide-react';

function DocumentUploadModal({ isOpen, onClose, onUpload, queryId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');
  const [docCategory, setDocCategory] = useState('');

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      
      if (docType) formData.append('doc_type', docType);
      if (docCategory) formData.append('doc_category', docCategory);

      await onUpload(formData);
      
      // Reset and close
      setFiles([]);
      setDocType('');
      setDocCategory('');
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Upload Documents</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document Type (Optional)
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
            >
              <option value="">Select type...</option>
              <option value="PAN">PAN</option>
              <option value="ADHAAR">Adhaar</option>
              <option value="DRIVING_LICENSE">Driving License</option>
              <option value="PASSPORT">Passport</option>
              <option value="VOTERS_ID">Voter ID</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Document Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document Category (Optional)
            </label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
            >
              <option value="">Select category...</option>
              <option value="KYC">KYC</option>
              <option value="ADDRESS_PROOF">Address Proof</option>
              <option value="INCOME_PROOF">Income Proof</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Files
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center py-4">
                <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  Click to upload files
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, JPG, PNG (Max 10MB each)
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Selected Files ({files.length})
              </p>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  ) : (
                    <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload {files.length > 0 && `(${files.length})`}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentUploadModal;
