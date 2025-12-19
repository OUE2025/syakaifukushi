const fs = require('fs');

// 新しい mondai.txt（Markdown形式）をパースして questions.js を生成するスクリプト
const rawLines = fs.readFileSync('mondai.txt', 'utf8').split(/\r?\n/);

let currentCategory = '';
let currentQuestion = null;
const questions = [];

const commitCurrent = (answerNumbers) => {
  if (!currentQuestion) return;
  const questionText = currentQuestion.questionLines.join(' ').trim();
  const options = currentQuestion.options.length > 0 ? currentQuestion.options : ['（選択肢データなし）'];
  const correct = (answerNumbers || []).map((n) => n - 1); // 0-indexed

  questions.push({
    id: currentQuestion.id,
    category: currentQuestion.category || '未分類',
    question: questionText,
    options,
    correct,
  });

  currentQuestion = null;
};

for (const line of rawLines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  // カテゴリ見出し（### 〜）
  if (trimmed.startsWith('### ')) {
    currentCategory = trimmed.replace(/^###\s*/, '').trim();
    continue;
  }

  // 問題開始 (**問題X**)
  const qStart = trimmed.match(/^\*\*問題(\d+)\*\*$/);
  if (qStart) {
    // 念のため前の未コミット質問を破棄
    currentQuestion = {
      id: Number(qStart[1]),
      category: currentCategory || '未分類',
      questionLines: [],
      options: [],
    };
    continue;
  }

  // 正解行 (**正解：x, y**)
  const ansMatch = trimmed.match(/^\*\*正解：(.+?)\*\*$/);
  if (ansMatch && currentQuestion) {
    const numbers = (ansMatch[1].match(/\d+/g) || []).map((n) => Number(n));
    commitCurrent(numbers);
    continue;
  }

  // 選択肢行（例: "1. 〜"）
  if (currentQuestion && trimmed.match(/^\d+\.\s/)) {
    const option = trimmed.replace(/^\d+\.\s*/, '').trim();
    currentQuestion.options.push(option);
    continue;
  }

  // その他の行は問題文として蓄積
  if (currentQuestion) {
    currentQuestion.questionLines.push(trimmed);
  }
}

// 念のため最後にコミット
commitCurrent([]);

fs.writeFileSync(
  'src/questions.js',
  'export const questions = ' + JSON.stringify(questions, null, 2) + ';\n',
  'utf8',
);

console.log('parsed', questions.length, 'questions');
