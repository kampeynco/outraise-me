import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types';
import Markdown from 'react-markdown';
import { MessageSquare, Plus, Search } from 'lucide-react';

interface ChatScreenProps {
    messages: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (text: string) => void;
    onNewChat: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ messages, isLoading, onSendMessage, onNewChat }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = () => {
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Mock chat history
    const recentChats = [
        "Healthcare Policy Review",
        "Fundraiser Ideas",
        "Speech Draft: VFW Hall",
        "Opposition Research: Smith"
    ];

    return (
        <div className="flex h-full bg-white dark:bg-background-dark transition-colors duration-300">
            {/* Inner Sidebar for Chats */}
            <aside className="w-64 bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col transition-colors duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-serif text-xl font-medium text-text-main dark:text-white">Chats</h2>
                    <p className="text-xs text-text-sub dark:text-gray-400 mt-1">Your conversation history</p>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mb-4"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-text-main dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>

                    <div className="space-y-1 overflow-y-auto custom-scrollbar">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</div>
                        {recentChats.map((chat, idx) => (
                            <button
                                key={idx}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                            >
                                <MessageSquare className="w-4 h-4 shrink-0 text-gray-400" />
                                <span className="truncate">{chat}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-background-dark transition-colors duration-300">
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p>Start a new conversation</p>
                        </div>
                    ) : (
                        <div className="max-w-[800px] mx-auto flex flex-col gap-6 pb-24">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold font-serif shrink-0 mt-1">
                                            K
                                        </div>
                                    )}
                                    <div
                                        className={`flex-1 max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-accent-bg dark:bg-gray-800 text-text-main dark:text-white'
                                                : 'bg-white dark:bg-gray-900 text-text-main dark:text-white shadow-subtle border border-gray-100 dark:border-gray-800'
                                            }`}
                                    >
                                        {msg.role === 'user' ? (
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        ) : (
                                            <div className="markdown-body dark:prose-invert">
                                                <Markdown>{msg.text}</Markdown>
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0 mt-1">
                                            A
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-4 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold font-serif shrink-0 mt-1">
                                        K
                                    </div>
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl px-5 py-3.5 flex items-center gap-2 shadow-subtle border border-gray-100 dark:border-gray-800">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-background-dark dark:via-background-dark pt-10 pb-6 px-6 transition-colors duration-300">
                    <div className="max-w-[800px] mx-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-card focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.08)] focus-within:border-gray-300 dark:focus-within:border-gray-600 transition-all">
                        <div className="p-1">
                            <textarea
                                className="w-full max-h-[120px] resize-none border-none bg-transparent p-4 text-base text-text-main dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-0"
                                placeholder="Message Outraise..."
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-900 rounded-b-xl transition-colors">
                            <div className="flex gap-1">
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <span className="material-symbols-outlined text-[20px] -rotate-45">attachment</span>
                                </button>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-black dark:disabled:hover:bg-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-3">Outraise can make mistakes. Consider checking important information.</p>
                </div>
            </div>
        </div>
    );
};