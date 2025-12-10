'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TeacherFooter from '@/components/TeacherFooter';
import Link from 'next/link';
import CustomSelect from '@/components/CustomSelect';
import { api } from '@/lib/api';

interface Session {
  session_id: number;
  session_name: string;
  session_type: string;
  course_name?: string;
  status: string;
  password?: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  student_count?: number;
  difficulty_level?: string;
  material_id?: number;
  opening_script?: string;
  closing_script?: string;
  questions_count?: number;
}

interface Student {
  student_session_id: number;
  student_id: number;
  student_name: string;
  student_code: string;
  score_total?: number;
  join_time: string;
  reviewed_by?: number;
  reviewed_at?: string;
}

interface Question {
  question_id: number;
  session_id: number;
  content: string;
  keywords?: string;
  question_type?: string;
  status: string;
  reference_answer?: string;
  created_at?: string;
}

// Question Edit Form Component
function QuestionEditForm({ 
  question, 
  onSave, 
  onCancel 
}: { 
  question: Question; 
  onSave: (data: { content?: string; keywords?: string; question_type?: string }) => void; 
  onCancel: () => void;
}) {
  const [content, setContent] = useState(question.content);
  const [keywords, setKeywords] = useState(question.keywords || '');
  const [questionType, setQuestionType] = useState(question.question_type || '');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#5f6368] mb-2">Nội dung câu hỏi</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#5f6368] mb-2">Keywords</label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#5f6368] mb-2">Loại câu hỏi / Bloom level</label>
        <input
          type="text"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          placeholder="VD: REMEMBER, APPLY, behavioral, technical..."
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ content, keywords, question_type: questionType })}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Lưu
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

// Answer Edit Form Component
function AnswerEditForm({ 
  answer, 
  onSave, 
  onCancel 
}: { 
  answer: string; 
  onSave: (answer: string) => void; 
  onCancel: () => void;
}) {
  const [answerText, setAnswerText] = useState(answer);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#5f6368] mb-2">Đáp án tham khảo</label>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(answerText)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Lưu
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

export default function ExamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id ? parseInt(params.id as string) : null;
  
  const [session, setSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'students'>('overview');
  
  // Workflow states
  const [generating, setGenerating] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<number | null>(null);
  const [numQuestions, setNumQuestions] = useState(8);

  useEffect(() => {
    if (sessionId) {
      loadSessionDetail();
      loadStudents();
      loadQuestions();
    }
  }, [sessionId]);


  const loadSessionDetail = async () => {
    if (!sessionId) {
      setError('Session ID không hợp lệ');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const data = await api.getSession(sessionId);
      if (!data || !data.session_id) {
        throw new Error('Không tìm thấy thông tin buổi thi');
      }
      setSession(data);
    } catch (err) {
      console.error('Failed to load session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông tin buổi thi';
      
      // More specific error messages
      if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('Resource not found')) {
        setError('Không tìm thấy buổi thi. Vui lòng kiểm tra lại session ID.');
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError('Bạn không có quyền truy cập buổi thi này. Vui lòng đăng nhập lại.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('Bạn không có quyền xem buổi thi này.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!sessionId) return;
    
    try {
      const data = await api.getSessionStudents(sessionId);
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      // Don't show error for students, just log it
    }
  };

  const loadQuestions = async () => {
    if (!sessionId) return;
    
    try {
      setLoadingQuestions(true);
      const data = await api.getQuestions(sessionId);
      setQuestions(data || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Workflow functions
  const handleGenerateQuestions = async () => {
    if (!sessionId) return;
    
    try {
      setGenerating(true);
      setError('');
      await api.generateQuestions(sessionId, numQuestions);
      await loadSessionDetail();
      await loadQuestions();
    } catch (err) {
      console.error('Failed to generate questions:', err);
      setError(err instanceof Error ? err.message : 'Không thể tạo câu hỏi');
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveQuestions = async () => {
    if (!sessionId) return;
    
    try {
      setGenerating(true);
      setError('');
      const questionIds = selectedQuestions.length > 0 ? selectedQuestions : undefined;
      await api.approveQuestions(sessionId, questionIds);
      setSelectedQuestions([]);
      await loadSessionDetail();
      await loadQuestions();
      // Note: Backend automatically changes status to "generating_answers"
      // User needs to manually generate answers
    } catch (err) {
      console.error('Failed to approve questions:', err);
      setError(err instanceof Error ? err.message : 'Không thể duyệt câu hỏi');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAnswers = async () => {
    if (!sessionId) return;
    
    try {
      setGenerating(true);
      setError('');
      await api.generateAnswers(sessionId);
      await loadSessionDetail();
      await loadQuestions();
    } catch (err) {
      console.error('Failed to generate answers:', err);
      setError(err instanceof Error ? err.message : 'Không thể tạo đáp án');
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveAnswers = async () => {
    if (!sessionId) return;
    
    try {
      setGenerating(true);
      setError('');
      const questionIds = selectedQuestions.length > 0 ? selectedQuestions : undefined;
      await api.approveAnswers(sessionId, questionIds);
      setSelectedQuestions([]);
      await loadSessionDetail();
      await loadQuestions();
      // Note: Backend automatically changes status to "ready" if all answers are approved
    } catch (err) {
      console.error('Failed to approve answers:', err);
      setError(err instanceof Error ? err.message : 'Không thể duyệt đáp án');
    } finally {
      setGenerating(false);
    }
  };



  const handleUpdateQuestion = async (questionId: number, data: { content?: string; keywords?: string; question_type?: string }) => {
    try {
      await api.updateQuestion(questionId, data);
      setEditingQuestion(null);
      await loadQuestions();
    } catch (err) {
      console.error('Failed to update question:', err);
      setError(err instanceof Error ? err.message : 'Không thể cập nhật câu hỏi');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      return;
    }
    
    try {
      await api.deleteQuestion(questionId);
      await loadQuestions();
      await loadSessionDetail();
    } catch (err) {
      console.error('Failed to delete question:', err);
      setError(err instanceof Error ? err.message : 'Không thể xóa câu hỏi');
    }
  };

  const handleUpdateAnswer = async (questionId: number, referenceAnswer: string) => {
    try {
      await api.updateAnswer(questionId, referenceAnswer);
      setEditingAnswer(null);
      await loadQuestions();
    } catch (err) {
      console.error('Failed to update answer:', err);
      setError(err instanceof Error ? err.message : 'Không thể cập nhật đáp án');
    }
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAllQuestions = () => {
    let questionsToSelect: number[] = [];
    
    if (session?.status === 'reviewing_questions') {
      // Select all draft questions
      questionsToSelect = questions.filter(q => q.status === 'draft').map(q => q.question_id);
    } else if (session?.status === 'reviewing_answers') {
      // Select all questions with answers that need approval
      questionsToSelect = questions.filter(q => q.status === 'answers_generated' && q.reference_answer).map(q => q.question_id);
    }
    
    if (selectedQuestions.length === questionsToSelect.length && 
        questionsToSelect.every(id => selectedQuestions.includes(id))) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questionsToSelect);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      created: { label: 'Đã tạo', color: 'bg-gray-100 text-gray-800' },
      generating_questions: { label: 'Đang tạo câu hỏi', color: 'bg-blue-100 text-blue-800' },
      reviewing_questions: { label: 'Đang xem xét câu hỏi', color: 'bg-yellow-100 text-yellow-800' },
      generating_answers: { label: 'Đang tạo đáp án', color: 'bg-blue-100 text-blue-800' },
      reviewing_answers: { label: 'Đang xem xét đáp án', color: 'bg-yellow-100 text-yellow-800' },
      ready: { label: 'Sẵn sàng', color: 'bg-green-100 text-green-800' },
      active: { label: 'Đang diễn ra', color: 'bg-green-100 text-green-800' },
      ended: { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' },
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 text-xs font-semibold ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
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

  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-5 py-10">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-[#5f6368]">Đang tải thông tin buổi thi...</p>
          </div>
        </main>
        <TeacherFooter />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-5 py-10">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
            {error || 'Không tìm thấy buổi thi'}
          </div>
          <Link
            href="/teacher/exams"
            className="text-[#0065ca] hover:underline"
          >
            ← Quay lại danh sách buổi thi
          </Link>
        </main>
        <TeacherFooter />
      </div>
    );
  }

  const reviewedCount = students.filter(s => s.reviewed_by).length;
  const pendingReviewCount = students.length - reviewedCount;
  const averageScore = students.length > 0
    ? (students.reduce((sum, s) => sum + (s.score_total || 0), 0) / students.length).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/teacher/exams"
            className="text-[#0065ca] hover:underline mb-4 inline-block"
          >
            ← Quay lại danh sách buổi thi
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-[#202124] mb-2">{session.session_name}</h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(session.status)}
                {session.course_name && (
                  <span className="text-[#5f6368] text-sm">{session.course_name}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#0065ca] text-[#0065ca]'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => {
                setActiveTab('questions');
                loadQuestions();
              }}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'questions'
                  ? 'border-[#0065ca] text-[#0065ca]'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              Câu hỏi ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'students'
                  ? 'border-[#0065ca] text-[#0065ca]'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              Sinh viên ({students.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Workflow Progress Indicator */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#202124] mb-4">Tiến trình chuẩn bị buổi thi</h2>
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center ${['created', 'generating_questions', 'reviewing_questions', 'generating_answers', 'reviewing_answers', 'ready'].includes(session.status) ? 'text-[#0065ca]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${session.status !== 'created' ? 'bg-[#0065ca] text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Tạo buổi thi</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${['generating_questions', 'reviewing_questions', 'generating_answers', 'reviewing_answers', 'ready'].includes(session.status) ? 'bg-[#0065ca]' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${['generating_questions', 'reviewing_questions', 'generating_answers', 'reviewing_answers', 'ready'].includes(session.status) ? 'text-[#0065ca]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['reviewing_questions', 'generating_answers', 'reviewing_answers', 'ready'].includes(session.status) ? 'bg-[#0065ca] text-white' : session.status === 'generating_questions' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Tạo câu hỏi</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${['generating_answers', 'reviewing_answers', 'ready'].includes(session.status) ? 'bg-[#0065ca]' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${['generating_answers', 'reviewing_answers', 'ready'].includes(session.status) ? 'text-[#0065ca]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['reviewing_answers', 'ready'].includes(session.status) ? 'bg-[#0065ca] text-white' : session.status === 'generating_answers' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Tạo đáp án</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${session.status === 'ready' ? 'bg-[#0065ca]' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${session.status === 'ready' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${session.status === 'ready' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                    ✓
                  </div>
                  <span className="ml-2 text-sm font-medium">Sẵn sàng</span>
                </div>
              </div>
            </div>

            {/* Workflow Actions */}
            {session.status === 'created' && (
              <div className="bg-blue-50 border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Bước tiếp theo: Tạo câu hỏi</h3>
                <p className="text-blue-800 mb-4">Bạn cần tạo câu hỏi cho buổi thi này. Hãy chuyển sang tab "Câu hỏi" để bắt đầu.</p>
                <button
                  onClick={() => {
                    setActiveTab('questions');
                    loadQuestions();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Đi đến tab Câu hỏi
                </button>
              </div>
            )}

            {session.status === 'ready' && (
              <div className="bg-green-50 border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Buổi thi đã sẵn sàng</h3>
                <p className="text-green-800 mb-4">Bạn đã hoàn thành tất cả các bước. Buổi thi đã sẵn sàng và sinh viên có thể tham gia.</p>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-gray-200 p-6">
                <div className="text-3xl font-bold text-[#0065ca] mb-1">{session.student_count || 0}</div>
                <div className="text-sm text-[#5f6368]">Tổng số sinh viên</div>
              </div>
              <div className="bg-white border border-gray-200 p-6">
                <div className="text-3xl font-bold text-green-600 mb-1">{reviewedCount}</div>
                <div className="text-sm text-[#5f6368]">Đã review</div>
              </div>
              <div className="bg-white border border-gray-200 p-6">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{pendingReviewCount}</div>
                <div className="text-sm text-[#5f6368]">Chờ review</div>
              </div>
              <div className="bg-white border border-gray-200 p-6">
                <div className="text-3xl font-bold text-purple-600 mb-1">{averageScore}</div>
                <div className="text-sm text-[#5f6368]">Điểm trung bình</div>
              </div>
              <div className="bg-white border border-gray-200 p-6">
                <div className="text-3xl font-bold text-orange-600 mb-1">{session.questions_count || 0}</div>
                <div className="text-sm text-[#5f6368]">Số câu hỏi</div>
              </div>
            </div>

            {/* Session Details */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#202124] mb-4">Thông tin buổi thi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#5f6368]">Tên buổi thi</label>
                  <p className="text-[#202124] mt-1">{session.session_name}</p>
                </div>
                {session.course_name && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Môn học</label>
                    <p className="text-[#202124] mt-1">{session.course_name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-[#5f6368]">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(session.status)}</div>
                </div>
                {session.difficulty_level && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Độ khó</label>
                    <p className="text-[#202124] mt-1">{session.difficulty_level}</p>
                  </div>
                )}
                {session.start_time && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Thời gian bắt đầu</label>
                    <p className="text-[#202124] mt-1">{formatDate(session.start_time)}</p>
                  </div>
                )}
                {session.end_time && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Thời gian kết thúc</label>
                    <p className="text-[#202124] mt-1">{formatDate(session.end_time)}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-[#5f6368]">Ngày tạo</label>
                  <p className="text-[#202124] mt-1">{formatDate(session.created_at)}</p>
                </div>
                {session.password && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Mật khẩu</label>
                    <p className="text-[#202124] mt-1 font-mono">{session.password}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Generate Questions Section */}
            {session.status === 'created' && (
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-[#202124] mb-4">Tạo câu hỏi</h2>
                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="w-48">
                      <label className="block text-sm font-medium text-[#5f6368] mb-2">Số lượng câu hỏi</label>
                      <input
                        type="number"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(parseInt(e.target.value) || 8)}
                        min="1"
                        max="50"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                      />
                    </div>
                    <button
                      onClick={handleGenerateQuestions}
                      disabled={generating}
                      className="px-6 py-2 h-[42px] bg-[#0065ca] text-white rounded hover:bg-[#004a95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {generating ? 'Đang tạo...' : 'Tạo câu hỏi'}
                    </button>
                  </div>
                  <p className="text-sm text-[#5f6368]">Hệ thống sẽ tạo câu hỏi dựa trên tài liệu và độ khó đã chọn.</p>
                </div>
              </div>
            )}

            {/* Questions List */}
            {loadingQuestions ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent animate-spin mx-auto mb-4"></div>
                <p className="text-[#5f6368]">Đang tải câu hỏi...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white border border-gray-200 p-12 text-center">
                <p className="text-[#5f6368] mb-4">
                  {session.status === 'created' 
                    ? 'Chưa có câu hỏi nào. Hãy tạo câu hỏi để bắt đầu.' 
                    : 'Chưa có câu hỏi nào.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Action Bar for Questions */}
                {session.status === 'reviewing_questions' && questions.filter(q => q.status === 'draft').length > 0 && (
                  <div className="bg-white border border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={selectAllQuestions}
                        className="text-sm text-[#0065ca] hover:underline"
                      >
                        {selectedQuestions.length === questions.filter(q => q.status === 'draft').length 
                          ? 'Bỏ chọn tất cả' 
                          : 'Chọn tất cả'}
                      </button>
                      <span className="text-sm text-[#5f6368]">
                        Đã chọn: {selectedQuestions.length} / {questions.filter(q => q.status === 'draft').length}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          // Approve all draft questions
                          const draftQuestionIds = questions.filter(q => q.status === 'draft').map(q => q.question_id);
                          setSelectedQuestions(draftQuestionIds);
                          try {
                            setGenerating(true);
                            setError('');
                            await api.approveQuestions(sessionId!, draftQuestionIds);
                            setSelectedQuestions([]);
                            await loadSessionDetail();
                            await loadQuestions();
                          } catch (err) {
                            console.error('Failed to approve questions:', err);
                            setError(err instanceof Error ? err.message : 'Không thể duyệt câu hỏi');
                          } finally {
                            setGenerating(false);
                          }
                        }}
                        disabled={generating}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generating ? 'Đang xử lý...' : 'Duyệt tất cả'}
                      </button>
                      <button
                        onClick={handleApproveQuestions}
                        disabled={generating || selectedQuestions.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generating ? 'Đang xử lý...' : 'Duyệt đã chọn'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Bar for Answers */}
                {session.status === 'reviewing_answers' && questions.filter(q => q.status === 'answers_generated' && q.reference_answer).length > 0 && (
                  <div className="bg-white border border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={selectAllQuestions}
                        className="text-sm text-[#0065ca] hover:underline"
                      >
                        {selectedQuestions.length === questions.filter(q => q.status === 'answers_generated' && q.reference_answer).length 
                          ? 'Bỏ chọn tất cả' 
                          : 'Chọn tất cả'}
                      </button>
                      <span className="text-sm text-[#5f6368]">
                        Đã chọn: {selectedQuestions.length} / {questions.filter(q => q.status === 'answers_generated' && q.reference_answer).length}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          // Approve all answers
                          const answerQuestionIds = questions.filter(q => q.status === 'answers_generated' && q.reference_answer).map(q => q.question_id);
                          setSelectedQuestions(answerQuestionIds);
                          try {
                            setGenerating(true);
                            setError('');
                            await api.approveAnswers(sessionId!, answerQuestionIds);
                            setSelectedQuestions([]);
                            await loadSessionDetail();
                            await loadQuestions();
                          } catch (err) {
                            console.error('Failed to approve answers:', err);
                            setError(err instanceof Error ? err.message : 'Không thể duyệt đáp án');
                          } finally {
                            setGenerating(false);
                          }
                        }}
                        disabled={generating}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generating ? 'Đang xử lý...' : 'Duyệt tất cả'}
                      </button>
                      <button
                        onClick={handleApproveAnswers}
                        disabled={generating || selectedQuestions.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generating ? 'Đang xử lý...' : 'Duyệt đã chọn'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Generate Answers Button */}
                {session.status === 'generating_answers' && (
                  <div className="bg-blue-50 border border-blue-200 p-4">
                    <p className="text-blue-800 mb-2">Đang tạo đáp án tham khảo...</p>
                    <button
                      onClick={handleGenerateAnswers}
                      disabled={generating}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {generating ? 'Đang tạo...' : 'Tạo đáp án'}
                    </button>
                  </div>
                )}

                {/* Questions List */}
                {questions.map((question, index) => (
                  <div key={question.question_id} className="bg-white border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {(session.status === 'reviewing_questions' && question.status === 'draft') ||
                         (session.status === 'reviewing_answers' && (question.status === 'answers_generated' || (question.status === 'approved' && question.reference_answer))) ? (
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.question_id)}
                            onChange={() => toggleQuestionSelection(question.question_id)}
                            className="w-4 h-4"
                          />
                        ) : null}
                        <h3 className="text-lg font-semibold text-[#202124]">
                          Câu hỏi {index + 1}
                        </h3>
                        {question.question_type && (
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-800 rounded">
                            {question.question_type}
                          </span>
                        )}
                      <span className={`px-2 py-1 text-xs font-semibold ${
                        question.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        question.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {question.status === 'draft' ? 'Nháp' :
                         question.status === 'approved' ? 'Đã duyệt' :
                         question.status === 'answers_approved' ? 'Đã duyệt đáp án' : question.status}
                      </span>
                      </div>
                      <div className="flex gap-2">
                        {session.status === 'reviewing_questions' && question.status === 'draft' && (
                          <>
                            <button
                              onClick={() => setEditingQuestion(editingQuestion === question.question_id ? null : question.question_id)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              {editingQuestion === question.question_id ? 'Hủy' : 'Sửa'}
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.question_id)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Question Content */}
                    {editingQuestion === question.question_id ? (
                      <QuestionEditForm
                        question={question}
                        onSave={(data) => {
                          handleUpdateQuestion(question.question_id, data);
                        }}
                        onCancel={() => setEditingQuestion(null)}
                      />
                    ) : (
                      <div className="mb-4">
                        <p className="text-[#202124] whitespace-pre-wrap">{question.content}</p>
                        {question.keywords && (
                          <p className="text-sm text-[#5f6368] mt-2">
                            <strong>Keywords:</strong> {question.keywords}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Reference Answer */}
                    {/* Reference Answer Section - Show for approved questions or questions with answers */}
                    {(session.status === 'reviewing_answers' || session.status === 'ready' || session.status === 'generating_answers') &&
                     (question.status === 'approved' || question.status === 'answers_generated' || question.status === 'answers_approved') && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#202124]">Đáp án tham khảo</h4>
                          {(session.status === 'reviewing_answers' || session.status === 'ready') && (
                            <button
                              onClick={() => setEditingAnswer(editingAnswer === question.question_id ? null : question.question_id)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              {editingAnswer === question.question_id ? 'Hủy' : question.reference_answer ? 'Sửa' : 'Tạo đáp án'}
                            </button>
                          )}
                        </div>
                        {editingAnswer === question.question_id ? (
                          <AnswerEditForm
                            answer={question.reference_answer || ''}
                            onSave={(answer) => {
                              handleUpdateAnswer(question.question_id, answer);
                            }}
                            onCancel={() => setEditingAnswer(null)}
                          />
                        ) : question.reference_answer ? (
                          <div className="p-4 bg-gray-50 border border-gray-200 text-sm text-[#202124] whitespace-pre-wrap">
                            {question.reference_answer}
                          </div>
                        ) : (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 text-sm text-yellow-700">
                            Chưa có đáp án tham khảo. Nhấn nút "Tạo đáp án" để tạo đáp án cho câu hỏi này.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white border border-gray-200 overflow-hidden">
            {students.length === 0 ? (
              <div className="p-12 text-center text-[#5f6368]">
                Chưa có sinh viên nào tham gia buổi thi này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Tên sinh viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Mã sinh viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Thời gian tham gia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student.student_session_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#202124]">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#202124]">
                          {student.student_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5f6368]">
                          {student.student_code || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#202124]">
                          {student.score_total !== null && student.score_total !== undefined
                            ? student.score_total.toFixed(2)
                            : 'Chưa có điểm'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5f6368]">
                          {formatDate(student.join_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.reviewed_by ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
                              Đã review
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
                              Chờ review
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/teacher/review/${student.student_session_id}`}
                            className="text-[#0065ca] hover:underline font-medium"
                          >
                            Review bài thi
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <TeacherFooter />
    </div>
  );
}

