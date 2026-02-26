import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, XCircle, Brain, Loader2, RotateCcw, Trophy, ChevronRight } from 'lucide-react';
import Confetti from 'react-confetti';
import clsx from 'clsx';
import { useQuizEngine } from '../../hooks/useQuizEngine';
import type { QuizQuestionData } from '../../hooks/useQuizEngine';

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodeId: string;
    topicName: string;
    onMarkComplete: () => void;
}

// Dynamic: 80% of questions must be correct (4/5 for normal, 1/1 for fallback)

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, nodeId, topicName, onMarkComplete }) => {
    const { questions, loading, error, fetchQuiz } = useQuizEngine(nodeId, topicName);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isAnswerLocked, setIsAnswerLocked] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Fetch quiz when modal opens
    useEffect(() => {
        if (isOpen && questions.length === 0) {
            fetchQuiz();
        }
    }, [isOpen, fetchQuiz, questions.length]);

    // Reset state when modal opens with new content
    useEffect(() => {
        if (isOpen) {
            setCurrentQuestionIndex(0);
            setSelectedOption(null);
            setAnswers([]);
            setShowResults(false);
            setIsAnswerLocked(false);
            setShowConfetti(false);
        }
    }, [isOpen, nodeId]);

    const currentQuestion: QuizQuestionData | undefined = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const passThreshold = Math.max(1, Math.ceil(totalQuestions * 0.8));
    const score = answers.reduce<number>((acc, ans, idx) => {
        if (ans !== null && ans !== undefined && questions[idx] && ans === questions[idx].correctAnswerIndex) {
            return acc + 1;
        }
        return acc;
    }, 0);
    const passed = score >= passThreshold;

    const handleOptionSelect = useCallback((optionIndex: number) => {
        if (isAnswerLocked) return;
        setSelectedOption(optionIndex);
        setIsAnswerLocked(true);

        // Record answer
        setAnswers(prev => {
            const updated = [...prev];
            updated[currentQuestionIndex] = optionIndex;
            return updated;
        });
    }, [isAnswerLocked, currentQuestionIndex]);

    const handleNext = useCallback(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswerLocked(false);
        } else {
            // Show results
            setShowResults(true);
            const finalScore = score + (selectedOption != null && selectedOption === currentQuestion?.correctAnswerIndex ? 1 : 0);
            if (finalScore >= passThreshold) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        }
    }, [currentQuestionIndex, totalQuestions, score, selectedOption, currentQuestion, passThreshold]);

    const handleRetry = useCallback(() => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setAnswers([]);
        setShowResults(false);
        setIsAnswerLocked(false);
    }, []);

    const handleMarkComplete = useCallback(() => {
        onMarkComplete();
        onClose();
    }, [onMarkComplete, onClose]);

    if (!isOpen) return null;

    const isCorrect = selectedOption !== null && currentQuestion && selectedOption === currentQuestion.correctAnswerIndex;

    return (
        <>
            {/* Confetti */}
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={300}
                    style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
                />
            )}

            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                {/* Modal Card */}
                <div
                    className="relative w-full max-w-xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Brain className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-100">Knowledge Check</h2>
                                <p className="text-xs text-slate-400 truncate max-w-[200px]">{topicName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 min-h-[380px] flex flex-col">
                        {/* Loading State */}
                        {loading && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center animate-pulse">
                                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-200 font-semibold">Generating your knowledge check...</p>
                                    <p className="text-slate-500 text-sm mt-1">Powered by Gemini AI</p>
                                </div>
                            </div>
                        )}

                        {/* Error State (still shows fallback questions) */}
                        {error && !loading && questions.length > 0 && (
                            <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                                ⚡ Using fallback question due to: {error}
                            </div>
                        )}

                        {/* Quiz Flow */}
                        {!loading && !showResults && currentQuestion && (
                            <div className="flex-1 flex flex-col">
                                {/* Progress Bar */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-slate-400 shrink-0">
                                        {currentQuestionIndex + 1}/{totalQuestions}
                                    </span>
                                </div>

                                {/* Question */}
                                <h3 className="text-lg font-semibold text-slate-100 mb-6 leading-relaxed">
                                    {currentQuestion.question}
                                </h3>

                                {/* Options */}
                                <div className="flex flex-col gap-3 flex-1">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = selectedOption === idx;
                                        const isCorrectOption = idx === currentQuestion.correctAnswerIndex;

                                        let optionStyles = 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:border-slate-500';

                                        if (isAnswerLocked) {
                                            if (isCorrectOption) {
                                                optionStyles = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';
                                            } else if (isSelected && !isCorrectOption) {
                                                optionStyles = 'bg-rose-500/15 border-rose-500/50 text-rose-300';
                                            } else {
                                                optionStyles = 'bg-slate-800/50 border-slate-700/50 text-slate-500';
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(idx)}
                                                disabled={isAnswerLocked}
                                                className={clsx(
                                                    'relative w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium',
                                                    optionStyles,
                                                    !isAnswerLocked && 'cursor-pointer active:scale-[0.98]',
                                                    isAnswerLocked && 'cursor-default'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="flex-1">{option}</span>
                                                    {isAnswerLocked && isCorrectOption && (
                                                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                                    )}
                                                    {isAnswerLocked && isSelected && !isCorrectOption && (
                                                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Explanation after answer */}
                                {isAnswerLocked && currentQuestion.explanation && (
                                    <div className={clsx(
                                        'mt-4 px-4 py-3 rounded-xl text-sm border',
                                        isCorrect
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                                    )}>
                                        <span className="font-semibold">{isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</span>
                                        {' '}{currentQuestion.explanation}
                                    </div>
                                )}

                                {/* Next Button */}
                                {isAnswerLocked && (
                                    <button
                                        onClick={handleNext}
                                        className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition-colors active:scale-[0.98]"
                                    >
                                        {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'}
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Results */}
                        {showResults && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
                                {/* Score Circle */}
                                <div className={clsx(
                                    'w-24 h-24 rounded-full flex items-center justify-center border-4',
                                    passed
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-rose-500 bg-rose-500/10'
                                )}>
                                    {passed ? (
                                        <Trophy className="w-10 h-10 text-emerald-400" />
                                    ) : (
                                        <XCircle className="w-10 h-10 text-rose-400" />
                                    )}
                                </div>

                                <div>
                                    <h3 className={clsx(
                                        'text-2xl font-bold',
                                        passed ? 'text-emerald-400' : 'text-rose-400'
                                    )}>
                                        {passed ? 'Excellent Work!' : 'Keep Studying!'}
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-2">
                                        You scored <span className="font-bold text-slate-200">{score}</span> out of <span className="font-bold text-slate-200">{totalQuestions}</span>
                                        {passed ? ' — You passed!' : ` — Need ${passThreshold} to pass.`}
                                    </p>
                                </div>

                                {/* Wrong answer explanations on fail */}
                                {!passed && (
                                    <div className="w-full mt-2 space-y-2 max-h-40 overflow-y-auto">
                                        {questions.map((q, idx) => {
                                            const userAnswer = answers[idx];
                                            if (userAnswer === q.correctAnswerIndex) return null;
                                            return (
                                                <div key={idx} className="text-left px-4 py-3 rounded-xl bg-slate-800 border border-slate-700/50 text-xs">
                                                    <p className="text-rose-400 font-semibold mb-1">Q{idx + 1}: {q.question}</p>
                                                    <p className="text-slate-400">
                                                        Your answer: <span className="text-rose-300">{q.options[userAnswer ?? 0]}</span>
                                                    </p>
                                                    <p className="text-slate-400">
                                                        Correct: <span className="text-emerald-300">{q.options[q.correctAnswerIndex]}</span>
                                                    </p>
                                                    {q.explanation && (
                                                        <p className="text-slate-500 mt-1 italic">{q.explanation}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {passed ? (
                                    <button
                                        onClick={handleMarkComplete}
                                        className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Mark Node Complete
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleRetry}
                                        className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all active:scale-[0.98] border border-slate-700 flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw size={16} />
                                        Review Material & Try Again
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default QuizModal;
