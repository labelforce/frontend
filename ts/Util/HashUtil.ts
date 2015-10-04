
module Util {
    export class HashUtil {

        public static getHash() : string {
            return window.location.hash.substr(1);
        }

        public static getHashNum() : number {
            return parseInt(HashUtil.getHash());
        }

    }
}