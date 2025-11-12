'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

interface Question {
  question_id: number;
  question: string;
  question_number?: number;
  total_questions?: number;
  difficulty?: string;
}

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentSessionIdParam = searchParams.get('student_session_id');
  
  const [studentSessionId, setStudentSessionId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!studentSessionIdParam) {
      router.push('/select-role');
      return;
    }

    const id = parseInt(studentSessionIdParam);
    if (isNaN(id)) {
      setError('Invalid session ID');
      setLoading(false);
      return;
    }

    setStudentSessionId(id);
    loadNextQuestion(id);
  }, [studentSessionIdParam, router]);

  const loadNextQuestion = async (sessionId: number) => {
    try {
      setLoading(true);
      setError('');
      const result = await api.getNextQuestion(sessionId);
      
      if (result.completed || !result.question_id) {
        setCompleted(true);
        setLoading(false);
        return;
      }

      // Transform response to match our Question interface
      const question: Question = {
        question_id: result.question_id,
        question: result.question || result.text || '',
        question_number: result.question_number,
        total_questions: result.total_questions,
        difficulty: result.difficulty
      };

      setCurrentQuestion(question);
      setQuestionNumber(result.question_number || 0);
      setTotalQuestions(result.total_questions || 0);
      setCurrentAnswer(''); // Clear answer for new question
      setLoading(false);
    } catch (err) {
      console.error('Failed to load question:', err);
      setError('Không thể tải câu hỏi: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setLoading(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
  };

  const handleNext = async () => {
    if (!studentSessionId || !currentQuestion || !currentAnswer.trim()) {
      alert('Vui lòng nhập câu trả lời trước khi chuyển sang câu hỏi tiếp theo');
      return;
    }

    setSubmittingAnswer(true);
    try {
      // Submit current answer
      await api.submitAnswer(
        studentSessionId,
        currentQuestion.question_id,
        currentAnswer
      );

      // Load next question
      await loadNextQuestion(studentSessionId);
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Có lỗi xảy ra khi nộp câu trả lời: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSubmit = async () => {
    if (!studentSessionId) {
      alert('Không tìm thấy session ID');
      return;
    }

    // If we have a current question and answer, submit it first
    if (currentQuestion && currentAnswer.trim()) {
      setSubmitting(true);
      try {
        // Submit final answer (if not already submitted)
        await api.submitAnswer(
          studentSessionId,
          currentQuestion.question_id,
          currentAnswer
        );
      } catch (err) {
        console.error('Failed to submit final answer:', err);
        // Continue anyway - answer might already be submitted
      } finally {
        setSubmitting(false);
      }
    }

    // Show evaluating state
    setEvaluating(true);

    try {
      // End session - this will evaluate all answers
      const result = await api.endSession(studentSessionId);

      // Check if there were warnings or errors but still succeeded
      if (result.warnings && result.warnings.length > 0) {
        console.warn('Evaluation completed with warnings:', result.warnings);
      }
      
      if (result.warning) {
        console.warn('Evaluation warning:', result.warning);
      }
      
      if (result.error) {
        console.warn('Evaluation completed with error:', result.error);
        // Still redirect - partial results are available
      }

      // Always redirect to results page (even if there were warnings/errors)
      // Backend now returns 200 even on partial success
      router.push(`/student/results/${studentSessionId}`);
    } catch (err) {
      console.error('Failed to end session:', err);
      
      // Check if results are already available in database
      // Even if request failed, backend might have completed evaluation
      try {
        const sessionData = await api.getStudentSession(studentSessionId);
        
        // If session has score_total, evaluation is complete
        if (sessionData.score_total !== null && sessionData.score_total !== undefined) {
          console.log('Results found in database, redirecting to results page');
          router.push(`/student/results/${studentSessionId}`);
          return;
        }
      } catch (checkErr) {
        console.warn('Failed to check session results:', checkErr);
        // Continue to error handling below
      }
      
      setEvaluating(false);
      
      // Extract error message
      let errorMessage = 'Có lỗi xảy ra khi chấm điểm';
      let shouldRedirect = false;
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for timeout or connection errors - still redirect to results
        // Backend might have completed evaluation even if request timed out
        if (errorMessage.includes('mất quá nhiều thời gian') || 
            errorMessage.includes('Kết nối bị ngắt') ||
            errorMessage.includes('ECONNRESET') ||
            errorMessage.includes('socket hang up')) {
          // System might still be processing or already completed
          // Always redirect to results page to check
          shouldRedirect = true;
          errorMessage = 'Kết nối bị ngắt. Bạn sẽ được chuyển đến trang kết quả để kiểm tra.';
        } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          // Network error - still try to redirect to check results
          shouldRedirect = true;
          errorMessage = 'Lỗi kết nối. Bạn sẽ được chuyển đến trang kết quả để kiểm tra.';
        } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
          // Server error - might have partial results, still redirect
          shouldRedirect = true;
          errorMessage = 'Lỗi máy chủ. Bạn sẽ được chuyển đến trang kết quả để kiểm tra.';
        }
      }
      
      // Always redirect to results page - user can see if evaluation completed
      if (shouldRedirect) {
        alert(errorMessage);
        router.push(`/student/results/${studentSessionId}`);
      } else {
        // Even for other errors, redirect to results page
        // Results might be available even if request failed
        alert(errorMessage + ' Bạn sẽ được chuyển đến trang kết quả để kiểm tra.');
        router.push(`/student/results/${studentSessionId}`);
      }
    }
  };

  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải câu hỏi...</div>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-lg p-12 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-4 text-[#0065ca]">Đang chấm điểm</h2>
          <p className="text-gray-600 mb-2">Hệ thống đang chấm điểm tất cả câu trả lời của bạn.</p>
          <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto px-5 py-10">
          <div className="bg-white shadow-sm p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Đã hoàn thành tất cả câu hỏi</h2>
            <p className="text-gray-600 mb-6">Bạn đã trả lời hết các câu hỏi trong buổi phỏng vấn này.</p>
            <button
              onClick={handleSubmit}
              disabled={submitting || evaluating}
              className="px-6 py-3 bg-[#0065ca] text-white font-semibold hover:bg-[#004a95] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : evaluating ? 'Đang chấm điểm...' : 'Kết thúc buổi phỏng vấn'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error || 'Không có câu hỏi'}</div>
      </div>
    );
  }

  const isLastQuestion = totalQuestions > 0 && questionNumber === totalQuestions;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-5 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Question Progress */}
        <div className="bg-white shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              Câu hỏi {questionNumber} / {totalQuestions}
            </span>
            {currentQuestion.difficulty && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                Độ khó: {currentQuestion.difficulty}
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 h-2">
            <div 
              className="bg-[#0065ca] h-2 transition-all"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white shadow-sm p-8 mb-6">
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#0065ca] bg-[#eef4ff] px-2 py-1">
              Câu hỏi
            </span>
          </div>
          <h3 className="text-2xl font-semibold mb-6">{currentQuestion.question}</h3>
          
          <div>
            <label className="block font-medium mb-2">Câu trả lời của bạn:</label>
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              placeholder="Nhập câu trả lời của bạn ở đây..."
              disabled={submittingAnswer || submitting}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end">
          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!currentAnswer.trim() || submitting || submittingAnswer}
              className="px-6 py-3 bg-[#0065ca] text-white hover:bg-[#004a95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang nộp...' : 'Hoàn thành phỏng vấn'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!currentAnswer.trim() || submittingAnswer || submitting}
              className="px-6 py-3 bg-[#0065ca] text-white hover:bg-[#004a95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingAnswer ? 'Đang lưu...' : 'Câu tiếp →'}
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent animate-spin mx-auto mb-4"></div>
            <div className="text-xl">Đang tải...</div>
          </div>
        </div>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}

