import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Loader2, Trophy, XCircle, CheckCircle, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';
import clsx from 'clsx';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { generateBountyQuiz, consumeBountyAttempt, awardBountyXP } from '../services/bountyService';
import type { BountyQuestion } from '../services/bountyService';

interface BountyModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    moduleTopic: string;
}

const BountyModal: React.FC<BountyModalProps> = ({ isOpen, onClose, userId, moduleTopic }) => {
    const [questions, setQuestions] = useState<BountyQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [answers, setAnswers] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [xpAwarded, setXpAwarded] = useState(0);
    const [attemptConsumed, setAttemptConsumed] = useState(false);
    
    const { inventory } = useStore();

    // Fetch quiz and consume attempt when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            setLoading(true);
            setError(null);
            setCurrentIndex(0);
            setSelectedOption(null);
            setIsLocked(false);
            setAnswers([]);
            setShowResults(false);
            setShowConfetti(false);
            setXpAwarded(0);

            // Consume the attempt immediately — no going back
            if (!attemptConsumed) {
                await consumeBountyAttempt(userId);
                setAttemptConsumed(true);
            }

            try {
                const quiz = await generateBountyQuiz(moduleTopic);
                setQuestions(quiz);
            } catch (err: any) {
                setError(err.message || 'Failed to generate bounty quiz.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleReroll = async () => {
        if (inventory.rerolls <= 0 || loading || showResults) return;

        // Optimistic UI for inventory deduction
        useStore.setState((s) => ({
            ...s,
            inventory: {
                ...s.inventory,
                rerolls: s.inventory.rerolls - 1
            }
        }));

        setLoading(true);
        setError(null);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsLocked(false);
        setAnswers([]);
        setShowResults(false);

        try {
            await updateDoc(doc(db, 'users', userId), {
                'inventory.rerolls': increment(-1)
            });

            const quiz = await generateBountyQuiz(moduleTopic);
            setQuestions(quiz);
            // Replace with custom toast if available, but standard alert suffices per plan for immediate notification
        } catch (err: any) {
            setError(err.message || 'Failed to reroll bounty.');
            // Revert optimistic update
            useStore.setState((s) => ({
                ...s,
                inventory: {
                    ...s.inventory,
                    rerolls: s.inventory.rerolls + 1
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    const handleSelect = (option: string) => {
        if (isLocked) return;
        setSelectedOption(option);
        setIsLocked(true);
        setAnswers(prev => [...prev, option]);
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsLocked(false);
        } else {
            // Calculate results
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        const finalAnswers = [...answers];
        // Last answer is already in the array from handleSelect
        const correctCount = questions.reduce((acc, q, idx) => {
            return finalAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
        }, 0);

        setShowResults(true);

        if (correctCount === totalQuestions) {
            // Perfect score — award bounty XP
            const xp = await awardBountyXP(userId);
            setXpAwarded(xp);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    };

    const score = showResults
        ? questions.reduce((acc, q, idx) => (answers[idx] === q.correctAnswer ? acc + 1 : acc), 0)
        : 0;
    const passed = score === totalQuestions && totalQuestions > 0;

    const isCorrect = selectedOption !== null && currentQuestion && selectedOption === currentQuestion.correctAnswer;

    const modalContent = (
        <>
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={400}
                    style={{ position: 'fixed', top: 0, left: 0, zIndex: 200 }}
                />
            )}

            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div
                    className="relative w-full max-w-xl max-h-[85vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-foreground">Daily Bounty</h2>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{moduleTopic}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReroll}
                                disabled={inventory.rerolls === 0 || loading || showResults}
                                className={clsx(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
                                    inventory.rerolls > 0 && !loading && !showResults 
                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400"
                                        : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                )}
                            >
                                <span>🎲 Reroll</span>
                                <span className="bg-background/50 px-1.5 py-0.5 rounded-md">{inventory.rerolls}</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 min-h-[300px] flex flex-col overflow-y-auto">
                        {/* Loading */}
                        {loading && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center animate-pulse">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                </div>
                                <div className="text-center">
                                    <p className="text-foreground font-semibold">Generating your bounty challenge...</p>
                                    <p className="text-muted-foreground text-sm mt-1">Powered by Gemini AI</p>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && !loading && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <XCircle className="w-12 h-12 text-destructive" />
                                <p className="text-foreground font-semibold">Failed to generate bounty</p>
                                <p className="text-muted-foreground text-sm">{error}</p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-muted hover:bg-muted/80 rounded-xl font-medium text-foreground transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        )}

                        {/* Quiz Flow */}
                        {!loading && !error && !showResults && currentQuestion && (
                            <div className="flex-1 flex flex-col">
                                {/* Progress */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                                        {currentIndex + 1}/{totalQuestions}
                                    </span>
                                </div>

                                {/* Question */}
                                <h3 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
                                    {currentQuestion.question}
                                </h3>

                                {/* Options */}
                                <div className="flex flex-col gap-3 flex-1">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = selectedOption === option;
                                        const isCorrectOption = option === currentQuestion.correctAnswer;

                                        let optionStyles = 'bg-muted hover:bg-muted/80 border-border text-foreground hover:border-primary/50';

                                        if (isLocked) {
                                            if (isCorrectOption) {
                                                optionStyles = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-300';
                                            } else if (isSelected && !isCorrectOption) {
                                                optionStyles = 'bg-rose-500/15 border-rose-500/50 text-rose-600 dark:text-rose-300';
                                            } else {
                                                optionStyles = 'bg-muted/50 border-border text-muted-foreground';
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelect(option)}
                                                disabled={isLocked}
                                                className={clsx(
                                                    'relative w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium',
                                                    optionStyles,
                                                    !isLocked && 'cursor-pointer active:scale-[0.98]',
                                                    isLocked && 'cursor-default'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-7 h-7 rounded-lg bg-background flex items-center justify-center text-xs font-bold shrink-0 border border-border">
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="min-w-0 break-words">{option}</span>
                                                    {isLocked && isCorrectOption && (
                                                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                                    )}
                                                    {isLocked && isSelected && !isCorrectOption && (
                                                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Feedback */}
                                {isLocked && (
                                    <div className={clsx(
                                        'mt-4 px-4 py-3 rounded-xl text-sm border',
                                        isCorrect
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-300'
                                    )}>
                                        {isCorrect ? '✓ Correct!' : '✗ Incorrect — the bounty requires perfection.'}
                                    </div>
                                )}

                                {/* Next Button */}
                                {isLocked && (
                                    <button
                                        onClick={handleNext}
                                        className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm transition-colors active:scale-[0.98]"
                                    >
                                        {currentIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Results */}
                        {showResults && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
                                <div className={clsx(
                                    'w-24 h-24 rounded-full flex items-center justify-center border-4',
                                    passed
                                        ? 'border-amber-500 bg-amber-500/10'
                                        : 'border-rose-500 bg-rose-500/10'
                                )}>
                                    {passed ? (
                                        <Trophy className="w-10 h-10 text-amber-500" />
                                    ) : (
                                        <XCircle className="w-10 h-10 text-rose-500" />
                                    )}
                                </div>

                                <div>
                                    <h3 className={clsx(
                                        'text-2xl font-bold',
                                        passed ? 'text-amber-500' : 'text-rose-500'
                                    )}>
                                        {passed ? 'Bounty Claimed!' : 'Bounty Failed'}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-2">
                                        You scored <span className="font-bold text-foreground">{score}</span> out of <span className="font-bold text-foreground">{totalQuestions}</span>
                                        {passed ? ` — You earned ${xpAwarded} XP!` : ' — Perfect score required. Try again tomorrow.'}
                                    </p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className={clsx(
                                        'w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2',
                                        passed
                                            ? 'bg-amber-500 hover:bg-amber-400 text-white'
                                            : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                                    )}
                                >
                                    {passed ? '🎉 Collect Reward' : 'Close'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default BountyModal;
