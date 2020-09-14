"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var Apriori = /** @class */ (function (_super) {
    __extends(Apriori, _super);
    function Apriori(_support /*, private _confidence: number*/) {
        var _this = _super.call(this) || this;
        _this._support = _support; /*, private _confidence: number*/
        return _this;
    }
    Apriori.prototype.exec = function (transactions, cb) {
        var _this = this;
        this._transactions = transactions;
        return new Promise(function (resolve, reject) {
            var time = process.hrtime();
            // Generate frequent one-itemsets.
            var frequentItemsets = [_this.getFrequentOneItemsets(_this._transactions)];
            var i = 0;
            // Generate frequent (i+1)-itemsets.
            while (frequentItemsets[i].length > 0) {
                frequentItemsets.push(_this.getFrequentKItemsets(frequentItemsets[i]));
                i++;
            }
            var elapsedTime = process.hrtime(time);
            // Formatting results.
            var result = {
                itemsets: [].concat.apply([], frequentItemsets),
                executionTime: Math.round((elapsedTime[0] * 1000) + (elapsedTime[1] / 1000000))
            };
            if (cb)
                cb(result);
            resolve(result);
        });
    };
    /**
     * Returns frequent one-itemsets from a given set of transactions.
     * @param  {T[][]}              transactions Your set of transactions.
     * @return {Itemset<T>}         Frequent one-itemsets.
     */
    Apriori.prototype.getFrequentOneItemsets = function (transactions) {
        var _this = this;
        // This generates one-itemset candidates.
        var count = this._getDistinctItemsCount(transactions);
        return Object.keys(count)
            .reduce(function (ret, stringifiedItem) {
            // Returning pruned one-itemsets.
            if (count[stringifiedItem] >= transactions.length * _this._support) {
                var frequentItemset = {
                    support: count[stringifiedItem],
                    items: [JSON.parse(stringifiedItem)]
                };
                ret.push(frequentItemset);
                _this.emit('data', frequentItemset);
            }
            return ret;
        }, []);
    };
    /**
     * Returns frequent (k = n+1)-itemsets from a given array of frequent n-itemsets.
     * @param  {Itemset<T>[]} frequentNItemsets Previously determined n-itemsets.
     * @return {any}                            Frequent k-itemsets.
     */
    Apriori.prototype.getFrequentKItemsets = function (frequentNItemsets) {
        var _this = this;
        // Trivial precondition.
        if (!frequentNItemsets.length)
            return [];
        // Size of frequent itemsets we want to determine.
        var k = frequentNItemsets[0].items.length + 1;
        // Get unique items from these itemsets (Brute-force approach).
        var items = frequentNItemsets
            .reduce(function (items, itemset) { return items.concat(itemset.items); }, [])
            .filter(function (item, index, that) { return that.indexOf(item) === index; });
        // Generating candidates and counting their occurence.
        return this._getCandidatesCount(this._generateKCandidates(items, k))
            .filter(function (itemset) {
            var isFrequent = itemset.support >= _this._transactions.length * _this._support;
            if (isFrequent)
                _this.emit('data', itemset);
            return isFrequent;
        });
    };
    /**
     * Returns all combinations (itemset candidates) of size k from a given set of items.
     * @param  {T[]}    items The set of items of which you want the combinations.
     * @param  {number} k     Size of combinations you want.
     * @return {T[]}          Array of itemset candidates.
     */
    Apriori.prototype._generateKCandidates = function (items, k) {
        // Trivial preconditions over k.
        if (k > items.length || k <= 0)
            return [];
        if (k == items.length)
            return [{ items: items, support: 0 }];
        if (k == 1)
            return items.map(function (item) {
                return { items: [item], support: 0 };
            });
        var ret = [];
        var _loop_1 = function (i) {
            var head = items.slice(i, i + 1);
            this_1._generateKCandidates(items.slice(i + 1), k - 1)
                .forEach(function (tailcomb) { return ret.push({
                items: head.concat(tailcomb.items),
                support: 0
            }); });
        };
        var this_1 = this;
        for (var i = 0; i < items.length - k + 1; i++) {
            _loop_1(i);
        }
        return ret;
    };
    /**
     * Populates an Itemset array with their support in the given set of transactions
     * @param  {Itemset<T>[]} candidates The itemset candidates to populate with their support.
     * @return {Itemset<T>}              The support-populated collection of itemsets.
     */
    Apriori.prototype._getCandidatesCount = function (candidates) {
        this._transactions.forEach(function (transaction) {
            candidates.forEach(function (candidate) {
                var includesCandidate = candidate.items.every(function (item) { return transaction.indexOf(item) !== -1; });
                if (includesCandidate)
                    candidate.support += 1;
            });
        });
        return candidates;
    };
    /**
     * Returns the occurence of single items in a given set of transactions.
     * @param  {T[][]}      transactions The set of transaction.
     * @return {ItemsCount}              Count of items (stringified items as keys).
     */
    Apriori.prototype._getDistinctItemsCount = function (transactions) {
        return transactions.reduce(function (count, arr) {
            return arr.reduce(function (count, item) {
                count[JSON.stringify(item)] = (count[JSON.stringify(item)] || 0) + 1;
                return count;
            }, count);
        }, {});
    };
    return Apriori;
}(events_1.EventEmitter));
exports.Apriori = Apriori;
