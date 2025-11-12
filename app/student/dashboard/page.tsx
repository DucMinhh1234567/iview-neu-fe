'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { api } from '@/lib/api';
import { getUserInfo } from '@/lib/auth';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function StudentDashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentInfo, setStudentInfo] = useState({
    fullName: '',
    studentId: '',
    className: '',
    course: '',
    email: ''
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalExam: 0,
    totalInterview: 0,
    totalPractice: 0,
    sessionsByDay: {} as Record<string, number>
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Get user ID from sessionStorage
        const userInfo = getUserInfo();
        const userId = userInfo.userId;
        if (!userId) {
          setError('User ID not found. Please login again.');
          setLoading(false);
          return;
        }

        const studentId = parseInt(userId);
        if (isNaN(studentId)) {
          setError('Invalid user ID');
          setLoading(false);
          return;
        }

        // Load dashboard data from backend
        const dashboardData = await api.getStudentDashboard(studentId);
        
        // Set student info
        if (dashboardData.user) {
          setStudentInfo({
            fullName: dashboardData.user.full_name || userInfo.userName || '',
            studentId: dashboardData.user.student_code || userInfo.studentCode || '',
            className: dashboardData.user.class_name || '',
            course: dashboardData.user.course_year?.toString() || '',
            email: dashboardData.user.email || userInfo.userEmail || ''
          });
        }

        // Transform recent sessions to match expected format
        const transformedItems = (dashboardData.recent_sessions || []).map((session: any) => ({
          id: session.student_session_id?.toString() || '',
          filename: session.student_session_id?.toString() || '',
          summary: {
            type: session.session_type === 'EXAM' || session.session_type === 'PRACTICE' ? 'academic' : 'job',
            title: session.session_name || '',
            overall_score: session.score_total,
            average_overall_score: session.score_total,
            interview_date: session.join_time || new Date().toISOString()
          },
          modified: session.join_time ? new Date(session.join_time).getTime() : Date.now()
        }));

        setItems(transformedItems);
        
        // Store statistics for charts
        setStats({
          totalSessions: dashboardData.statistics?.total_sessions || 0,
          averageScore: dashboardData.statistics?.average_score || 0,
          totalExam: dashboardData.statistics?.total_exam_sessions || 0,
          totalInterview: dashboardData.statistics?.total_interview_sessions || 0,
          totalPractice: dashboardData.statistics?.total_practice_sessions || 0,
          sessionsByDay: dashboardData.sessions_by_day || {}
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Use stats from backend
  const totalSessions = stats.totalSessions;
  const avgScore = stats.averageScore > 0 ? stats.averageScore.toFixed(1) : 'N/A';
  const countAcademic = stats.totalExam + stats.totalPractice;
  const countJob = stats.totalInterview;

  // Build daily counts for last 7 days from backend data
  const days: string[] = [];
  const academicCounts: number[] = [];
  const jobCounts: number[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    days.push(label);
    
    // Get count from backend sessions_by_day (backend returns count for all session types)
    const dayCount = stats.sessionsByDay[key] || 0;
    // For now, we'll use the same count for both (backend doesn't separate by type in sessions_by_day)
    // In a real implementation, backend should provide separate counts
    academicCounts.push(0); // Will be updated if backend provides this
    jobCounts.push(0); // Will be updated if backend provides this
  }
  
  // Use items to calculate daily counts if sessions_by_day is not available
  if (Object.keys(stats.sessionsByDay).length === 0 && items.length > 0) {
    const dayKeyToCounts = new Map<string, { academic: number; job: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayKeyToCounts.set(key, { academic: 0, job: 0 });
    }
    
    items.forEach((it) => {
      const joinTime = it.summary?.interview_date || it.modified;
      if (joinTime) {
        const d = new Date(joinTime);
        const key = d.toISOString().slice(0, 10);
        if (dayKeyToCounts.has(key)) {
          const type = (it.summary?.type || 'job') as 'academic' | 'job';
          const obj = dayKeyToCounts.get(key)!;
          obj[type] += 1;
        }
      }
    });
    
    academicCounts.splice(0, academicCounts.length, ...Array.from(dayKeyToCounts.values()).map((v) => v.academic));
    jobCounts.splice(0, jobCounts.length, ...Array.from(dayKeyToCounts.values()).map((v) => v.job));
  }

  const pieData = {
    labels: ['Thi vấn đáp', 'Phỏng vấn việc làm'],
    datasets: [{ data: [countAcademic, countJob], backgroundColor: ['#6fb6ff', '#005bb5'], borderColor: '#fff', borderWidth: 1 }],
  };

  const barData = {
    labels: days,
    datasets: [
      { label: 'Thi vấn đáp', data: academicCounts, backgroundColor: '#9fd3ff' },
      { label: 'Phỏng vấn việc làm', data: jobCounts, backgroundColor: '#0065ca' },
    ],
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0065ca] mb-2">Tài Khoản Sinh Viên</h1>
          <p className="text-[#5f6368]">Thông tin tài khoản và theo dõi tiến bộ luyện tập của bạn</p>
        </div>

        {/* Student Account Info */}
        <section className="bg-white shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#202124] mb-6">Thông tin tài khoản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#5f6368] mb-2">Họ và tên</label>
              <div className="text-lg font-semibold text-[#202124]">{studentInfo.fullName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5f6368] mb-2">Mã sinh viên</label>
              <div className="text-lg font-semibold text-[#202124]">{studentInfo.studentId}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5f6368] mb-2">Lớp</label>
              <div className="text-lg font-semibold text-[#202124]">{studentInfo.className}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5f6368] mb-2">Khóa</label>
              <div className="text-lg font-semibold text-[#202124]">{studentInfo.course}</div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#5f6368] mb-2">Email</label>
              <div className="text-lg font-semibold text-[#202124]">{studentInfo.email}</div>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6  shadow-sm flex items-center gap-4">
            <div className="text-4xl">📁</div>
            <div>
              <div className="text-3xl font-bold">{totalSessions}</div>
              <div className="text-sm text-gray-600">Tổng số buổi</div>
            </div>
          </div>

          <div className="bg-white p-6  shadow-sm flex items-center gap-4">
            <div className="text-4xl">⭐</div>
            <div>
              <div className="text-3xl font-bold">{avgScore === 'N/A' ? 'N/A' : `${avgScore} / 10`}</div>
              <div className="text-sm text-gray-600">Điểm trung bình</div>
            </div>
          </div>

          <div className="bg-white p-6  shadow-sm flex items-center gap-4">
            <div className="text-4xl">🎓</div>
            <div>
              <div className="text-3xl font-bold">{countAcademic}</div>
              <div className="text-sm text-gray-600">Thi vấn đáp</div>
            </div>
          </div>

          <div className="bg-white p-6  shadow-sm flex items-center gap-4">
            <div className="text-4xl">💼</div>
            <div>
              <div className="text-3xl font-bold">{countJob}</div>
              <div className="text-sm text-gray-600">Phỏng vấn việc làm</div>
            </div>
          </div>
        </section>

        {/* Charts */}
        {!loading && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6  shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Tỷ lệ Thi vấn đáp vs Phỏng vấn việc làm</h3>
              <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            </div>
            <div className="bg-white p-6  shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Số buổi theo ngày (7 ngày gần nhất)</h3>
              <Bar data={barData} options={{ plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
            </div>
          </section>
        )}

        {/* Recent sessions */}
        <section className="recent-row">
          <h3 className="text-lg font-semibold mb-4">5 phiên gần đây</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 rounded">
              {error}
            </div>
          )}
          <div className="bg-white shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phiên</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      Chưa có phiên nào
                    </td>
                  </tr>
                ) : (
                  items.slice(0, 5).map((it, idx) => {
                    const s = it.summary || {};
                    const title = s?.title || s?.candidate_name || it.filename || `Session ${it.id}`;
                    const time = s?.interview_date 
                      ? new Date(s.interview_date).toLocaleString('vi-VN')
                      : (it.modified ? new Date(it.modified).toLocaleString('vi-VN') : '-');
                    const avg = s?.average_overall_score ?? s?.overall_score ?? '-';
                    return (
                      <tr key={idx}>
                        <td className="px-6 py-4 text-sm">{title}</td>
                        <td className="px-6 py-4 text-sm">{time}</td>
                        <td className="px-6 py-4 text-sm">{typeof avg === 'number' ? `${avg.toFixed(1)} / 10` : avg}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

