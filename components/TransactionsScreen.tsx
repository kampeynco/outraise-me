import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { supabase } from '../services/supabaseClient';

export const TransactionsScreen: React.FC = () => {
                                        </td >
                                        <td className="px-6 py-4 text-text-sub dark:text-gray-400">{transaction.account}</td>
                                        <td className={`px-6 py-4 font-semibold text-right ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-text-main dark:text-white'}`}>
                                            {transaction.amount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-text-main dark:hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                        </td>
                                    </tr >
                                );
                            })}
                        </tbody >
                    </table >
                </div >
            </div >
        </div >
    );
};
