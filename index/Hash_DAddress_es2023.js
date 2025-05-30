/**
 * ### 在 render mode 3 時，會用到
 * - 當時，mode 3 我們有一組分段資料，包含書、章、節、段落文字。另外，還有經文內容，我們需要將這些經文按照 Address 來分組，所以就會用到排序的概念，還有唯一的概念，而聖經的 Address 可以用這個表示式。
 */
export class Hash_DAddress {
    /**
     * # hash 值，可用在 Set 也可以作為 Operator < 使用，也可以轉回 Address。
     * 
     * @param {numer|object|Array<number>} bookOrObjOrArray 如果是數字，表示是 book；也可傳入 {book, chap, sec}；也可傳入 [book, chap, sec] 。
     * @param {number} [chap] 章
     * @param {number} [sec] 節
     * @returns {number} hash
     * 章，最多，150。篇詩
     * 節，最多，176。篇詩119
     * 書，最多，66。
     * sec + 1000 * chap + 1000 * 1000 * book
     * 理論上，值很大是 66,000,000
     * int32 最大值是 2,147,483,647 夠用
     */
    static toHash(bookOrObjOrArray, chap, sec){
        if (Array.isArray(bookOrObjOrArray)){
            return 1000000 * bookOrObjOrArray[0] + 1000 * bookOrObjOrArray[1] + bookOrObjOrArray[2];
        }
        
        if (typeof bookOrObjOrArray === 'number') {
            return 1000000 * bookOrObjOrArray + 1000 * chap + sec;
        }

        return 1000000 * bookOrObjOrArray.book + 1000 * bookOrObjOrArray.chap + bookOrObjOrArray.sec;

        // 章，最多，150。篇詩
        // 節，最多，176。篇詩119
        // 書，最多，66。
        // sec + 1000 * chap + 1000 * 1000 * book
        // 理論上，值很大是 66,000,000
        // int32 最大值是 2,147,483,647 夠用
    }
    /**
     * @param {number} hash 
     * @returns {Array<number>} [book, chap, sec]
     */
    static toAddress(hash){
        const sec = hash % 1000;
        const chap = Math.floor((hash % (1000000)) / 1000); 
        const book = Math.floor(hash / (1000000));
        return [book, chap, sec];
    }
}