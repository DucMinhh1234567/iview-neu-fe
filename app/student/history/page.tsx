'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const [items, setItems] = useState<Array<{ 
    log_file: string; 
    result_file?: string | null; 
    status: 'pending' | 'done'; 
    summary?: any;
    session_type?: string;
    candidate_name?: string;
    session_name?: string;
    course_name?: string;
    score_total?: number;
    id?: string;
  }>>([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getHistory();
        // Backend returns: [{ student_session_id, session_id, session_name, session_type, course_name, score_total, join_time }]
        // Transform to match expected format
        const transformed = (data || []).map((item: any) => ({
          id: item.student_session_id?.toString() || '',
          log_file: item.student_session_id?.toString() || '',
          result_file: item.student_session_id?.toString() || null,
          status: item.score_total !== null && item.score_total !== undefined ? 'done' : 'pending',
          candidate_name: item.session_name || '',
          created_at: item.join_time || '',
          session_type: item.session_type || '',
          course_name: item.course_name || '',
          score_total: item.score_total,
          summary: {
            type: item.session_type === 'EXAM' || item.session_type === 'PRACTICE' ? 'academic' : 'job',
            overall_score: item.score_total,
            overall_feedback: item.ai_overall_feedback || ''
          }
        }));
        setItems(transformed);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = items.filter(it => {
    const s = it.summary || {};
    const type = s?.type || (it.session_type === 'EXAM' || it.session_type === 'PRACTICE' ? 'academic' : 'job');
    return filterType === 'all' || filterType === type;
  });

  // Pick the most recent completed session with overall_feedback to show at top
  const topSummary = items.find(it => (it.status === 'done') && (it.summary && it.summary.overall_feedback));
  const feedback = topSummary?.summary?.overall_feedback as (undefined | string | {
    overall_score?: number;
    strengths?: string;
    weaknesses?: string;
    hiring_recommendation?: string;
  });

  const handleView = (it: any) => {
    if (it.status === 'done' && it.result_file) {
      // Go to pretty result page using student_session_id
      router.push(`/student/results/${encodeURIComponent(it.result_file)}`);
    } else {
      // For pending sessions, still redirect to results (backend doesn't have async processing)
      router.push(`/student/results/${encodeURIComponent(it.log_file)}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="max-w-6xl mx-auto px-5 py-10">
        <h2 className="text-3xl font-semibold mb-8">Lịch Sử Các Buổi Phỏng Vấn</h2>

        <div className="mb-6 flex items-center gap-4">
          <label htmlFor="filter-type" className="font-medium">Lọc theo loại:</label>
          <div className="w-64">
            <CustomSelect
              id="filter-type"
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'academic', label: 'Thi vấn đáp' },
                { value: 'job', label: 'Phỏng vấn việc làm' }
              ]}
              placeholder="-- Chọn loại --"
            />
          </div>
        </div>

        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white  shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phiên</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((it, idx) => {
                  const title = it.candidate_name || it.session_name || `Session ${it.id}`;
                  const statusText = it.status === 'done' ? 'Đã chấm' : 'Đang xử lý...';
                  const scoreText = it.score_total !== null && it.score_total !== undefined 
                    ? `Điểm: ${it.score_total.toFixed(1)}` 
                    : '';
                  return (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm">
                        <div>{title}</div>
                        {it.course_name && (
                          <div className="text-xs text-gray-500">{it.course_name}</div>
                        )}
                        {scoreText && (
                          <div className="text-xs text-[#0065ca] font-medium">{scoreText}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{statusText}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-[#0065ca] hover:underline" onClick={() => handleView(it)}>
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

