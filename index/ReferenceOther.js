/**
 * Modern ES module version of ReferenceOther
 * - ES2023 style, named + default export
 * - Behavior preserved from original CommonJS implementation:
 *   - isIncludeRef(): detect '#...|' patterns
 *   - toStandard(): normalize full-width punctuation between digits (． or ： -> :)
 *
 * Note: adjust import path when integrating into your build if necessary.
 */
export class ReferenceOther {
    /**
     * @param {string|undefined} str
     * @param {1|undefined} isGb
     */
    constructor(str, isGb) {
        this.str = str;
        this.isGb = isGb;
        this.refDescription = null;
    }

    /**
     * Return true when the stored string contains a reference of form #...|
     * @returns {boolean}
     */
    isIncludeRef() {
        return this.str !== undefined && /#[^|]+\|/.test(this.str);
    }

    /**
     * Convert some full-width punctuation used in some texts into standard forms.
     * Specifically: (\d+)(?:．|：)(\d+) => $1:$2
     * This mirrors the original implementation which normalizes numeric chapter:verse separators.
     * @returns {string|undefined}
     */
    toStandard() {
        if (this.str === undefined) return this.str;
        // 全型：、點(和合本2010)． ,,, 要換回標準 :
        this.str = this.str.replace(/(\d+)(?:．|：)(\d+)/g, (_, a, b) => `${a}:${b}`);
        // 取得 str[1:-1]
        this.refDescription = this.str.match(/#([^|]+)\|/)?.[1] || null;
        return this.str;
    }
}
