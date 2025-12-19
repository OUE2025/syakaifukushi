import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Heart,
  RefreshCcw,
  Settings,
  Star,
  XCircle,
} from 'lucide-react';
import { questions as rawQuestions } from './questions';

const categories = ['すべて', ...new Set(rawQuestions.map((q) => q.category))];
const questionCountOptions = ['all', 10, 20, 30, 50, 100];

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

const shuffleArray = (arr) => {
  const cloned = [...arr];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const prepareSessionQuestions = (base, filter, countOption) => {
  if (filter !== 'すべて') return base;
  const targetCount = countOption === 'all' ? base.length : Math.min(Number(countOption), base.length);
  return shuffleArray(base).slice(0, targetCount);
};

const Header = ({ hasStarted, onOpenSettings }) => (
  <header
    className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center flex-shrink-0 ${
      hasStarted ? 'px-4 py-3 md:px-5 md:py-3' : 'p-5 md:p-6'
    }`}
  >
    {!hasStarted && (
      <>
        <div className="flex justify-center mb-2">
          <GraduationCap size={40} className="text-indigo-200" />
        </div>
        <h1 className="text-2xl font-bold">第37回 社会福祉士国家試験</h1>
        <p className="text-indigo-100 opacity-90 text-sm md:text-base">令和年度 過去問演習クエスト</p>
        <div className="mt-3 flex justify-center">
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-full border border-white/30"
          >
            <Settings size={16} />
            設定
          </button>
        </div>
      </>
    )}
    {hasStarted && <h1 className="text-lg md:text-xl font-bold">第37回 社会福祉士国家試験</h1>}
  </header>
);

const SettingsModal = ({
  open,
  modalTimeLimitEnabled,
  modalTimeLimitSeconds,
  modalQuestionCountOption,
  onClose,
  onCancel,
  onChangeTimeEnabled,
  onChangeTimeSeconds,
  onChangeQuestionCount,
  onApply,
}) =>
  open ? (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings size={18} /> 設定
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-sm font-semibold">
            閉じる
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={modalTimeLimitEnabled} onChange={onChangeTimeEnabled} />
          回答制限時間を使う
        </label>
        <div className="text-sm text-slate-700">
          <div className="mb-2 font-semibold">制限時間</div>
          <div className="flex gap-2">
            {[10, 20, 30].map((sec) => (
              <button
                key={sec}
                onClick={() => onChangeTimeSeconds(sec)}
                className={`px-3 py-2 rounded-xl border text-sm font-semibold ${
                  modalTimeLimitSeconds === sec ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'
                } ${!modalTimeLimitEnabled ? 'opacity-60' : ''}`}
                disabled={!modalTimeLimitEnabled}
              >
                {sec}秒
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm text-slate-700">
          <div className="mb-2 font-semibold">出題数（「すべて」選択時のみ適用）</div>
          <div className="flex flex-wrap gap-2">
            {questionCountOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onChangeQuestionCount(opt)}
                className={`px-3 py-2 rounded-xl border text-sm font-semibold ${
                  modalQuestionCountOption === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'
                }`}
              >
                {opt === 'all' ? '全問' : `${opt}問`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-100"
          >
            キャンセル
          </button>
          <button onClick={onApply} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
            設定
          </button>
        </div>
      </div>
    </div>
  ) : null;

const FilterBar = ({
  filter,
  onChangeFilter,
  currentIndex,
  total,
  score,
  timeLimitEnabled,
  remainingSeconds,
  onAbort,
}) => (
  <div className="p-3 md:p-4 bg-indigo-50 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 flex-shrink-0">
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">科目:</span>
      <select
        value={filter}
        onChange={(e) => onChangeFilter(e.target.value)}
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
          {currentIndex + 1} / {total}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Star size={16} className="text-yellow-500 fill-yellow-500" />
        <span>正解: {score}</span>
      </div>
      {timeLimitEnabled && (
        <div className="flex items-center gap-1 text-rose-600">
          <RefreshCcw size={16} />
          <span>{remainingSeconds}s</span>
        </div>
      )}
      <button
        onClick={onAbort}
        className="px-3 py-1 rounded-full bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-semibold"
      >
        途中でやめる
      </button>
    </div>
  </div>
);

const FeedbackPopup = ({ open, encouragement, lastAnswerCorrect, onClose }) =>
  open && encouragement ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 px-4">
      <div
        className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border ${
          lastAnswerCorrect ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {lastAnswerCorrect ? <CheckCircle2 className="text-green-500" size={28} /> : <XCircle className="text-orange-500" size={28} />}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">{lastAnswerCorrect ? '正解です！' : '不正解です'}</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{encouragement}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  ) : null;

const StartScreen = ({ totalCount, onStart, onOpenSettings }) => (
  <div className="text-center space-y-5 py-2 h-full flex flex-col items-center justify-center">
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-indigo-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
      <div className="relative bg-white p-5 rounded-full border-4 border-indigo-400 shadow-xl inline-flex items-center justify-center w-28 h-28 text-4xl text-indigo-600">
        <BookOpen size={40} />
      </div>
    </div>
    <div className="space-y-2">
      <h2 className="text-xl md:text-2xl font-black text-slate-800">演習をはじめよう</h2>
      <p className="text-slate-500 text-sm md:text-base">全 {totalCount} 問 / 科目 {categories.length - 1} / 制限時間オプションあり</p>
    </div>
    <div className="flex flex-col md:flex-row gap-3 justify-center">
      <button
        onClick={onStart}
        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 text-sm md:text-base"
      >
        スタート
      </button>
      <button
        onClick={onOpenSettings}
        className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 text-sm md:text-base"
      >
        設定を開く
      </button>
    </div>
  </div>
);

const QuestionScreen = ({
  currentQuestion,
  isMultiple,
  selectedOptions,
  showResult,
  handleOptionToggle,
  handleSubmit,
  handleNext,
  currentQuestionIndex,
  activeLength,
}) => (
  <div className="flex flex-col gap-4 h-full">
    <div className="space-y-2 flex-shrink-0">
      <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
        {currentQuestion.category}
      </div>
      <div className="text-base md:text-lg font-bold leading-snug max-h-16 overflow-auto pr-1">
        <span className="font-extrabold mr-1">問題 {currentQuestion.id}:</span>
        <span>{currentQuestion.question}</span>
      </div>
      {isMultiple && (
        <p className="text-rose-500 text-sm font-bold flex items-center gap-1">
          <CheckCircle2 size={14} /> ※この問題は正解が複数あります。
        </p>
      )}
    </div>

    <div className="space-y-2">
      {currentQuestion.options.map((option, idx) => {
        const isSelected = selectedOptions.includes(idx);
        const isCorrect = currentQuestion.correct.includes(idx);

        let buttonClass = 'w-full text-left p-2.5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-2.5 ';

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
          <button key={idx} onClick={() => handleOptionToggle(idx)} disabled={showResult} className={buttonClass}>
            <span
              className={`mt-1 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs font-bold ${
                isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 text-slate-400'
              }`}
            >
              {idx + 1}
            </span>
            <span className="flex-grow leading-snug break-words" style={{ fontSize: 'clamp(12px, 2.2vw, 15px)' }}>
              {option}
            </span>
            {showResult && isCorrect && <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />}
            {showResult && isSelected && !isCorrect && <XCircle className="text-rose-500 flex-shrink-0" size={20} />}
          </button>
        );
      })}
    </div>

    <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-3 flex-shrink-0">
      <div className="w-full flex justify-between gap-4">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOptions.length === 0}
            className="flex-grow bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            回答する
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-grow bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
          >
            {currentQuestionIndex < activeLength - 1 ? '次の問題へ' : '結果を見る'}
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  </div>
);

const ResultScreen = ({ score, accuracy, rank, onRestart, onBackToStart }) => (
  <div className="text-center space-y-8 py-4">
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
      <div className="relative bg-white p-6 rounded-full border-4 border-yellow-400 shadow-xl inline-flex items-center justify-center w-32 h-32 text-6xl">
        {rank.icon}
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

    <div className={`p-6 rounded-3xl border-2 border-dashed ${rank.color.replace('text', 'border')} bg-white`}>
      <p className="text-sm font-bold mb-1 opacity-70">授与された称号:</p>
      <div className={`text-2xl font-black ${rank.color}`}>{rank.title}</div>
    </div>

    <button
      onClick={onRestart}
      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
    >
      <RefreshCcw size={20} />
      もう一度挑戦する
    </button>
    <button
      onClick={onBackToStart}
      className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-2xl border border-slate-200 transition-all"
    >
      スタート画面に戻る（設定変更）
    </button>
  </div>
);

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [filter, setFilter] = useState('すべて');
  const [encouragement, setEncouragement] = useState('');
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(10);
  const [remainingSeconds, setRemainingSeconds] = useState(timeLimitSeconds);
  const [modalTimeLimitEnabled, setModalTimeLimitEnabled] = useState(timeLimitEnabled);
  const [modalTimeLimitSeconds, setModalTimeLimitSeconds] = useState(timeLimitSeconds);
  const [questionCountOption, setQuestionCountOption] = useState('all');
  const [modalQuestionCountOption, setModalQuestionCountOption] = useState('all');
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  const filteredQuestions = useMemo(
    () => (filter === 'すべて' ? rawQuestions : rawQuestions.filter((q) => q.category === filter)),
    [filter],
  );

  const activeQuestions = hasStarted ? sessionQuestions : filteredQuestions;
  const currentQuestion = activeQuestions[currentQuestionIndex] ?? null;
  const isMultiple = currentQuestion?.correct.length > 1;

  useEffect(() => {
    resetQuiz();
    setHasStarted(false);
    setIsFinished(false);
  }, [filter]);

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions([]);
    setScore(0);
    setIsFinished(false);
    setShowResult(false);
    setEncouragement('');
    setLastAnswerCorrect(null);
    setRemainingSeconds(timeLimitSeconds);
    setSessionQuestions([]);
    setShowFeedbackPopup(false);
  };

  const handleStart = () => {
    const prepared = prepareSessionQuestions(filteredQuestions, filter, modalQuestionCountOption);
    setSessionQuestions(prepared);
    setQuestionCountOption(modalQuestionCountOption);
    setTimeLimitEnabled(modalTimeLimitEnabled);
    setTimeLimitSeconds(modalTimeLimitSeconds);
    setCurrentQuestionIndex(0);
    setSelectedOptions([]);
    setScore(0);
    setIsFinished(false);
    setShowResult(false);
    setEncouragement('');
    setLastAnswerCorrect(null);
    setHasStarted(true);
    setShowSettings(false);
    setRemainingSeconds(modalTimeLimitSeconds);
    setShowFeedbackPopup(false);
  };

  const handleBackToStart = () => {
    resetQuiz();
    setHasStarted(false);
    setIsFinished(false);
    setShowResult(false);
  };

  const handleOptionToggle = (index) => {
    if (showResult || !currentQuestion) return;
    if (isMultiple) {
      setSelectedOptions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    } else {
      setSelectedOptions([index]);
    }
  };

  const handleSubmit = (allowEmpty = false) => {
    if (!currentQuestion) return;
    if (!allowEmpty && selectedOptions.length === 0) return;

    const isCorrect =
      selectedOptions.length === currentQuestion.correct.length &&
      selectedOptions.every((val) => currentQuestion.correct.includes(val));

    setEncouragement(
      isCorrect ? praiseMessages[Math.floor(Math.random() * praiseMessages.length)] : retryMessages[Math.floor(Math.random() * retryMessages.length)],
    );
    if (isCorrect) setScore((prev) => prev + 1);

    setLastAnswerCorrect(isCorrect);
    setShowResult(true);
    setShowFeedbackPopup(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptions([]);
      setShowResult(false);
      setEncouragement('');
      setLastAnswerCorrect(null);
      setRemainingSeconds(timeLimitSeconds);
      setShowFeedbackPopup(false);
    } else {
      setIsFinished(true);
    }
  };

  const getRank = () => {
    const total = activeQuestions.length || 1;
    const ratio = score / total;
    if (ratio === 1) return { title: '社会福祉士マスター', icon: '👑', color: 'text-yellow-500' };
    if (ratio >= 0.8) return { title: 'ベテランソーシャルワーカー', icon: '💎', color: 'text-blue-500' };
    if (ratio >= 0.6) return { title: '合格圏のルーキー', icon: '🌟', color: 'text-green-500' };
    return { title: '社会福祉士の卵', icon: '🥚', color: 'text-gray-500' };
  };

  const accuracy = activeQuestions.length ? Math.round((score / activeQuestions.length) * 100) : 0;

  useEffect(() => {
    if (showSettings) {
      setModalTimeLimitEnabled(timeLimitEnabled);
      setModalTimeLimitSeconds(timeLimitSeconds);
      setModalQuestionCountOption(questionCountOption);
    }
  }, [showSettings, timeLimitEnabled, timeLimitSeconds, questionCountOption]);

  useEffect(() => {
    if (!hasStarted || !timeLimitEnabled || !currentQuestion || showResult || isFinished) return;
    setRemainingSeconds(timeLimitSeconds);
  }, [currentQuestionIndex, timeLimitEnabled, timeLimitSeconds, currentQuestion, showResult, isFinished, hasStarted]);

  useEffect(() => {
    if (!hasStarted || !timeLimitEnabled || !currentQuestion || showResult || isFinished) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          setShowFeedbackPopup(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLimitEnabled, currentQuestion, showResult, isFinished, hasStarted, timeLimitSeconds]);

  useEffect(() => {
    if (!showFeedbackPopup) return;
    const t = setTimeout(() => setShowFeedbackPopup(false), 2500);
    return () => clearTimeout(t);
  }, [showFeedbackPopup]);

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-6 font-sans text-slate-800 overflow-hidden">
      <SettingsModal
        open={showSettings && !hasStarted}
        modalTimeLimitEnabled={modalTimeLimitEnabled}
        modalTimeLimitSeconds={modalTimeLimitSeconds}
        modalQuestionCountOption={modalQuestionCountOption}
        onClose={() => setShowSettings(false)}
        onCancel={() => {
          setShowSettings(false);
          setModalTimeLimitEnabled(timeLimitEnabled);
          setModalTimeLimitSeconds(timeLimitSeconds);
          setModalQuestionCountOption(questionCountOption);
        }}
        onChangeTimeEnabled={(e) => setModalTimeLimitEnabled(e.target.checked)}
        onChangeTimeSeconds={(sec) => setModalTimeLimitSeconds(sec)}
        onChangeQuestionCount={(opt) => setModalQuestionCountOption(opt)}
        onApply={() => {
          setTimeLimitEnabled(modalTimeLimitEnabled);
          setTimeLimitSeconds(modalTimeLimitSeconds);
          setRemainingSeconds(modalTimeLimitSeconds);
          setQuestionCountOption(modalQuestionCountOption);
          setShowSettings(false);
        }}
      />

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] flex flex-col">
        <Header hasStarted={hasStarted} onOpenSettings={() => !hasStarted && setShowSettings(true)} />

        {hasStarted && !isFinished && (
          <FilterBar
            filter={filter}
            onChangeFilter={setFilter}
            currentIndex={currentQuestionIndex}
            total={activeQuestions.length || 1}
            score={score}
            timeLimitEnabled={timeLimitEnabled}
            remainingSeconds={remainingSeconds}
            onAbort={handleBackToStart}
          />
        )}

        <FeedbackPopup
          open={showFeedbackPopup}
          encouragement={encouragement}
          lastAnswerCorrect={lastAnswerCorrect}
          onClose={() => setShowFeedbackPopup(false)}
        />

        <main className="p-4 md:p-6 flex-1 overflow-auto">
          {!hasStarted ? (
            <StartScreen
              totalCount={filter === 'すべて' ? rawQuestions.length : filteredQuestions.length}
              onStart={handleStart}
              onOpenSettings={() => setShowSettings(true)}
            />
          ) : !isFinished && currentQuestion ? (
            <QuestionScreen
              currentQuestion={currentQuestion}
              isMultiple={isMultiple}
              selectedOptions={selectedOptions}
              showResult={showResult}
              handleOptionToggle={handleOptionToggle}
              handleSubmit={() => handleSubmit(false)}
              handleNext={handleNext}
              currentQuestionIndex={currentQuestionIndex}
              activeLength={activeQuestions.length || 1}
            />
          ) : (
            <ResultScreen score={score} accuracy={accuracy} rank={getRank()} onRestart={resetQuiz} onBackToStart={handleBackToStart} />
          )}
        </main>

        {hasStarted && !isFinished && (
          <footer className="px-6 py-4 bg-slate-50 text-[10px] text-slate-400 text-center border-t border-slate-100 italic">
            ※問題文は第37回社会福祉士国家試験を参考にした練習用データです。
          </footer>
        )}
      </div>

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
