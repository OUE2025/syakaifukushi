// 対応内容:
// - questions*.js を自動収集し、examSets に取り込む仕組みを追加（ファイル名の数字から「第XX回」を生成）。
// - デフォルトの試験回は数字が最大のもの（なければ最初のキー）を自動選択。
//
// 補足:
// - 新しい試験を追加する際は questionsXX.js を用意し、`export const questions = [...]` 形式でエクスポートしてください。
// - このファイルは (import.meta.glob) を使うため Vite など ESM+Vite 環境前提です。

const modules = import.meta.glob('./questions*.js', { eager: true });

const examSets = {};
Object.entries(modules).forEach(([path, mod]) => {
  if (path.endsWith('questions.js')) return;

  const match = path.match(/questions(\d+)\.js$/);
  const label = match ? `第${match[1]}回` : path.replace('./', '').replace('.js', '');

  const questions = mod.questions || mod.default || [];
  examSets[label] = questions;
});

const sortedKeys = Object.keys(examSets).sort((a, b) => {
  const aNum = Number(a.replace(/\D/g, '')) || 0;
  const bNum = Number(b.replace(/\D/g, '')) || 0;
  return bNum - aNum;
});

export const defaultExamKey = sortedKeys[0] || '';
export { examSets };
