'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function isURL(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

interface FileUploadProps {
  value?: string | null
  onChange: (path: string | undefined) => void
}

export function FileUpload({ value, onChange }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!value) {
      setPreview(null)
      return
    }

    if (isURL(value)) {
      setPreview(value)
      return
    }

    let cancelled = false
    supabase.storage
      .from('receipts')
      .createSignedUrl(value, 3600)
      .then(({ data, error: signErr }) => {
        if (!cancelled && !signErr && data?.signedUrl) {
          setPreview(data.signedUrl)
        }
      })

    return () => {
      cancelled = true
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [value, supabase])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Ukuran file maksimal 5MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau HEIC')
      return
    }

    setError(null)
    setUploading(true)

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${crypto.randomUUID()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('receipts')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadErr) {
      setError(uploadErr.message)
      setUploading(false)
      return
    }

    const { data: signedData } = await supabase.storage
      .from('receipts')
      .createSignedUrl(filename, 3600)

    if (!signedData?.signedUrl) {
      setError('Gagal membuat URL receipt')
      setUploading(false)
      return
    }

    const signedUrl = signedData.signedUrl
    setPreview(signedUrl)
    onChange(filename)
    setUploading(false)
  }

  const removeFile = () => {
    setPreview(null)
    onChange(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFileChange}
        className="file-upload-input"
      />

      {preview ? (
        <div className="file-upload-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Bukti transaksi" className="file-upload-image" />
          <button
            type="button"
            className="file-upload-remove"
            onClick={removeFile}
            title="Hapus foto"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="file-upload-area"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="file-upload-spinner" />
              <span>Mengupload...</span>
            </>
          ) : (
            <>
              <Upload size={20} />
              <span className="file-upload-label">Upload Bukti</span>
              <span className="file-upload-hint">JPG, PNG, WebP, HEIC (max 5MB)</span>
            </>
          )}
        </button>
      )}

      {error && <div className="form-error">{error}</div>}
    </div>
  )
}
