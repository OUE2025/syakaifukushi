const fs = require('fs');

const questionPrefix = '\u554f\u984c'; // 問題
const answerMarker = '\u6b63\u89e3\uff1a'; // 正解：

const rawLines = fs.readFileSync('mondai.txt', 'utf8').split(/\r?\n/);
let currentCategory = '';
const questions = [];

for (const line of rawLines) {
  const t = line.trim();
  if (!t) continue;
  if (t.startsWith('【')) continue; // skip big heading

  if (!t.startsWith(questionPrefix)) {
    currentCategory = t;
    continue;
  }

  const questionRegex = new RegExp('^' + questionPrefix + '(\\d+)(.+)' + answerMarker + '(.+)$');
  const m = t.match(questionRegex);
  if (!m) {
    console.error('parse failed', t);
    continue;
  }

  const id = Number(m[1]);
  const body = m[2].trim();
  const answerRaw = m[3].trim();

  // split question text and options
  let questionText = body;
  let optionsPart = '';
  const startIdx = body.indexOf('1　'); // digit + fullwidth space
  if (startIdx !== -1) {
    questionText = body.slice(0, startIdx).trim();
    optionsPart = body.slice(startIdx).trim();
  } else {
    const m2 = body.match(/\d　/);
    if (m2) {
      questionText = body.slice(0, m2.index).trim();
      optionsPart = body.slice(m2.index).trim();
    }
  }

  let options = [];
  if (optionsPart) {
    options = optionsPart
      .split(/(?=\d　)/g)
      .map((part) => part.replace(/^\d　/, '').trim())
      .filter(Boolean);
  }
  if (options.length === 0) {
    options.push('（選択肢データなし）');
  }

  // parse answers (numbers separated by comma at start)
  const noBracket = answerRaw.split('[')[0].trim();
  const ansMatch = noBracket.match(/^(\d+(?:\s*,\s*\d+)*)/);
  if (!ansMatch) {
    console.error('answer parse failed', answerRaw);
    continue;
  }
  const answers = ansMatch[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n));
  const correct = answers.map((n) => n - 1);

  questions.push({
    id,
    category: currentCategory || '未分類',
    question: questionText,
    options,
    correct,
  });
}

fs.writeFileSync(
  'src/questions.js',
  'export const questions = ' + JSON.stringify(questions, null, 2) + ';\n',
  'utf8',
);
console.log('parsed', questions.length, 'questions');
