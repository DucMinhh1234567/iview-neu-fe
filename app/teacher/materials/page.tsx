'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TeacherFooter from '@/components/TeacherFooter';
import { api } from '@/lib/api';
import { getUserInfo } from '@/lib/auth';

interface Material {
  material_id: number;
  title: string;
  description?: string;
  is_public: boolean;
  uploaded_by: number;
  created_at: string;
  file_url?: string;
  num_chunks?: number;
}

export default function MaterialsPage() {
  const router = useRouter();
  const uploadFormRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [materialName, setMaterialName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await api.getMaterials();
      setMaterials(data || []);
    } catch (err) {
      console.error('Failed to load materials:', err);
      setError('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showForm) {
      uploadFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !materialName) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setUploadLoading(true);
    setError('');
    setSuccess(false);
    setUploading(true);

    try {
      const result = await api.uploadMaterial({
        file: file,
        title: materialName,
        description: description,
        isPublic: visibility === 'public'
      });

      setSuccess(true);
      setFile(null);
      setMaterialName('');
      setDescription('');
      setVisibility('public');
      
      // Reload materials list
      await loadMaterials();
      
      setTimeout(() => {
        setSuccess(false);
        setUploading(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi upload tài liệu');
      setUploading(false);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (materialId: number) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      await api.deleteMaterial(materialId);
      // Reload materials list
      await loadMaterials();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể xóa tài liệu');
      setTimeout(() => setError(''), 5000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const isMyMaterial = (material: Material) => {
    if (typeof window === 'undefined') return false;
    const userInfo = getUserInfo();
    if (!userInfo.userId) return false;
    return material.uploaded_by === parseInt(userInfo.userId);
  };

  // Filter materials: show public materials and my materials
  const filteredMaterials = materials.filter((material) => {
    return material.is_public || isMyMaterial(material);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-5 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#0065ca] mb-2">Tài Liệu</h1>
            <p className="text-[#5f6368]">Quản lý và upload tài liệu PDF cho sinh viên sử dụng</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="px-6 py-2.5 bg-[#0065ca] text-white font-semibold hover:bg-[#005bb5] transition-colors"
          >
            {showForm ? 'Đóng' : 'Thêm tài liệu'}
          </button>
        </div>

        {/* Upload Form (hidden until toggled) */}
        {showForm && (
          <div ref={uploadFormRef} className="bg-white shadow-sm p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#202124] mb-6">Upload Tài Liệu Mới</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3">
                Upload tài liệu thành công!
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#202124] mb-3">
                Tên tài liệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="Ví dụ: Giáo trình Kinh tế vi mô - GS. Nguyễn Văn A"
                required
                className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#202124] mb-3">
                Mô tả (Tùy chọn)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả về tài liệu..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#202124] mb-3">
                File PDF <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              />
              <p className="text-xs text-[#5f6368] mt-1">Chỉ chấp nhận file PDF</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#202124] mb-3">
                Quyền truy cập <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center p-3 border border-gray-200 hover:border-[#0065ca] cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) => setVisibility(e.target.value as 'public')}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium block">Public</span>
                    <span className="text-xs text-[#5f6368]">Sinh viên và tất cả người dùng đều thấy</span>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 hover:border-[#0065ca] cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) => setVisibility(e.target.value as 'private')}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium block">Private</span>
                    <span className="text-xs text-[#5f6368]">Chỉ giảng viên mới thấy</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={uploadLoading || uploading}
                className="flex-1 px-6 py-2.5 bg-[#0065ca] text-white font-semibold hover:bg-[#005bb5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Đang upload...' : uploadLoading ? 'Đang xử lý...' : 'Upload Tài Liệu'}
              </button>
            </div>
          </form>
          </div>
        )}

        {/* List of materials (cards) */}
        <div className="">
          <h2 className="text-xl font-semibold text-[#202124] mb-6">Tài Liệu Đã Upload</h2>

          {loading ? (
            <div className="text-center py-8 bg-white shadow-sm p-8">
              <div className="w-12 h-12 border-4 border-[#0065ca] border-t-transparent animate-spin mx-auto mb-4"></div>
              <p className="text-[#5f6368]">Đang tải dữ liệu...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="bg-white shadow-sm p-8">
              <p className="text-[#5f6368] text-center py-8">Chưa có tài liệu nào được upload</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div key={material.material_id} className="bg-white border border-gray-200 rounded-none p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-[#202124]">{material.title}</h3>
                      </div>
                      {material.description && (
                        <p className="text-sm text-[#5f6368] mb-3">{material.description}</p>
                      )}
                      <p className="text-xs text-[#5f6368]">Upload ngày: {formatDate(material.created_at)}{material.num_chunks && ` • ${material.num_chunks} chunks`}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    {material.file_url ? (
                      <span className="text-sm text-[#5f6368]">Đã upload file</span>
                    ) : (
                      <span className="text-sm text-[#888]">Chưa có file</span>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium ${material.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{material.is_public ? 'Public' : 'Private'}</span>
                      {isMyMaterial(material) && <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">Của tôi</span>}
                      {isMyMaterial(material) && (
                        <button onClick={() => handleDelete(material.material_id)} className="px-3 py-1 text-red-600 border border-red-300 hover:bg-red-50 transition-colors text-sm rounded-none">
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <TeacherFooter />
    </div>
  );
}

