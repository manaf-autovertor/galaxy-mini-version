import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Camera,
  FileText,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

function DocumentUploadDetail() {
  const { applicationId, queryId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [application, setApplication] = useState(null);

  // Form states
  const [docCategory, setDocCategory] = useState("");
  const [docTypeSelect, setDocTypeSelect] = useState("");
  const [docTypeOther, setDocTypeOther] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [profileOptions, setProfileOptions] = useState([]);
  const [imageMode, setImageMode] = useState("UPLOAD");
  const [attachments, setAttachments] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);

  const doctypes = {
    KYC: [
      "VOTERS_ID_FRONT",
      "VOTERS_ID_BACK",
      "PASSPORT_FRONT",
      "PASSPORT_BACK",
      "DRIVING_LICENSE",
      "ADHAAR_FRONT",
      "ADHAAR_BACK",
    ],
    FORM_60: ["FORM_60"],
    PAN: ["PAN"],
    DOB_PROOF: ["PAN"],
    RELATIONSHIP_PROOF: ["PAN"],
    SIGNATURE_PROOF: ["PAN"],
    KYC_FROM_SOURCE: ["CKYC", "DIGILOCKER", "ADHAAR_XML"],
    COMMUNICATION_ADDRESS_PROOF: [
      "TELEPHONE_BILL",
      "ELECTRICITY_BILL",
      "GAS_BILL",
      "SALE_AGREEMENT",
      "RENT_AGREEMENT",
      "BANK_STATEMENT",
    ],
    DISBURSAL_DOCUMENTS: [
      "SIGNED_APPLICATION_FORM",
      "SIGNED_SANCTION_LETTER",
      "SIGNED_LOAN_AGREEMENT",
      "RTO_FORM",
      "MMR/INVOICE",
    ],
    OTHER: ["OTHER"],
  };

  useEffect(() => {
    loadApplication();
    return () => {
      stopCamera();
    };
  }, [applicationId]);

  useEffect(() => {
    if (docCategory) {
      setDocTypeSelect("");
      setDocTypeOther("");
    }
  }, [docCategory]);

  useEffect(() => {
    if (customerType && application) {
      updateProfileOptions();
    }
  }, [customerType, application]);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/mobile/applications/${applicationId}`
      );
      if (response.data.success) {
        setApplication(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load application:", error);
      toast.error("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const updateProfileOptions = () => {
    if (!application) return;

    let options = {};

    switch (customerType) {
      case "CUSTOMER":
        if (application.customer) {
          options[application.customer.id] = `${
            application.customer.profile_first_name || ""
          } (${application.customer.id})`;
        }
        break;
      case "GUARANTOR":
        if (application.guarantor) {
          options[application.guarantor.id] = `${
            application.guarantor.profile_first_name || ""
          } (${application.guarantor.id})`;
        }
        break;
      case "COAPPLICANT":
        if (application.coapplicants && application.coapplicants.length > 0) {
          application.coapplicants.forEach((co) => {
            if (co.profile) {
              options[co.profile.id] = `${
                co.profile.profile_first_name || ""
              } (${co.profile.id})`;
            }
          });
        }
        break;
    }

    setProfileOptions(options);

    // Auto-select if only one option
    const optionKeys = Object.keys(options);
    if (optionKeys.length === 1) {
      setSelectedProfileId(optionKeys[0]);
    } else {
      setSelectedProfileId("");
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAttachments([...attachments, ...files]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Unable to access camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setCapturedImage(file);
        stopCamera();
      }, "image/jpeg");
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!docCategory) {
      toast.error("Please select document category");
      return;
    }

    if (docCategory === "OTHER" && !docTypeOther) {
      toast.error("Please enter document type");
      return;
    }

    if (docCategory !== "OTHER" && !docTypeSelect) {
      toast.error("Please select document type");
      return;
    }

    if (!customerType) {
      toast.error("Please select customer type");
      return;
    }

    if (!selectedProfileId) {
      toast.error("Please select profile");
      return;
    }

    if (imageMode === "UPLOAD" && attachments.length === 0) {
      toast.error("Please upload a file");
      return;
    }

    if (imageMode === "TAKE" && !capturedImage) {
      toast.error("Please capture an image");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("doc_category", docCategory);
      formData.append(
        "doc_type",
        docCategory === "OTHER" ? docTypeOther : docTypeSelect
      );
      formData.append("customer_type", customerType);
      formData.append("profile_id", selectedProfileId);
      formData.append("application_id", applicationId);

      if (queryId) {
        formData.append("query_id", queryId);
      }

      if (imageMode === "UPLOAD") {
        attachments.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
      } else {
        formData.append("files[0]", capturedImage);
      }

      const response = await api.post("/api/mobile/upload-document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Document uploaded successfully");
        navigate(-1);
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg safe-top">
        <div className="px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Upload Document
              </h1>
              <p className="text-[10px] text-gray-600 leading-tight">
                App #{applicationId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 pb-20 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Document Category */}
          <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Document Category *
            </label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Select Category</option>
              {Object.keys(doctypes).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type */}
          {docCategory && (
            <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Document Type *
              </label>
              {docCategory === "OTHER" ? (
                <input
                  type="text"
                  value={docTypeOther}
                  onChange={(e) => setDocTypeOther(e.target.value)}
                  placeholder="Enter document type"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              ) : (
                <select
                  value={docTypeSelect}
                  onChange={(e) => setDocTypeSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Type</option>
                  {doctypes[docCategory]?.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Customer Type */}
          <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Customer Type *
            </label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Select Customer Type</option>
              <option value="CUSTOMER">Customer</option>
              <option value="COAPPLICANT">Co-Applicant</option>
              <option value="GUARANTOR">Guarantor</option>
            </select>
          </div>

          {/* Profile Selection */}
          {customerType && Object.keys(profileOptions).length > 0 && (
            <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Select Profile *
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Select Profile</option>
                {Object.entries(profileOptions).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Image Mode Toggle */}
          <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Upload Method
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setImageMode("UPLOAD");
                  stopCamera();
                  setCapturedImage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  imageMode === "UPLOAD"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <button
                onClick={() => {
                  setImageMode("TAKE");
                  setAttachments([]);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  imageMode === "TAKE"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Camera className="w-4 h-4" />
                Camera
              </button>
            </div>
          </div>

          {/* File Upload */}
          {imageMode === "UPLOAD" && (
            <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Select File *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 transition-all flex flex-col items-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-600">Click to upload</span>
              </button>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
                    >
                      <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="flex-1 text-xs font-medium text-gray-700 truncate">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="p-0.5 hover:bg-white rounded-full transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Camera Capture */}
          {imageMode === "TAKE" && (
            <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Capture Image *
              </label>

              {!cameraActive && !capturedImage && (
                <button
                  onClick={startCamera}
                  className="w-full px-3 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  Start Camera
                </button>
              )}

              {cameraActive && (
                <div className="space-y-2">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-xl"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={captureImage}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all active:scale-95"
                    >
                      Capture
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="space-y-2">
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(capturedImage)}
                      alt="Captured"
                      className="w-full rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        startCamera();
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-50 p-2 rounded-xl">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      Image captured
                    </span>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentUploadDetail;
