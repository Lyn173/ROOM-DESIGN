import React, { useState, useRef } from 'react';
import { Upload, Video, Sparkles, Loader2, Play, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateViralIntro } from './services/geminiService';

interface VideoFile {
  file: File;
  preview: string;
  base64: string;
}

export default function App() {
  const [sampleVideo, setSampleVideo] = useState<VideoFile | null>(null);
  const [targetVideo, setTargetVideo] = useState<VideoFile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'sample' | 'target') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Vui lòng tải lên tệp video.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const videoFile = {
        file,
        preview: URL.createObjectURL(file),
        base64,
      };
      if (type === 'sample') setSampleVideo(videoFile);
      else setTargetVideo(videoFile);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!sampleVideo || !targetVideo) {
      setError('Vui lòng tải lên cả video mẫu và video phòng mới.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const intro = await generateViralIntro(
        sampleVideo.base64,
        targetVideo.base64,
        sampleVideo.file.type
      );
      setResult(intro || "Không thể tạo kịch bản. Vui lòng thử lại.");
    } catch (err) {
      setError('Đã xảy ra lỗi khi xử lý video. Vui lòng kiểm tra lại kết nối hoặc dung lượng video.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setSampleVideo(null);
    setTargetVideo(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Viral Room Intro AI</h1>
          </div>
          <button 
            onClick={reset}
            className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors flex items-center gap-1"
          >
            <RefreshCcw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Uploads */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">01</div>
                <h2 className="text-lg font-semibold">Video mẫu (Style Reference)</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">Tải lên video có phong cách nói chuyện bạn muốn bắt chước.</p>
              
              <div 
                onClick={() => sampleInputRef.current?.click()}
                className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3
                  ${sampleVideo ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200 hover:border-orange-400 hover:bg-gray-50'}`}
              >
                <input 
                  type="file" 
                  ref={sampleInputRef} 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'sample')}
                />
                {sampleVideo ? (
                  <video src={sampleVideo.preview} className="w-full h-full object-cover" controls />
                ) : (
                  <>
                    <div className="p-4 bg-white rounded-full shadow-sm">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Chọn video mẫu</span>
                  </>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">02</div>
                <h2 className="text-lg font-semibold">Video phòng mới (Target Room)</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">Tải lên video quay căn phòng bạn muốn viết kịch bản giới thiệu.</p>
              
              <div 
                onClick={() => targetInputRef.current?.click()}
                className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3
                  ${targetVideo ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200 hover:border-orange-400 hover:bg-gray-50'}`}
              >
                <input 
                  type="file" 
                  ref={targetInputRef} 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'target')}
                />
                {targetVideo ? (
                  <video src={targetVideo.preview} className="w-full h-full object-cover" controls />
                ) : (
                  <>
                    <div className="p-4 bg-white rounded-full shadow-sm">
                      <Video className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Chọn video phòng mới</span>
                  </>
                )}
              </div>
            </section>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !sampleVideo || !targetVideo}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                ${isGenerating || !sampleVideo || !targetVideo 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98]'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Đang phân tích & tạo kịch bản...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Tạo kịch bản Viral ngay
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Right Column: Result */}
          <div className="relative">
            <div className="sticky top-32">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">03</div>
                <h2 className="text-lg font-semibold">Kịch bản gợi ý</h2>
              </div>

              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="prose prose-orange max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg italic font-medium">
                        "{result}"
                      </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">TikTok Script Ready</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(result)}
                        className="text-sm font-bold text-orange-500 hover:underline"
                      >
                        Sao chép kịch bản
                      </button>
                    </div>
                  </motion.div>
                ) : isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="aspect-[3/4] bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-4 text-center p-12"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                      <Sparkles className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Đang "phù phép" kịch bản...</h3>
                      <p className="text-sm text-gray-500">AI đang phân tích phong cách và đặc điểm căn phòng của bạn.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="aspect-[3/4] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 text-center p-12"
                  >
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                      <Play className="w-8 h-8 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-400 mb-1">Chưa có kịch bản</h3>
                      <p className="text-sm text-gray-400">Tải video lên và nhấn nút tạo để bắt đầu.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100 mt-12 text-center text-gray-400 text-sm">
        <p>© 2026 Viral Room Intro AI • Powered by Gemini 3.1 Flash</p>
      </footer>
    </div>
  );
}
