/// <reference types="node" />
import { EventEmitter } from 'events';
export interface IAprioriEvents<T> {
    on(event: 'data', listener: (itemset: Itemset<T>) => void): this;
    on(event: 'close', listener: (stats: any) => void): this;
    on(event: string, listener: Function): this;
}
export interface IAprioriResults<T> {
    itemsets: Itemset<T>[];
    executionTime: number;
}
export interface Itemset<T> {
    items: T[];
    support: number;
}
export declare class Apriori<T> extends EventEmitter implements IAprioriEvents<T> {
    private _support;
    private _transactions;
    constructor(_support: number);
    exec(transactions: T[][], cb?: (result: IAprioriResults<T>) => any): Promise<IAprioriResults<T>>;
    /**
     * Returns frequent one-itemsets from a given set of transactions.
     * @param  {T[][]}              transactions Your set of transactions.
     * @return {Itemset<T>}         Frequent one-itemsets.
     */
    private getFrequentOneItemsets(transactions);
    /**
     * Returns frequent (k = n+1)-itemsets from a given array of frequent n-itemsets.
     * @param  {Itemset<T>[]} frequentNItemsets Previously determined n-itemsets.
     * @return {any}                            Frequent k-itemsets.
     */
    private getFrequentKItemsets(frequentNItemsets);
    /**
     * Returns all combinations (itemset candidates) of size k from a given set of items.
     * @param  {T[]}    items The set of items of which you want the combinations.
     * @param  {number} k     Size of combinations you want.
     * @return {T[]}          Array of itemset candidates.
     */
    private _generateKCandidates(items, k);
    /**
     * Populates an Itemset array with their support in the given set of transactions
     * @param  {Itemset<T>[]} candidates The itemset candidates to populate with their support.
     * @return {Itemset<T>}              The support-populated collection of itemsets.
     */
    private _getCandidatesCount(candidates);
    /**
     * Returns the occurence of single items in a given set of transactions.
     * @param  {T[][]}      transactions The set of transaction.
     * @return {ItemsCount}              Count of items (stringified items as keys).
     */
    private _getDistinctItemsCount(transactions);
}
