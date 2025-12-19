import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Heart,
  RefreshCcw,
  Smile,
  Star,
  XCircle,
} from 'lucide-react';
import { questions as rawQuestions } from './questions';

const categories = ['すべて', ...new Set(rawQuestions.map((q) => q.category))];

const praiseMessages = [
  'その調子！素晴らしい知識です✨',
  '正解！あなたは社会福祉士の素質十分です🧠',
  'お見事！自信を持って進みましょう。',
  'ピンポン！専門用語もバッチリです。',
  '完璧です！合格が近づいていますよ🌸',
];

const retryMessages = [
  '惜しい！次こそは正解を掴みましょう。',
  '間違いは成長の糧です。復習が大事です📚',
  'どんまい。解説を確認して知識を定着させよう🌱',
  '焦らず一歩ずつ！次はきっと大丈夫です💪',
];

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [filter, setFilter] = useState('すべて');
  const [encouragement, setEncouragement] = useState('');
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

  const filteredQuestions = useMemo(
    () => (filter === 'すべて' ? rawQuestions : rawQuestions.filter((q) => q.category === filter)),
    [filter],
  );

  const currentQuestion = filteredQuestions[currentQuestionIndex] ?? null;
  const isMultiple = currentQuestion?.correct.length > 1;

  useEffect(() => {
    resetQuiz();
  }, [filter]);

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions([]);
    setScore(0);
    setIsFinished(false);
    setShowResult(false);
    setEncouragement('');
    setLastAnswerCorrect(null);
  };

  const handleOptionToggle = (index) => {
    if (showResult || !currentQuestion) return;

    if (isMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
      );
    } else {
      setSelectedOptions([index]);
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion || selectedOptions.length === 0) return;

    const isCorrect =
      selectedOptions.length === currentQuestion.correct.length &&
      selectedOptions.every((val) => currentQuestion.correct.includes(val));

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setEncouragement(praiseMessages[Math.floor(Math.random() * praiseMessages.length)]);
    } else {
      setEncouragement(retryMessages[Math.floor(Math.random() * retryMessages.length)]);
    }

    setLastAnswerCorrect(isCorrect);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptions([]);
      setShowResult(false);
      setEncouragement('');
      setLastAnswerCorrect(null);
    } else {
      setIsFinished(true);
    }
  };

  const getRank = () => {
    const ratio = score / filteredQuestions.length;
    if (ratio === 1) return { title: '社会福祉士マスター', icon: '👑', color: 'text-yellow-500' };
    if (ratio >= 0.8) return { title: 'ベテランソーシャルワーカー', icon: '💎', color: 'text-blue-500' };
    if (ratio >= 0.6) return { title: '合格圏のルーキー', icon: '🌟', color: 'text-green-500' };
    return { title: '社会福祉士の卵', icon: '🥚', color: 'text-gray-500' };
  };

  const accuracy = Math.round((score / filteredQuestions.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
          <div className="flex justify-center mb-2">
            <GraduationCap size={40} className="text-indigo-200" />
          </div>
          <h1 className="text-2xl font-bold">第37回 社会福祉士国家試験</h1>
          <p className="text-indigo-100 opacity-90">令和年度 過去問演習クエスト</p>
        </header>

        {/* Filter & Stats */}
        {!isFinished && (
          <div className="p-4 bg-indigo-50 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">科目:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-indigo-200 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-indigo-700">
              <div className="flex items-center gap-1">
                <BookOpen size={16} />
                <span>
                  {currentQuestionIndex + 1} / {filteredQuestions.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span>正解: {score}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="p-6 md:p-10">
          {!isFinished && currentQuestion ? (
            <div className="space-y-6">
              {/* Question */}
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
                  {currentQuestion.category}
                </div>
                <h2 className="text-lg md:text-xl font-bold leading-relaxed">
                  問題 {currentQuestion.id}: {currentQuestion.question}
                </h2>
                {isMultiple && (
                  <p className="text-rose-500 text-sm font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> ※この問題は正解が複数あります。
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOptions.includes(idx);
                  const isCorrect = currentQuestion.correct.includes(idx);

                  let buttonClass =
                    'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3 ';

                  if (showResult) {
                    if (isCorrect) {
                      buttonClass += 'border-green-500 bg-green-50 text-green-800';
                    } else if (isSelected && !isCorrect) {
                      buttonClass += 'border-rose-500 bg-rose-50 text-rose-800';
                    } else {
                      buttonClass += 'border-slate-100 bg-white opacity-50';
                    }
                  } else {
                    buttonClass += isSelected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-md transform -translate-y-1'
                      : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionToggle(idx)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <span
                        className={`mt-1 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs font-bold ${
                          isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-grow">{option}</span>
                      {showResult && isCorrect && <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />}
                      {showResult && isSelected && !isCorrect && <XCircle className="text-rose-500 flex-shrink-0" size={20} />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Actions */}
              <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                {showResult && encouragement && (
                  <div
                    className={`p-4 rounded-2xl w-full flex items-center gap-3 shadow-sm ${
                      lastAnswerCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {lastAnswerCorrect ? <Smile size={24} /> : <Heart size={24} />}
                    <span className="font-bold">{encouragement}</span>
                  </div>
                )}

                <div className="w-full flex justify-between gap-4">
                  {!showResult ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedOptions.length === 0}
                      className="flex-grow bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                      回答する
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex-grow bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                    >
                      {currentQuestionIndex < filteredQuestions.length - 1 ? '次の問題へ' : '結果を見る'}
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center space-y-8 py-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-full border-4 border-yellow-400 shadow-xl inline-flex items-center justify-center w-32 h-32 text-6xl">
                  {getRank().icon}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-800">お疲れ様でした！</h2>
                <p className="text-slate-500">第37回国家試験 演習クエスト完了</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-6 rounded-3xl">
                  <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">正解数</div>
                  <div className="text-4xl font-black text-indigo-700">
                    {score} <span className="text-xl">問</span>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-3xl">
                  <div className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1">正解率</div>
                  <div className="text-4xl font-black text-purple-700">
                    {accuracy} <span className="text-xl">%</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border-2 border-dashed ${getRank().color.replace('text', 'border')} bg-white`}>
                <p className="text-sm font-bold mb-1 opacity-70">授与された称号:</p>
                <div className={`text-2xl font-black ${getRank().color}`}>{getRank().title}</div>
              </div>

              <button
                onClick={resetQuiz}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCcw size={20} />
                もう一度挑戦する
              </button>
            </div>
          )}
        </main>

        {/* Footer info */}
        {!isFinished && (
          <footer className="px-6 py-4 bg-slate-50 text-[10px] text-slate-400 text-center border-t border-slate-100 italic">
            ※問題文は第37回社会福祉士国家試験を参考にした練習用データです。
          </footer>
        )}
      </div>

      {/* Motivational Toast (floating icon) */}
      <div className="fixed bottom-6 right-6 p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 hidden md:flex items-center gap-3">
        <div className="bg-pink-100 p-2 rounded-xl text-pink-500">
          <Heart size={20} fill="currentColor" />
        </div>
        <div className="text-xs font-bold leading-tight">
          絶対合格！<br />
          <span className="text-slate-400">応援しています！</span>
        </div>
      </div>
    </div>
  );
};

export default App;
