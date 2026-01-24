import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import type { Module } from '../types';
import clsx from 'clsx';

interface QuizModalProps {
    module: Module;
    onClose: () => void;
    onPass: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ module, onClose, onPass }) => {
    const { quiz } = module;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [showResult, setShowResult] = useState(false);

    if (!quiz) return null;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const totalQuestions = quiz.questions.length;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    const handleOptionSelect = (optionIndex: number) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionIndex
        }));
    };

    const handleNext = () => {
        if (isLastQuestion) {
            calculateResult();
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const calculateResult = () => {
        let correctCount = 0;
        quiz.questions.forEach(q => {
            if (selectedAnswers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });

        const score = (correctCount / totalQuestions) * 100;
        const passed = score >= quiz.passingScore;

        setShowResult(true);

        if (passed) {
            // Delay calling onPass slightly to show the success screen
            setTimeout(() => {
                onPass();
            }, 2000);
        }
    };

    const isPassed = (() => {
        let correctCount = 0;
        quiz.questions.forEach(q => {
            if (selectedAnswers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });
        return (correctCount / totalQuestions) * 100 >= quiz.passingScore;
    })();


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">

                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-lg">{module.title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {!showResult ? (
                        <>
                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                                />
                            </div>

                            {/* Question */}
                            <div className="mb-6">
                                <span className="text-xs font-bold text-indigo-600 uppercase mb-2 block">
                                    Question {currentQuestionIndex + 1} of {totalQuestions}
                                </span>
                                <h2 className="text-xl font-bold text-gray-900 leading-snug">
                                    {currentQuestion.text}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={clsx(
                                            "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                                            selectedAnswers[currentQuestion.id] === idx
                                                ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                                                : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                                        )}
                                    >
                                        <span className="font-medium">{option}</span>
                                        {selectedAnswers[currentQuestion.id] === idx && (
                                            <div className="w-4 h-4 rounded-full bg-indigo-600" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={selectedAnswers[currentQuestion.id] === undefined}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                                >
                                    {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className={clsx(
                                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                                isPassed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            )}>
                                {isPassed ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
                            </div>

                            <h2 className="text-2xl font-bold mb-2">
                                {isPassed ? "Quiz Passed!" : "Quiz Failed"}
                            </h2>
                            <p className="text-gray-600 mb-8">
                                {isPassed
                                    ? "Great job! You've unlocked the next module."
                                    : `You need ${quiz.passingScore}% to pass. Please try again.`}
                            </p>

                            <button
                                onClick={isPassed ? onClose : () => { setShowResult(false); setCurrentQuestionIndex(0); setSelectedAnswers({}); }}
                                className={clsx(
                                    "w-full py-3 rounded-xl font-bold text-white transition-colors",
                                    isPassed ? "bg-green-500 hover:bg-green-600" : "bg-gray-900 hover:bg-black"
                                )}
                            >
                                {isPassed ? "Continue" : "Try Again"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;
