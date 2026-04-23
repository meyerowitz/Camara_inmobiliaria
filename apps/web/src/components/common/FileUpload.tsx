import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '@/config/env';

interface FileUploadProps {
  label: string;
  accept?: string;
  folder?: string;
  onUploadSuccess: (url: string) => void;
  onClear: () => void;
  required?: boolean;
}

export default function FileUpload({ 
  label, 
  accept = "image/*,.pdf", 
  folder = "registros", 
  onUploadSuccess, 
  onClear,
  required = false
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Reset state
    setFile(selectedFile);
    setError(null);
    setUploading(true);

    try {
      // 1. Get presigned URL
      const presignRes = await fetch(`${API_URL}/api/public/uploads/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile.name,
          folder,
        }),
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok || !presignData.success) {
        throw new Error(presignData.message || 'Error al obtener URL de subida');
      }

      const { signedUploadUrl, token, publicUrl } = presignData.data;

      // 2. Upload to Supabase Storage via PUT
      const uploadRes = await fetch(signedUploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      });

      if (!uploadRes.ok) {
        throw new Error('Error al subir el archivo a storage');
      }

      // 3. Success
      setUploadedUrl(publicUrl);
      onUploadSuccess(publicUrl);
    } catch (err: any) {
      console.error('FileUpload error:', err);
      setError(err.message || 'Error al subir el archivo');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadedUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear();
  };

  const isImage = file?.type.startsWith('image/');

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500 flex justify-between">
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
        {uploadedUrl && <span className="text-emerald-600 font-bold">✓ Cargado</span>}
      </label>

      <div 
        className={`relative group transition-all rounded-xl border-2 border-dashed ${
          uploadedUrl 
            ? 'border-emerald-500/50 bg-emerald-500/5' 
            : error 
              ? 'border-red-500/50 bg-red-500/5'
              : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5'
        }`}
      >
        {!file && !uploadedUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-4 px-5 py-4 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Upload size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white/90">Seleccionar archivo</span>
              <span className="text-[10px] text-white/40 uppercase tracking-tighter">PDF, JPG, PNG (Max 5MB)</span>
            </div>
          </button>
        ) : (
          <div className="w-full flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              {uploading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isImage ? (
                <ImageIcon size={20} />
              ) : (
                <FileText size={20} />
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-bold text-white truncate">
                {file?.name || 'Archivo cargado'}
              </span>
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                {uploading ? 'Subiendo...' : 'Completado'}
              </span>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-red-400 px-1">
          <AlertCircle size={12} />
          <span className="text-[10px] font-bold uppercase tracking-tight">{error}</span>
        </div>
      )}
    </div>
  );
}
